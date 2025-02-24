import './index.css'
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
        <ul className='books'>
          {books.map((book) => (
            <li className='book' key={book.id}>
              <Link to={`/books/$id`} params={{ id: book.id.toString() }}>
                <img src='cover.jpg' alt='' width='150px' height='200px' />
                <span className='title'>{book.title}</span>
              </Link>{' '}
              <span className='author'>
                <a href='#'>{book.author}</a>
              </span>
            </li>
          ))}
        </ul>
      </Suspense>
    </>
  )
}
