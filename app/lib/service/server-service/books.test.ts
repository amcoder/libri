import path from 'path'
import os from 'node:os'
import fs from 'node:fs/promises'
import { openDatabase } from '~/lib/database'
import { describe, expect, test, beforeAll } from 'vitest'
import { createBookService } from './books'

// TODO: The current implementation of the database is automatically filled
// with fake data. Make sure we change this test once we fix that.
describe('api-database', () => {
  let service: ReturnType<typeof createBookService>
  let db: ReturnType<typeof openDatabase>

  beforeAll(async () => {
    let tmpdir = path.join(os.tmpdir(), 'unit-test-')
    tmpdir = await fs.mkdtemp(tmpdir)

    db = openDatabase(tmpdir)
    const config = {
      dataDir: tmpdir,
      coverDir: path.join(tmpdir, 'covers'),
      bookDir: path.join(tmpdir, 'books'),
    }

    service = createBookService(db, config)

    return async () => await fs.rm(tmpdir, { recursive: true })
  })

  describe('getBooks', () => {
    test('returns a list of books', async () => {
      const books = await service.getBooks()

      expect(books).to.be.an('array')
      expect(books).to.have.length(0)
    })
  })

  describe('getBook', () => {
    test.skip('returns a book', async () => {
      const book = await service.getBook(1)

      expect(book).to.be.an('object')
      expect(book).to.have.property('id', 1)
    })

    test('returns undefined if the book does not exist', async () => {
      const book = await service.getBook(1000)

      expect(book).toBeUndefined()
    })
  })
})
