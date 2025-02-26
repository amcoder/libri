import { createApiFileRoute } from '~/lib/routing'
import { createError, eventHandler, readRawBody } from 'h3'
import { getService } from '~/lib/service'

export const APIRoute = createApiFileRoute({
  post: eventHandler(async (event) => {
    const books = getService(event).books
    const file = await readRawBody(event, false)
    if (!file)
      throw createError({
        status: 400,
        message: 'No file uploaded',
      })

    return await books.uploadBook(Buffer.from(file))
  }),
})
