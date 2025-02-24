import { vi, describe, expect, test, beforeEach } from 'vitest'
import { createError, EventHandlerRequest, H3Event } from 'h3'
import { APIRoute } from './$id'

describe('GET /books/$id', () => {
  const getBook = vi.fn()
  const event = {
    context: { api: { getBook } },
  } as unknown as H3Event<EventHandlerRequest>

  const handler = APIRoute.get!

  beforeEach(() => {
    event.context.params = undefined
  })

  test('calls the api', async () => {
    event.context.params = { id: '1' }
    const expected = { id: 1, title: 'Book 1', author: 'Author 1' }
    getBook.mockResolvedValue(expected)

    await handler(event)

    expect(getBook).toHaveBeenCalledOnce()
    expect(getBook).toHaveBeenCalledWith(1)
  })

  test('returns a book', async () => {
    event.context.params = { id: '1' }
    const expected = { id: 1, title: 'Book 1', author: 'Author 1' }
    getBook.mockResolvedValue(expected)

    const book = await handler(event)

    expect(book).to.deep.equal(expected)
  })

  test('throws a 404 error if the book is not found', async () => {
    event.context.params = { id: '1' }
    getBook.mockResolvedValue(undefined)

    await expect(handler(event)).rejects.toThrow(
      createError({ status: 404, message: "Book with id '1' not found" }),
    )
  })

  test('throws a validation error if the id is not set', async () => {
    await expect(handler(event)).rejects.toThrow(
      'Expected number, received nan',
    )
  })

  test('throws a validation error if the id is not a number', async () => {
    event.context.params = { id: 'foo' }
    await expect(handler(event)).rejects.toThrow(
      'Expected number, received nan',
    )
  })

  test('throws an error if the api throws an error', async () => {
    event.context.params = { id: '1' }
    getBook.mockRejectedValue(new Error('error'))

    await expect(handler(event)).rejects.toThrow('error')
  })
})
