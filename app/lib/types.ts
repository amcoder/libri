export type NewBook = Omit<Book, 'id'>

export type Book = {
  id: number
  title: string
  author: string
  description?: string
  series?: string
  seriesNumber?: number
  tags: string[]
  publisher?: string
  published?: string
  language?: string
  coverPath?: string
  filePath?: string
}
