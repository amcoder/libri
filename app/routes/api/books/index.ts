import { createApiFileRoute } from '~/lib/routing'
import { eventHandler } from 'h3'
import { getApi } from '~/lib/api'

export const APIRoute = createApiFileRoute({
  get: eventHandler(async (event) => {
    const api = getApi(event)
    return await api.getBooks()
  }),
})
