import { useRef } from 'react'
import { Book } from '~/lib/types'
import { Route } from '~/routes/__root'

const VALID_EXTENSIONS = '.epub'

export function UploadButton() {
  const service = Route.useRouteContext().service
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const operations: Promise<Book>[] = []
    for (const file of files) {
      operations.push(service.books.uploadBook(file))
    }
    const books = await Promise.all(operations)
    console.log(books)
  }

  return (
    <div>
      <input
        type='file'
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept={VALID_EXTENSIONS}
        multiple
        hidden
      />
      <button type='button' onClick={() => fileInputRef.current?.click()}>
        Upload
      </button>
    </div>
  )
}
