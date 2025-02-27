export type Author = {
  id: number
  name: string
  fileAs: string
}

export type Series = {
  id: number
  name: string
  fileAs: string
}

export type BookSummary = {
  id: number
  title: string
  fileAs: string
  authors: string[]
  coverUrl?: string
}

export type BookDetails = {
  id: number
  title: string
  authors: string[]
  description?: string
  series?: string
  seriesIndex?: number
  tags: string[]
  publisher?: string
  publishedOn?: string
  coverUrl?: string
}

export type BookEdit = {
  id: number
  title: string
  fileAs: string
  authors: Author[]
  description?: string
  series?: Series
  seriesIndex?: number
  tags: string[]
  publisher?: string
  publishedOn?: string
  cover?: Buffer | null
  coverMediaType?: string
  filePath?: string
}

export type BookAdd = Omit<BookEdit, 'id'>

export type Cover = {
  data: Buffer
  mediaType: string
}
