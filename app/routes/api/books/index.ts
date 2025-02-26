import { createApiFileRoute } from '~/lib/routing'
import { eventHandler } from 'h3'
import { getService } from '~/lib/service'

export const APIRoute = createApiFileRoute({
  get: eventHandler(async (event) => {
    const books = getService(event).books
    return await books.getBooks()
  }),
})
