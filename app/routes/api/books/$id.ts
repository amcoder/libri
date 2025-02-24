import { z } from 'zod'
import { createApiFileRoute } from '~/lib/routing'
import { eventHandler, getValidatedRouterParams, createError } from 'h3'

export const APIRoute = createApiFileRoute({
  get: eventHandler(async (event) => {
    const paramSchema = z.object({ id: z.coerce.number().int() })
    const { id } = await getValidatedRouterParams(event, paramSchema.parse)

    const book = await event.context.api.getBook(id)
    if (!book)
      throw createError({
        status: 404,
        message: `Book with id '${event.context.params?.id}' not found`,
      })

    return book
  }),
})
