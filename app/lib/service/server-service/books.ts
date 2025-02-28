import path from 'path'
import fs from 'fs'
import BetterSqlite3 from 'better-sqlite3'
import sharp from 'sharp'
import etag from 'etag'
import { Config } from '~/config'
import {
  BookSummary,
  BookDetails,
  BookAdd,
  BookEdit,
  Author,
  BookFile,
  BookFileAdd,
} from '~/lib/types'
import { Epub } from '~/lib/epub'
import { imageMetadata } from '~/lib/image'

export function createBookService(db: BetterSqlite3.Database, config: Config) {
  return {
    getBookSummaries,
    getBook,
    addBook,
    uploadBook,
    patchBook,
    updateBook,
    deleteBook,
    getFileMetadata,
    getFileData,
    addFile,
  }

  function getBookSummaries(): Promise<BookSummary[]> {
    const rows = db
      .prepare(
        `
          SELECT book.id, book.title, book.fileAs, json_group_array(author.name) as authors, coverLargeId, coverSmallId
          FROM book
            LEFT JOIN book_author ON book.id = book_author.bookId
            LEFT JOIN author ON book_author.authorId = author.id
          GROUP BY book.id
          ORDER BY book.fileAs
        `,
      )
      .all()

    const books = rows.map(
      (row: Record<string, unknown>): BookSummary => ({
        id: row['id'] as number,
        title: row['title'] as string,
        fileAs: row['fileAs'] as string,
        authors: JSON.parse(row['authors'] as string),
        coverLargeUrl: row['coverLargeId']
          ? `/api/file/${row['coverLargeId']}`
          : undefined,
        coverSmallUrl: row['coverSmallId']
          ? `/api/file/${row['coverSmallId']}`
          : undefined,
      }),
    )

    return Promise.resolve(books)
  }

  async function getBook(id: number): Promise<BookDetails | null> {
    const row = db
      .prepare(
        `
        SELECT
          book.id, book.title, book.fileAs,
          json_group_array(author.name) as authors,
          book.description, series.name as series, book.seriesIndex,
          book.tags, book.publisher, book.publishedOn,
          book.coverLargeId, book.coverSmallId
        FROM book
          LEFT JOIN book_author ON book.id = book_author.bookId
          LEFT JOIN author ON book_author.authorId = author.id
          LEFT JOIN series ON book.seriesId = series.id
        WHERE book.id = ?
        GROUP BY book.id
      `,
      )
      .get(id) as Record<string, unknown>

    if (!row) return null

    const book: BookDetails = {
      id: row['id'] as number,
      title: row['title'] as string,
      authors: JSON.parse(row['authors'] as string),
      description: row['description'] as string,
      series: row['series'] as string,
      seriesIndex: row['seriesIndex'] as number,
      tags: JSON.parse(row['tags'] as string),
      publisher: row['publisher'] as string,
      publishedOn: row['publishedOn'] as string,
      coverLargeUrl: row['coverLargeId']
        ? `/api/file/${row['coverLargeId']}`
        : undefined,
      coverSmallUrl: row['coverSmallId']
        ? `/api/file/${row['coverSmallId']}`
        : undefined,
    }

    return book
  }

  async function addBook(book: BookAdd): Promise<BookDetails> {
    const txn = db.transaction((book: BookAdd) => {
      const result = db
        .prepare(
          `INSERT INTO book (title, fileAs, description, seriesId, seriesIndex, tags, publisher, publishedOn, coverLargeId, coverSmallId)
                VALUES (@title, @fileAs, @description, @seriesId, @seriesIndex, json(@tags), @publisher, @publishedOn, @coverLargeId, @coverSmallId)`,
        )
        .run({
          ...book,
          seriesId: book.series?.id,
          tags: JSON.stringify(book.tags),
        })

      const bookId = result.lastInsertRowid as number

      book.authors.forEach(({ id: authorId }) => {
        db.prepare(
          `INSERT INTO book_author (bookId, authorId)
           VALUES (@bookId, @authorId)`,
        ).run({ bookId, authorId })
      })

      return bookId
    })

    const bookId = txn(book) as number

    return (await getBook(bookId))!
  }

  async function uploadBook(data: Buffer | File): Promise<BookDetails> {
    const buffer =
      data instanceof File ? Buffer.from(await data.arrayBuffer()) : data

    const epub = new Epub(buffer)

    const authors = await Promise.all(
      epub.creators
        .filter(
          (c) =>
            !c.properties?.['role'] || c.properties['role']?.value === 'aut',
        )
        .map((c) => ({
          name: c.value,
          fileAs: c.properties?.['file-as']?.value,
        }))
        .map(async (author) => {
          return await getOrCreateAuthor(author.name, author.fileAs)
        }),
    )

    let coverSmallId: number | undefined = undefined
    let coverLargeId: number | undefined = undefined

    if (epub.coverImage) {
      const imageMeta = imageMetadata(epub.coverImage)
      if (imageMeta) {
        const coverFile: BookFileAdd = {
          name: `${epub.title.displayValue}-cover.${imageMeta.extension}`,
          mediaType: imageMeta.mediaType,
          data: epub.coverImage,
          etag: etag(epub.coverImage),
        }
        coverLargeId = await addFile(coverFile).then((f) => f.id)

        const coverThumbnailFile: BookFileAdd = {
          name: `${epub.title.displayValue}-cover-thumbnail.${imageMeta.extension}`,
          mediaType: imageMeta.mediaType,
          data: await sharp(epub.coverImage).resize(150).toBuffer(),
          etag: etag(await sharp(epub.coverImage).resize(150).toBuffer()),
        }
        coverSmallId = await addFile(coverThumbnailFile).then((f) => f.id)
      }
    }

    const newBook: BookAdd = {
      title: epub.title.displayValue,
      fileAs: epub.title.sortValue ?? epub.title.displayValue,
      authors: authors,
      description: epub.description!,
      series: undefined,
      seriesIndex: undefined,
      tags: epub.subjects.map((s) => s.value),
      publisher: epub.publisher!,
      publishedOn: epub.publicationDate?.toUTCString(),
      coverLargeId,
      coverSmallId,
    }

    const book = await addBook(newBook)

    const filePath = path.join(
      config.bookDir,
      book.id.toString(),
      `${book.title}.epub`,
    )
    fs.mkdirSync(path.dirname(filePath), { recursive: true })
    epub.write(filePath)

    // patchBook(book.id, { filePath })

    return book
  }

  async function patchBook(
    id: number,
    book: Partial<BookEdit>,
  ): Promise<BookDetails> {
    const keys = Object.entries(book)
      .filter(([k, v]) => k !== 'id' && v !== undefined)
      .map(([k]) => k)
    if (keys.length === 0) return (await getBook(id))!

    const set = keys.map((k) => `${k} = @${k}`).join(', ')

    db.prepare(`UPDATE book SET ${set} WHERE id = @id`).run({ ...book, id: id })

    return (await getBook(id))!
  }

  async function updateBook(id: number, book: BookEdit): Promise<BookDetails> {
    db.prepare(
      `UPDATE book SET
          title = @title,
          fileAs = @fileAs,
          authors = @authors,
          description = @description,
          seriesId = @seriesId,
          seriesIndex = @seriesIndex,
          tags = @tags,
          publisher = @publisher,
          publishedOn = @publishedOn,
          cover = @cover,
          coverMediaType = @coverMediaType,
          filePath = @filePath
        WHERE id = @id`,
    ).run(book)
    return (await getBook(id))!
  }

  function deleteBook(id: number): Promise<void> {
    db.prepare(`DELETE FROM book WHERE id = ?`).run(id)
    return Promise.resolve()
  }

  function getFileMetadata(id: number): Promise<BookFile> {
    const file = db
      .prepare(
        `SELECT id, name, mediaType, modifiedAt, etag
        FROM file WHERE id = ?`,
      )
      .get(id) as BookFile
    return Promise.resolve(file)
  }

  function getFileData(id: number): Promise<Buffer> {
    const file = db
      .prepare(`SELECT data FROM file WHERE id = ?`)
      .pluck()
      .get(id) as Buffer

    return Promise.resolve(file)
  }

  function addFile(file: BookFileAdd): Promise<BookFile> {
    const result = db
      .prepare(
        `INSERT INTO file (mediaType, name, etag, data)
        VALUES (@mediaType, @name, @etag, @data)`,
      )
      .run(file)

    return getFileMetadata(result.lastInsertRowid as number)
  }

  function getAuthor(id: number): Promise<Author> {
    const author = db
      .prepare('SELECT id, name, fileAs FROM author WHERE id = ?')
      .get(id) as Author
    return Promise.resolve(author)
  }

  function findAuthor(name: string): Promise<Author | null> {
    const author = db
      .prepare('SELECT id, name, fileAs FROM author WHERE name = ?')
      .get(name) as Author
    return Promise.resolve(author)
  }

  async function getOrCreateAuthor(
    name: string,
    fileAs?: string,
  ): Promise<Author> {
    const author = await findAuthor(name)
    if (author) return Promise.resolve(author)

    if (!fileAs) {
      const parts = name.split(' ').map((p) => p.trim())
      const lastName = parts.pop()
      const firstNames = parts.join(' ').trim()
      fileAs = `${lastName}, ${firstNames}`
    }

    const result = db
      .prepare(
        `INSERT INTO author (name, fileAs)
       VALUES (@name, @fileAs)`,
      )
      .run({
        name,
        fileAs,
      })

    return getAuthor(result.lastInsertRowid as number)
  }
}
