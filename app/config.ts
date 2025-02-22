import fs from 'fs'

type Config = {
  dataDir?: string
  coverDir?: string
  bookDir?: string
}

let config: Config = {}

if (import.meta.env.SSR) {
  const dataDir = import.meta.env.LIBRE_DATA_DIR ?? './data'
  const coverDir = import.meta.env.LIBRE_COVER_DIR ?? `${dataDir}/covers`
  const bookDir = import.meta.env.LIBRE_BOOK_DIR ?? `${dataDir}/books`

  fs.mkdirSync(dataDir, { recursive: true })
  fs.mkdirSync(coverDir, { recursive: true })
  fs.mkdirSync(bookDir, { recursive: true })

  config = { dataDir, coverDir, bookDir }
}

export default config
