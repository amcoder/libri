import { json } from '@tanstack/start'
import { createAPIFileRoute } from '@tanstack/start/api'
import * as api from '~/lib/api/api-database'

export const APIRoute = createAPIFileRoute('/api/books')({
  GET: async () => {
    const books = await api.getBooks()
    return json(books)
  },
})
