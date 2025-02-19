import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { LibriApi } from '~/lib/api'

const bookQueryOptions = (api: LibriApi, id: number) =>
  queryOptions({
    queryKey: ['book', id],
    queryFn: () => api.getBook(id),
    staleTime: Infinity,
  })

export const Route = createFileRoute('/books/$id')({
  component: Book,
  loader: ({ context, params }) => {
    context.queryClient.prefetchQuery(bookQueryOptions(context.api, +params.id))
  },
})

function Book() {
  const { api } = Route.useRouteContext()
  const { id } = Route.useParams()
  const { data: book } = useSuspenseQuery(bookQueryOptions(api, +id))

  return (
    <div>
      <Link to='/books'>Books</Link>
      <div>Title: {book.title}</div>
      <div>Description: {book.description}</div>
      <div>Author: {book.author}</div>
      <div>Series: {book.series}</div>
      <div>Series Number: {book.seriesNumber}</div>
      <div>Genre: {book.genre}</div>
      <div>ISBN: {book.isbn}</div>
      <div>Publisher: {book.publisher}</div>
      <div>Published: {book.published}</div>
    </div>
  )
}
