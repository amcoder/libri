import { BookDetails as BookDetailsType } from '~/lib/types'

export function BookDetails({ book }: Readonly<{ book: BookDetailsType }>) {
  const authors = book.authors.join(' & ')
  return (
    <>
      <h1>{book.title}</h1>
      <img src={book.coverUrl} alt='' width='150px' height='200px' />
      <div className='book-details'>
        <div>Title: {book.title}</div>
        <div>By: {authors}</div>
        <div>
          Description:{' '}
          {
            // TODO: Remove this dangerous hack
          }
          <span dangerouslySetInnerHTML={{ __html: book.description ?? '' }} />
        </div>
        <div>Series: {book.series}</div>
        <div>Tags: {book.tags.join(', ')}</div>
        <div>Series Number: {book.seriesIndex}</div>
        <div>Publisher: {book.publisher}</div>
        <div>Published: {book.publishedOn}</div>
      </div>
    </>
  )
}
