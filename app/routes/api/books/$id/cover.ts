import { z } from 'zod'
import { createApiFileRoute } from '~/lib/routing'
import {
  eventHandler,
  getValidatedRouterParams,
  createError,
  setHeader,
} from 'h3'
import { getService } from '~/lib/service'

export const APIRoute = createApiFileRoute({
  get: eventHandler(async (event) => {
    const books = getService(event).books
    const paramSchema = z.object({ id: z.coerce.number().int() })
    const { id } = await getValidatedRouterParams(event, paramSchema.parse)

    const cover = await books.getCover(id)
    if (!cover?.data)
      throw createError({
        status: 404,
        message: `Cover not found for book with id '${event.context.params?.id}'`,
      })

    setHeader(event, 'content-type', cover.mediaType)
    return cover.data
  }),
})
