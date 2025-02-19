import { Book } from '~/lib/types'
import { db } from '~/lib/database'

export function getBooks(): Promise<Book[]> {
  const books = db.prepare('SELECT * FROM book').all() as Book[]
  return Promise.resolve(books)
}

export function getBook(id: number): Promise<Book> {
  const book = db.prepare('SELECT * FROM book WHERE id = ?').get(id) as Book
  return Promise.resolve(book)
}
