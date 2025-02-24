import { createApiFileRoute } from '~/lib/routing'
import { eventHandler } from 'h3'

export const APIRoute = createApiFileRoute({
  get: eventHandler(async (event) => {
    const books = await event.context.api.getBooks()
    return books
  }),
})
