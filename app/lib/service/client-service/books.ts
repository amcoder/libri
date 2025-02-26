import { Book, NewBook } from '~/lib/types'

export async function getBooks(): Promise<Book[]> {
  const result = await fetch('/api/books')
  return await result.json()
}

export async function getBook(id: number): Promise<Book> {
  const result = await fetch(`/api/books/${id}`)
  return await result.json()
}

export async function addBook(book: NewBook): Promise<Book> {
  const result = await fetch('/api/books', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(book),
  })
  return await result.json()
}

export async function uploadBook(data: Buffer | File): Promise<Book> {
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
  book: Partial<Book>,
): Promise<Book> {
  const result = await fetch(`/api/books/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(book),
  })
  return await result.json()
}

export async function updateBook(id: number, book: Book): Promise<Book> {
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
