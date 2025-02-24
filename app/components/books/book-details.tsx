import { Book } from '~/lib/types'

export function BookDetails({ book }: Readonly<{ book: Book }>) {
  return (
    <div className='book-details'>
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
