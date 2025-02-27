import { LibriService } from '..'
import { Config } from '~/config'
import { openDatabase } from '~/lib/database'
import { createBookService } from './books'

export function createService(config: Config): LibriService {
  const db = openDatabase(config.dataDir)

  const service = {
    books: createBookService(db, config),
  }

  return service
}
