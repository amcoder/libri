import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { BookDetails } from '~/components/books/book-details'
import { LibriService } from '~/lib/service'

const bookQueryOptions = ({ books }: LibriService, id: number) =>
  queryOptions({
    queryKey: ['book', id],
    queryFn: () => books.getBook(id),
    staleTime: 60 * 1000,
  })

export const Route = createFileRoute('/books/$id')({
  component: Book,
  loader: ({ context, params }) => {
    context.queryClient.prefetchQuery(
      bookQueryOptions(context.service, +params.id),
    )
  },
})

function Book() {
  const { service } = Route.useRouteContext()
  const { id } = Route.useParams()
  const { data: book } = useSuspenseQuery(bookQueryOptions(service, +id))

  return (
    <>
      <Link to='/books'>Books</Link>
      {(book && <BookDetails book={book} />) || <div>Book not found</div>}
    </>
  )
}
