import { Link } from '@tanstack/react-router'
import { BookSummary as BookSummaryType } from '~/lib/types'

export function BookSummary({ book }: Readonly<{ book: BookSummaryType }>) {
  const coverUrl = book.coverUrl ?? '/cover-placeholder.png'
  const authors = book.authors.join(' & ')
  return (
    <li className='book-summary'>
      <Link to={'/books/$id'} params={{ id: book.id.toString() }}>
        <img src={coverUrl} alt='' width='150px' height='200px' />
        <span className='title'>{book.title}</span>
      </Link>{' '}
      <span className='author'>
        <a href='#'>{authors}</a>
      </span>
    </li>
  )
}
