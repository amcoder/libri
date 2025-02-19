import { faker } from '@faker-js/faker'
import { Book } from './types'
import { Database } from 'better-sqlite3'

export function createFakeData(db: Database) {
  const bookCount = db
    .prepare(`SELECT COUNT(*) FROM book`)
    .pluck()
    .get() as number

  console.log(`Found ${bookCount} books in database`)

  if (bookCount > 0) {
    return
  }

  console.log('Creating fake books...')
  console.time('    ')
  const insertBook = db.prepare(`
    INSERT INTO book (title, author, description, series, seriesNumber, genre, isbn, publisher, published)
    VALUES (@title, @author, @description, @series, @seriesNumber, @genre, @isbn, @publisher, date(@published))`)
  for (let i = 0; i < 500; i++) {
    const book = createFakeBook()
    insertBook.run(book)
  }
  console.timeEnd('    ')
}

function createFakeBook(): Book {
  return {
    id: 0,
    title: faker.book.title(),
    author: faker.book.author(),
    description: faker.lorem.paragraph(),
    series: faker.book.series(),
    seriesNumber: faker.number.int({ min: 1, max: 6 }),
    genre: faker.book.genre(),
    isbn: faker.commerce.isbn(),
    publisher: faker.book.publisher(),
    published: faker.date.past().toUTCString(),
  }
}
