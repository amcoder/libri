import { vi, describe, expect, test } from 'vitest'
import { EventHandlerRequest, H3Event } from 'h3'
import { APIRoute } from './index'

describe('GET /books', () => {
  const getBookSummaries = vi.fn()
  const event = {
    context: { service: { books: { getBookSummaries } } },
  } as unknown as H3Event<EventHandlerRequest>

  const handler = APIRoute.get!

  test('calls the api', async () => {
    await handler(event)

    expect(getBookSummaries).toHaveBeenCalledOnce()
    expect(getBookSummaries).toHaveBeenCalledWith()
  })

  test('returns a list of books', async () => {
    const expected = [{ id: 1, title: 'Book 1', author: 'Author 1' }]
    getBookSummaries.mockResolvedValue(expected)

    const books = await handler(event)

    expect(books).to.be.an('array')
    expect(books).to.have.length(expected.length)
    expect(books).to.deep.equal(expected)
  })

  test('returns an empty list of books', async () => {
    const expected = []
    getBookSummaries.mockResolvedValue(expected)

    const books = await handler(event)

    expect(books).to.be.an('array')
    expect(books).to.have.length(0)
  })

  test('throws an error if the api throws an error', async () => {
    getBookSummaries.mockRejectedValue(new Error('error'))
    await expect(handler(event)).rejects.toThrow('error')
  })
})
