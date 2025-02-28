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
  coverLargeUrl?: string
  coverSmallUrl?: string
}

export type BookDetails = {
  id: number
  title: string
  authors: string[]
  fileAs: string
  description?: string
  series?: string
  seriesIndex?: number
  tags: string[]
  publisher?: string
  publishedOn?: string
  coverLargeUrl?: string
  coverSmallUrl?: string
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
  coverLargeId?: number
  coverSmallId?: number
}

export type BookAdd = Omit<BookEdit, 'id'>

export type BookFile = {
  id: number
  name: string
  data?: Buffer
  mediaType: string
  modifiedAt: string
  etag: string
}

export type BookFileAdd = Omit<BookFile, 'id' | 'modifiedAt'>
