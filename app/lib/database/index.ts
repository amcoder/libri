import Database from 'better-sqlite3'
import { createFakeData } from '~/lib/fake-data'

export const db = new Database('database.db')
db.pragma('journal_mode = WAL')

migrateDatabase()
createFakeData(db)

function migrateDatabase() {
  const lastMigration = isDatabaseEmpty() ? 0 : getLastMigration()
  const migrations = getMigrations()

  for (const { number, name, sql } of migrations) {
    if (number > lastMigration) {
      console.log(`Running migration ${name}...`)
      db.exec(sql as string)
      db.prepare(`INSERT INTO migration (number, name) VALUES (?, ?)`).run(
        number,
        name,
      )
    }
  }
}

function isDatabaseEmpty() {
  const checkStatement = db.prepare(`
    SELECT COUNT(*)
    FROM sqlite_master
    WHERE type = 'table' AND name = 'migration'`)

  return checkStatement.pluck().get() === 0
}

function getLastMigration() {
  return (
    (db
      .prepare(`SELECT number FROM migration ORDER BY createdAt DESC LIMIT 1`)
      .pluck()
      .get() as number) || 0
  )
}

function getMigrations() {
  return Object.entries(
    import.meta.glob('./migrations/*.sql', {
      eager: true,
      query: '?raw',
      import: 'default',
    }),
  )
    .map(([file, sql]) => {
      const name = file.replace(/^\.\/migrations\//, '')
      const number = parseInt(name)
      return {
        number,
        name,
        sql: sql as string,
      }
    })
    .sort((a, b) => a.number - b.number)
}
