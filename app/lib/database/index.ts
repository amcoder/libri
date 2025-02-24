import path from 'path'
import SqliteDatabase, { Database } from 'better-sqlite3'
import { createFakeData } from '~/lib/fake-data'

export function openDatabase(dataDir: string) {
  const dbFile = path.join(dataDir, 'libri.db')

  const db = new SqliteDatabase(dbFile)
  db.pragma('journal_mode = WAL')

  migrateDatabase(db)
  createFakeData(db)

  return db
}

function migrateDatabase(db: Database) {
  const lastMigration = isDatabaseEmpty(db) ? 0 : getLastMigration(db)
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

function isDatabaseEmpty(db: Database) {
  const checkStatement = db.prepare(`
    SELECT COUNT(*)
    FROM sqlite_master
    WHERE type = 'table' AND name = 'migration'`)

  return checkStatement.pluck().get() === 0
}

function getLastMigration(db: Database) {
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
