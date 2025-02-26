CREATE TABLE IF NOT EXISTS migration (
  number INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  createdAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS migration_created_at ON migration (createdAt);

CREATE TABLE IF NOT EXISTS book (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  description TEXT,
  series TEXT,
  seriesNumber INTEGER,
  tags TEXT,
  publisher TEXT,
  published TEXT,
  language TEXT,
  coverPath TEXT,
  filePath TEXT,
  createdAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS book_created_at ON book (createdAt);
