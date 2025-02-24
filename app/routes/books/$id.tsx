import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { BookDetails } from '~/components/books/book-details'
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
    <>
      <Link to='/books'>Books</Link>
      <BookDetails book={book} />
    </>
  )
}
