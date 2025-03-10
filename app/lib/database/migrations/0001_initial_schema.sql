-- sqlite3 migration script

CREATE TABLE IF NOT EXISTS migration (
  number INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  createdAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS migration_created_at ON migration (createdAt);

CREATE TABLE IF NOT EXISTS book (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  fileAs TEXT NOT NULL,
  description TEXT,
  seriesId TEXT REFERENCES series (id) ON DELETE SET NULL,
  seriesIndex REAL,
  tags TEXT NOT NULL CHECK (json_valid(tags)),
  publisher TEXT,
  publishedOn TEXT,
  coverLargeId INTEGER REFERENCES file (id) ON DELETE SET NULL,
  coverSmallId INTEGER REFERENCES file (id) ON DELETE SET NULL,
  createdAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS book_created_at ON book (createdAt);

CREATE TABLE IF NOT EXISTS author (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  fileAs TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS author_name ON author (name);
CREATE INDEX IF NOT EXISTS author_fileAs ON author (fileAs);

CREATE TABLE IF NOT EXISTS book_author (
  bookId INTEGER NOT NULL REFERENCES book (id) ON DELETE CASCADE,
  authorId INTEGER NOT NULL REFERENCES author (id) ON DELETE CASCADE,
  PRIMARY KEY (bookId, authorId)
);

CREATE TABLE IF NOT EXISTS series (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  fileAs TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS series_fileAs ON series (fileAs);

CREATE TABLE IF NOT EXISTS file (
  id INTEGER PRIMARY KEY,
  mediaType TEXT NOT NULL,
  name TEXT NOT NULL,
  etag TEXT NOT NULL,
  data BLOB NOT NULL,
  createdAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  modifiedAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TRIGGER IF NOT EXISTS file_modifiedAt AFTER UPDATE ON file
BEGIN
  UPDATE file SET modifiedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = old.id;
END;
