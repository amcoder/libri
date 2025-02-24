import './index.css'
import { createFileRoute } from '@tanstack/react-router'
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { Suspense } from 'react'
import { LibriApi } from '~/lib/api'
import { BookSummary } from '~/components/books/book-summary'

const booksQueryOptions = (api: LibriApi) =>
  queryOptions({
    queryKey: ['books'],
    queryFn: api.getBooks,
    staleTime: 1000 * 60,
  })

export const Route = createFileRoute('/books/')({
  component: Books,
  loader: ({ context }) => {
    context.queryClient.prefetchQuery(booksQueryOptions(context.api))
  },
})

export function Books() {
  const { api } = Route.useRouteContext()
  const { data: books, refetch } = useSuspenseQuery(booksQueryOptions(api))

  const handleClick = () => {
    refetch()
  }

  return (
    <>
      <button onClick={handleClick}>Refresh books</button>
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
