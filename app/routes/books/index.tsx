import { createFileRoute, Link } from '@tanstack/react-router'
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { Suspense } from 'react'
import { LibriApi } from '~/lib/api'

const booksQueryOptions = (api: LibriApi) =>
  queryOptions({
    queryKey: ['books'],
    queryFn: api.getBooks,
    staleTime: Infinity,
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
    console.log('refetch')
    refetch()
  }

  return (
    <>
      <button onClick={handleClick}>Refresh books</button>
      <Suspense fallback='Loading books...'>
        <ul>
          {books.map((book) => (
            <li key={book.id}>
              <Link to={`/books/$id`} params={{ id: book.id.toString() }}>
                {book.title}
              </Link>{' '}
              by {book.author}
            </li>
          ))}
        </ul>
      </Suspense>
    </>
  )
}
