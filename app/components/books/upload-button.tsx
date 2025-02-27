import { useRef } from 'react'
import { BookDetails } from '~/lib/types'
import { useLibriService } from '~/components/service-context'

const VALID_EXTENSIONS = '.epub'

export function UploadButton() {
  const service = useLibriService()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const operations: Promise<BookDetails>[] = []
    for (const file of files) {
      operations.push(service!.books.uploadBook(file))
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
