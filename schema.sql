CREATE TABLE faculty (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  department TEXT NOT NULL
);

CREATE TABLE research (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    authors TEXT NOT NULL,        -- comma-separated
    year INTEGER NOT NULL,
    field TEXT NOT NULL,
    abstract TEXT NOT NULL,
    keywords TEXT NOT NULL        -- comma-separated
);

CREATE TABLE news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    content TEXT NOT NULL,
    image TEXT,
    date TEXT NOT NULL
);

CREATE TABLE interactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT,
    timestamp TEXT
);
