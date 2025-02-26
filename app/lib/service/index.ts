import { EventHandlerRequest, H3Event } from 'vinxi/http'
import { loadConfig } from '~/config'
import { Book, NewBook } from '~/lib/types'

export interface LibriService {
  books: {
    getBooks(): Promise<Book[]>
    getBook(id: number): Promise<Book>
    addBook(book: NewBook): Promise<Book>
    uploadBook(data: Buffer | File): Promise<Book>
    patchBook(id: number, book: Partial<Book>): Promise<Book>
    updateBook(id: number, book: Book): Promise<Book>
    deleteBook(id: number): Promise<void>
  }
  // users: {}
  // settings: {}
}

export async function createLibriService(): Promise<LibriService> {
  if (import.meta.env.SSR) {
    const config = loadConfig()
    if (!config) throw new Error('configuration is not available')

    const mod = await import('./server-service')
    return mod.createService(config)
  } else {
    return await import('./client-service')
  }
}

export function getService(event: H3Event<EventHandlerRequest>): LibriService {
  return event.context.service
}
