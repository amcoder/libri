import path from 'path'
import fs from 'fs'
import BetterSqlite3 from 'better-sqlite3'
import { Config } from '~/config'
import { Book, NewBook } from '~/lib/types'
import { Epub } from '~/lib/epub'
import { imageMetadata } from '~/lib/image'

export function createBookService(db: BetterSqlite3.Database, config: Config) {
  return {
    getBooks,
    getBook,
    addBook,
    uploadBook,
    patchBook,
    updateBook,
    deleteBook,
  }

  function getBooks(): Promise<Book[]> {
    const books = db.prepare('SELECT * FROM book').all() as Book[]
    return Promise.resolve(books)
  }

  function getBook(id: number): Promise<Book> {
    const book = db.prepare('SELECT * FROM book WHERE id = ?').get(id) as Book
    return Promise.resolve(book)
  }

  function addBook(book: NewBook): Promise<Book> {
    const result = db
      .prepare(
        `INSERT INTO book (title, author, description, tags, publisher, published, language, coverPath, filePath)
       VALUES (@title, @author, @description, @tags, @publisher, @published, @language, @coverPath, @filePath)`,
      )
      .run({
        ...book,
        tags: book.tags?.join(','),
        coverPath: book.coverPath ?? null,
        filePath: book.filePath ?? null,
      })

    return getBook(result.lastInsertRowid as number)
  }

  async function uploadBook(data: Buffer | File): Promise<Book> {
    const buffer =
      data instanceof File ? Buffer.from(await data.arrayBuffer()) : data

    console.log('uploading book')
    const epub = new Epub(buffer)
    console.log('loaded', epub.title.displayValue)

    const newBook: NewBook = {
      title: epub.title.displayValue,
      author: epub.authors[0],
      description: epub.description!,
      tags: epub.subjects.map((s) => s.value),
      publisher: epub.publisher!,
      published: epub.publicationDate?.toUTCString(),
      language: epub.primaryLanguage!,
    }

    const book = await addBook(newBook)

    if (epub.coverImage) {
      const imageMeta = imageMetadata(epub.coverImage)
      if (imageMeta) {
        book.coverPath = path.join(
          config.coverDir,
          book.id.toString(),
          `cover.${imageMeta.extension}`,
        )
        fs.mkdirSync(path.dirname(book.coverPath), { recursive: true })
        fs.writeFileSync(book.coverPath, epub.coverImage)
      }
    }

    book.filePath = path.join(
      config.bookDir,
      book.id.toString(),
      `${book.title}.epub`,
    )
    fs.mkdirSync(path.dirname(book.filePath), { recursive: true })
    epub.write(book.filePath)

    patchBook(book.id, {
      coverPath: book.coverPath,
      filePath: book.filePath,
    })

    return book
  }

  function patchBook(id: number, book: Partial<Book>): Promise<Book> {
    const keys = Object.entries(book)
      .filter(([k, v]) => k !== 'id' && v !== undefined)
      .map(([k]) => k)
    if (keys.length === 0) return Promise.resolve(getBook(id))

    const set = keys.map((k) => `${k} = @${k}`).join(', ')

    console.log('updating keys', keys)
    console.log(book)
    db.prepare(`UPDATE book SET ${set} WHERE id = @id`).run({ ...book, id: id })

    return getBook(id)
  }

  function updateBook(id: number, book: Book): Promise<Book> {
    db.prepare(
      `UPDATE book SET title = @title, author = @author, description = @description, series = @series, seriesNumber = @seriesNumber, tags = @tags, publisher = @publisher, published = @published, language = @language, coverPath = @coverPath, filePath = @filePath WHERE id = @id`,
    ).run(book)
    return getBook(id)
  }

  function deleteBook(id: number): Promise<void> {
    db.prepare(`DELETE FROM book WHERE id = ?`).run(id)
    return Promise.resolve()
  }
}
