import { createFileRoute } from '@tanstack/react-router'
import { useRef, useState } from 'react'
import { BookSummary } from '~/components/books/book-summary'
import { BookDetails } from '~/lib/types'

const VALID_EXTENSIONS = '.epub'

export const Route = createFileRoute('/books/upload')({
  component: Upload,
})

export function Upload() {
  const { service } = Route.useRouteContext()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [books, setBooks] = useState<BookDetails[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [max, setMax] = useState(0)

  const uploadFiles = async (files: FileList | null) => {
    if (!files?.length) return

    let loopProgress = 0
    let loopBooks = books

    setUploading(true)
    setProgress(0)
    setMax(files.length)

    for (const file of files) {
      if (file.type !== 'application/epub+zip') continue
      const book = await service.books.uploadBook(file)
      setProgress(++loopProgress)
      loopBooks = [...loopBooks, book]
      setBooks(loopBooks)
    }
    setUploading(false)
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.currentTarget.style.backgroundColor = 'lightgray'

    const files = e.dataTransfer?.files
    await uploadFiles(files)
  }

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.currentTarget.style.backgroundColor = 'lightblue'
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.currentTarget.style.backgroundColor = 'lightgray'
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files
    await uploadFiles(files)
  }

  return (
    <>
      {(!uploading && (
        <>
          <div
            className='upload-target'
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
          >
            Drop files here or{' '}
            <a href='#' onClick={handleUploadClick}>
              choose files
            </a>
            .
          </div>
          <input
            type='file'
            ref={fileInputRef}
            onChange={handleFileInputChange}
            accept={VALID_EXTENSIONS}
            multiple
            hidden
          />
        </>
      )) || (
        <div className='upload-progress'>
          Uploading {progress}/{max} <progress value={progress} max={max} />
        </div>
      )}
      <ul className='books'>
        {books.map((book) => (
          <BookSummary book={book} key={book.id} />
        ))}
      </ul>
    </>
  )
}
