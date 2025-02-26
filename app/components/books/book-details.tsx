import { Book } from '~/lib/types'

export function BookDetails({ book }: Readonly<{ book: Book }>) {
  return (
    <div className='book-details'>
      <div>Title: {book.title}</div>
      <div>Author: {book.author}</div>
      <div>
        Description:{' '}
        {
          // TODO: Remove this dangerous hack
        }
        <span dangerouslySetInnerHTML={{ __html: book.description ?? '' }} />
      </div>
      <div>Series: {book.series}</div>
      <div>Series Number: {book.seriesNumber}</div>
      <div>Publisher: {book.publisher}</div>
      <div>Published: {book.published}</div>
    </div>
  )
}
