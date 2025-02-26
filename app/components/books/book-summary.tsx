import './book-summary.css'
import { Link } from '@tanstack/react-router'
import { Book } from '~/lib/types'

export function BookSummary({ book }: Readonly<{ book: Book }>) {
  const coverUrl = book.coverPath
    ? `/api/books/${book.id}/cover`
    : '/cover-placeholder.png'

  return (
    <li className='book-summary'>
      <Link to={'/books/$id'} params={{ id: book.id.toString() }}>
        <img src={coverUrl} alt='' width='150px' height='200px' />
        <span className='title'>{book.title}</span>
      </Link>{' '}
      <span className='author'>
        <a href='#'>{book.author}</a>
      </span>
    </li>
  )
}
