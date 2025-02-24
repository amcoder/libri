import { createApiFileRoute } from '~/lib/routing'
import { defineEventHandler } from 'h3'

export const APIRoute = createApiFileRoute({
  get: defineEventHandler(async (event) => {
    const books = await event.context.api.getBooks()
    return books
  }),
})
