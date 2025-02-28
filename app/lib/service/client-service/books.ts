import {
  BookAdd,
  BookDetails,
  BookEdit,
  BookFile,
  BookFileAdd,
  BookSummary,
} from '~/lib/types'

export async function getBookSummaries(): Promise<BookSummary[]> {
  const result = await fetch('/api/books')
  return await result.json()
}

export async function getBook(id: number): Promise<BookDetails> {
  const result = await fetch(`/api/books/${id}`)
  return await result.json()
}

export async function addBook(book: BookAdd): Promise<BookDetails> {
  const result = await fetch('/api/books', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(book),
  })
  return await result.json()
}

export async function uploadBook(data: Buffer | File): Promise<BookDetails> {
  const file = data as File
  const result = await fetch('/api/books/upload', {
    method: 'POST',
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
    },
    body: file,
  })
  return await result.json()
}

export async function patchBook(
  id: number,
  book: Partial<BookEdit>,
): Promise<BookDetails> {
  const result = await fetch(`/api/books/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(book),
  })
  return await result.json()
}

export async function updateBook(
  id: number,
  book: BookEdit,
): Promise<BookDetails> {
  const result = await fetch(`/api/books/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(book),
  })
  return await result.json()
}

export async function deleteBook(id: number): Promise<void> {
  const result = await fetch(`/api/books/${id}`, {
    method: 'DELETE',
  })
  return await result.json()
}

export async function getFileMetadata(id: number): Promise<BookFile> {
  const result = await fetch(`/api/books/${id}/file`)
  return await result.json()
}

export async function getFileData(id: number): Promise<Buffer> {
  const result = await fetch(`/api/books/${id}/file`, {
    method: 'GET',
    headers: {
      Accept: 'application/octet-stream',
    },
  })
  return Buffer.from(await result.arrayBuffer())
}

export async function addFile(file: BookFileAdd): Promise<BookFile> {
  const result = await fetch('/api/books/file', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
    },
    body: file.data,
  })
  return await result.json()
}
