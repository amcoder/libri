import { Book } from '../types'

export async function getBooks(): Promise<Book[]> {
  const result = await fetch('/api/books')
  return await result.json()
}

export async function getBook(id: number): Promise<Book> {
  const result = await fetch(`/api/books/${id}`)
  return await result.json()
}
