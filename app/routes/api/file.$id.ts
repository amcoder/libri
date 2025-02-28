import { z } from 'zod'
import { createApiFileRoute } from '~/lib/routing'
import {
  eventHandler,
  getValidatedRouterParams,
  createError,
  setHeader,
  handleCacheHeaders,
} from 'h3'
import contentDisposition from 'content-disposition'
import { getService } from '~/lib/service'

export const APIRoute = createApiFileRoute({
  get: eventHandler(async (event) => {
    const books = getService(event).books

    const paramSchema = z.object({ id: z.coerce.number().int() })
    const { id } = await getValidatedRouterParams(event, paramSchema.parse)

    const metadata = await books.getFileMetadata(id)
    if (!metadata)
      throw createError({
        status: 404,
        message: `File not found for book with id '${event.context.params?.id}'`,
      })

    const cached = handleCacheHeaders(event, {
      etag: metadata.etag,
      modifiedTime: metadata.modifiedAt,
    })
    if (cached) return

    const data = await books.getFileData(id)

    setHeader(event, 'content-type', metadata.mediaType)
    setHeader(
      event,
      'content-disposition',
      contentDisposition(metadata.name, { type: 'inline' }),
    )
    return data
  }),
})
