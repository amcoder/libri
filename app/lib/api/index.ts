import { loadConfig } from '~/config'
import { Book } from '~/lib/types'

export interface LibriApi {
  getBooks(): Promise<Book[]>
  getBook(id: number): Promise<Book>
}

export async function createLibriApi(): Promise<LibriApi> {
  if (import.meta.env.SSR) {
    const config = loadConfig()
    if (!config) throw new Error('configuration is not available')

    const mod = await import('./api-database')
    return mod.createApi(config.dataDir)
  } else {
    return await import('./api-web')
  }
}
