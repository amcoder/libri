import { createFileRoute } from '@tanstack/react-router'
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { Suspense } from 'react'
import { LibriService } from '~/lib/service'
import { BookSummary } from '~/components/books/book-summary'

const booksQueryOptions = ({ books }: LibriService) =>
  queryOptions({
    queryKey: ['books'],
    queryFn: books.getBookSummaries,
    staleTime: 1000 * 60,
  })

export const Route = createFileRoute('/books/')({
  component: Books,
  loader: ({ context }) => {
    context.queryClient.prefetchQuery(booksQueryOptions(context.service))
  },
})

export function Books() {
  const { service } = Route.useRouteContext()
  const { data: books } = useSuspenseQuery(booksQueryOptions(service))

  return (
    <>
      <Suspense fallback='Loading books...'>
        <ul className='books'>
          {books.map((book) => (
            <BookSummary book={book} key={book.id} />
          ))}
        </ul>
      </Suspense>
    </>
  )
}
