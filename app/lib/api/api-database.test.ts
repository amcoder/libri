import path from 'path'
import os from 'node:os'
import fs from 'node:fs/promises'
import { describe, expect, test, beforeAll } from 'vitest'
import { createApi } from './api-database'
import { LibriApi } from '.'

// TODO: The current implementation of the database is automatically filled
// with fake data. Make sure we change this test once we fix that.
describe('api-database', () => {
  let api: LibriApi

  beforeAll(async () => {
    let tmpdir = path.join(os.tmpdir(), 'unit-test-')
    tmpdir = await fs.mkdtemp(tmpdir)

    api = createApi(tmpdir)

    return async () => await fs.rm(tmpdir, { recursive: true })
  })

  describe('getBooks', () => {
    test('returns a list of books', async () => {
      const books = await api.getBooks()

      expect(books).to.be.an('array')
      expect(books).to.have.length.greaterThan(0)
    })
  })

  describe('getBook', () => {
    test('returns a book', async () => {
      const book = await api.getBook(1)

      expect(book).to.be.an('object')
      expect(book).to.have.property('id', 1)
    })
    test('returns undefined if the book does not exist', async () => {
      const book = await api.getBook(1000)

      expect(book).toBeUndefined()
    })
  })
})
