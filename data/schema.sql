-- Schema for sa3oudi site
-- Run this with: sqlite3 sa3oudi.db < schema.sql

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS news (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image TEXT,
  url TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_news_created_at ON news(created_at DESC);

CREATE TABLE IF NOT EXISTS applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  position TEXT,
  message TEXT,
  cv_path TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at DESC);

-- Optional seed data
-- INSERT INTO news (title, content, image, url, created_at) VALUES ('مرحباً', 'هذه أول خبر', NULL, NULL, datetime('now'));
