import { json } from '@tanstack/start'
import { createAPIFileRoute } from '@tanstack/start/api'
import * as api from '~/lib/api/api-database'

export const APIRoute = createAPIFileRoute('/api/books/$id')({
  GET: async ({ params: { id } }) => {
    const book = await api.getBook(+id)
    return json(book)
  },
})
