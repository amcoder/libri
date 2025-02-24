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

describe('Base', () => {
  describe('Epub', () => {
    test('can read epub', async () => {
      const book = new Epub('testdata/trees.epub')

      const expectedModified = new Date('2025-02-23T01:21:14Z')
      expect(book.modified?.getTime()).to.eq(
        expectedModified.getTime(),
        `expected ${book.modified} to equal ${expectedModified}`,
      )
      expect(book.version).to.eq('3.0')
      expect(book.title.displayValue).to.eq('Trees')
      expect(book.properties['test-property'].value).to.eq('test value')
      console.dir(book.properties, { depth: null })
      book.properties['cover']
      console.dir(book.properties, { depth: null })
      expect(book.coverImage).not.to.be.null
    })

    test('can write epub', async ({ tmpdir }) => {
      const book = new Epub('testdata/trees.epub')
      book.title = 'New Title: Subtitle'
      expect(book.title.displayValue).to.eq('New Title: Subtitle')

      const newFile = path.join(tmpdir, 'trees.epub')
      book.write(newFile)

      const newBook = new Epub(newFile)
      expect(newBook.title.displayValue).to.eq('New Title: Subtitle')
    })

    test('setting cover image to non-image fails', async () => {
      const book = new Epub('testdata/trees.epub')

      const image = Buffer.from([0x00, 0x01, 0x02, 0x03])
      expect(() => {
        book.coverImage = image
      }).to.throw('Cover image is not an image')
    })

    test('can change cover image', async ({ tmpdir }) => {
      const book = new Epub('testdata/trees.epub')
      const image = Buffer.from([0x89, 0x50, 0x4e, 0x47])
      book.coverImage = image
      expect(book.coverImage?.toString('hex')).to.eq(image.toString('hex'))

      const newFile = path.join(tmpdir, 'trees.epub')
      book.write(newFile)

      const newBook = new Epub(newFile)
      expect(newBook.coverImage?.toString('hex')).to.eq(image.toString('hex'))
    })

    test('can remove cover image', async ({ tmpdir }) => {
      const book = new Epub('testdata/trees.epub')
      book.coverImage = null
      expect(book.coverImage).to.be.null

      const newFile = path.join(tmpdir, 'trees.epub')
      book.write(newFile)

      const newBook = new Epub(newFile)
      expect(newBook.coverImage).to.be.null
    })
  })
})
