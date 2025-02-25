/* eslint-disable @typescript-eslint/no-unused-expressions */
import os from 'node:os'
import fs from 'node:fs/promises'
import path from 'node:path'
import { describe, test as _test, expect } from 'vitest'
import { Epub } from '.'

const test = _test.extend<{ tmpdir: string }>({
  // eslint-disable-next-line no-empty-pattern
  tmpdir: async ({}, use) => {
    let tmpdir = path.join(os.tmpdir(), 'unit-test-')
    tmpdir = await fs.mkdtemp(tmpdir)
    await use(tmpdir)
    await fs.rm(tmpdir, { recursive: true })
  },
})

describe('Epub', () => {
  test('can read epub', async () => {
    const book = new Epub('testdata/test.epub')

    // TODO: the book editor keeps changing the modified date
    // uncomment once book stabilizes
    //
    // const expectedModified = new Date('2025-02-23T01:21:14Z')
    // expect(book.modified?.getTime()).to.eq(
    //   expectedModified.getTime(),
    //   `expected ${book.modified} to equal ${expectedModified}`,
    // )

    expect(book.version).to.eq('3.0')

    expect(book.title.displayValue).to.eq('The Test Book: Part Deux')
    expect(book.title.sortValue).to.eq('Test Book, The: Part Deux')

    expect(book.identifiers).to.have.length(1)
    expect(book.identifiers[0].value).to.eq('test-identifier')

    expect(book.uniqueIdentifier).to.eq('test-identifier')

    expect(book.creators).to.have.length(1)
    expect(book.creators[0].value).to.eq('John Smith')
    expect(book.creators[0].properties['role'].value).to.eq('aut')
    expect(book.authors).to.have.length(1)
    expect(book.authors[0]).to.eq('John Smith')

    expect(book.contributors).to.have.length(0)

    const expectedPublicationDate = new Date('2025-02-24')
    expect(book.publicationDate?.getTime()).to.eq(
      expectedPublicationDate.getTime(),
      `expected ${book.publicationDate} to equal ${expectedPublicationDate}`,
    )

    expect(book.publisher).to.eq('The Publisher')

    expect(book.description).to.eq('The Description')

    expect(book.languages).to.have.length(1)
    expect(book.languages[0].value).to.eq('en')

    expect(book.primaryLanguage).to.eq('en')

    expect(book.subjects).to.have.length(2)
    expect(book.subjects[0].value).to.eq('Subject 1')
    expect(book.subjects[1].value).to.eq('Subject 2')

    expect(book.properties['test-property'].value).to.eq('test-value')

    expect(book.coverImage).not.to.be.null
  })

  test('can write epub', async ({ tmpdir }) => {
    const book = new Epub('testdata/test.epub')
    book.title = 'New Title: Subtitle'
    expect(book.title.displayValue).to.eq('New Title: Subtitle')

    const newFile = path.join(tmpdir, 'test.epub')
    book.write(newFile)

    const newBook = new Epub(newFile)
    expect(newBook.title.displayValue).to.eq('New Title: Subtitle')
  })

  test('setting cover image to non-image fails', async () => {
    const book = new Epub('testdata/test.epub')

    const image = Buffer.from([0x00, 0x01, 0x02, 0x03])
    expect(() => {
      book.coverImage = image
    }).to.throw('Cover image is not an image')
  })

  test('can change cover image', async ({ tmpdir }) => {
    const book = new Epub('testdata/test.epub')
    const image = Buffer.from([0x89, 0x50, 0x4e, 0x47])
    book.coverImage = image
    expect(book.coverImage?.toString('hex')).to.eq(image.toString('hex'))

    const newFile = path.join(tmpdir, 'test.epub')
    book.write(newFile)

    const newBook = new Epub(newFile)
    expect(newBook.coverImage?.toString('hex')).to.eq(image.toString('hex'))
  })

  test('can remove cover image', async ({ tmpdir }) => {
    const book = new Epub('testdata/test.epub')
    book.coverImage = null
    expect(book.coverImage).to.be.null

    const newFile = path.join(tmpdir, 'test.epub')
    book.write(newFile)

    const newBook = new Epub(newFile)
    expect(newBook.coverImage).to.be.null
  })
})
