import { EventHandlerRequest, H3Event } from 'vinxi/http'
import { loadConfig } from '~/config'
import { BookAdd, BookDetails, BookEdit, BookSummary, Cover } from '~/lib/types'

export interface LibriService {
  books: {
    getBookSummaries(): Promise<BookSummary[]>
    getBook(id: number): Promise<BookDetails | null>
    getCover(id: number): Promise<Cover | null>
    addBook(book: BookAdd): Promise<BookDetails>
    uploadBook(data: Buffer | File): Promise<BookDetails>
    patchBook(id: number, book: Partial<BookEdit>): Promise<BookDetails>
    updateBook(id: number, book: BookEdit): Promise<BookDetails>
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
