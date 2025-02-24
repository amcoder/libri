import { LibriApi } from '.'
import { Book } from '~/lib/types'
import { openDatabase } from '~/lib/database'

export function createApi(dataDir: string): LibriApi {
  const db = openDatabase(dataDir)

  return {
    getBooks,
    getBook,
  }

  function getBooks(): Promise<Book[]> {
    const books = db.prepare('SELECT * FROM book').all() as Book[]
    return Promise.resolve(books)
  }

  function getBook(id: number): Promise<Book> {
    const book = db.prepare('SELECT * FROM book WHERE id = ?').get(id) as Book
    return Promise.resolve(book)
  }
}
