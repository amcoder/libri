import { Book } from '~/lib/types'

export interface LibriApi {
  getBooks(): Promise<Book[]>
  getBook(id: number): Promise<Book>
}
