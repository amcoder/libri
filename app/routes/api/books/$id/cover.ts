import { z } from 'zod'
import { createApiFileRoute } from '~/lib/routing'
import {
  eventHandler,
  getValidatedRouterParams,
  createError,
  setHeader,
} from 'h3'
import { getService } from '~/lib/service'
import fs from 'fs'

export const APIRoute = createApiFileRoute({
  get: eventHandler(async (event) => {
    const books = getService(event).books
    const paramSchema = z.object({ id: z.coerce.number().int() })
    const { id } = await getValidatedRouterParams(event, paramSchema.parse)

    const book = await books.getBook(id)
    if (!book)
      throw createError({
        status: 404,
        message: `Book with id '${event.context.params?.id}' not found`,
      })

    if (!book.coverPath)
      throw createError({
        status: 404,
        message: `Book with id '${event.context.params?.id}' has no cover`,
      })

    setHeader(event, 'content-type', 'image/jpeg')
    return fs.createReadStream(book.coverPath)
  }),
})
