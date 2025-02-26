import { vi, beforeEach, describe, expect, test } from 'vitest'
import * as api from './books'

describe('api-web', () => {
  const fetch = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    const original = global.fetch
    global.fetch = fetch
    return () => {
      global.fetch = original
    }
  })

  describe('getBooks', () => {
    test('calls the api', async () => {
      fetch.mockResolvedValueOnce(new Response(JSON.stringify([{}])))

      await api.getBooks()

      expect(fetch).toHaveBeenCalledOnce()
      expect(fetch).toHaveBeenCalledWith('/api/books')
    })

    test('returns a list of books', async () => {
      const expected = [{ id: 1, title: 'Book 1', author: 'Author 1' }]
      fetch.mockResolvedValueOnce(new Response(JSON.stringify(expected)))

      const books = await api.getBooks()

      expect(books).to.be.an('array')
      expect(books).to.have.length(expected.length)
      expect(books).to.deep.equal(expected)
    })

    test('throws an error if the api throws an error', async () => {
      fetch.mockRejectedValueOnce(new Error('error'))

      await expect(api.getBooks()).rejects.toThrow('error')
    })
  })

  describe('getBook', () => {
    test('calls the api', async () => {
      fetch.mockResolvedValueOnce(new Response(JSON.stringify({})))

      await api.getBook(1)

      expect(fetch).toHaveBeenCalledOnce()
      expect(fetch).toHaveBeenCalledWith('/api/books/1')
    })

    test('returns a book', async () => {
      const expected = { id: 1, title: 'Book 1', author: 'Author 1' }
      fetch.mockResolvedValueOnce(new Response(JSON.stringify(expected)))

      const book = await api.getBook(1)

      expect(book).to.deep.equal(expected)
    })

    test('throws an error if the api throws an error', async () => {
      fetch.mockRejectedValueOnce(new Error('error'))

      await expect(api.getBook(1)).rejects.toThrow('error')
    })
  })
})
