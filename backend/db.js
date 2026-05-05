import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, 'specter.db'));

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize schema
db.exec(`
  -- Notebooks (one per project)
  CREATE TABLE IF NOT EXISTS notebooks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL DEFAULT 'Untitled Notebook',
    content TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- References (belong to a notebook)
  CREATE TABLE IF NOT EXISTS "references" (
    id TEXT PRIMARY KEY,
    notebook_id TEXT NOT NULL,
    title TEXT,
    authors TEXT,
    year TEXT,
    journal TEXT,
    abstract TEXT,
    url TEXT,
    doi TEXT,
    confidence TEXT DEFAULT 'manual',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (notebook_id) REFERENCES notebooks(id) ON DELETE CASCADE
  );

  -- Plans/Tasks (belong to a notebook)
  CREATE TABLE IF NOT EXISTS plans (
    id TEXT PRIMARY KEY,
    notebook_id TEXT NOT NULL,
    title TEXT NOT NULL,
    outline TEXT DEFAULT '',
    output_type TEXT DEFAULT 'draft',
    word_target INTEGER DEFAULT 500,
    scheduled_date DATETIME,
    scheduled_time TEXT DEFAULT '09:00',
    auto_start INTEGER DEFAULT 0,
    pre_fetch_refs INTEGER DEFAULT 0,
    instructions TEXT DEFAULT '',
    status TEXT DEFAULT 'planned',
    ai_output TEXT,
    ai_summary TEXT,
    ai_references TEXT,
    ai_completed_at DATETIME,
    user_confirmed INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (notebook_id) REFERENCES notebooks(id) ON DELETE CASCADE
  );

  -- Chat messages (belong to a notebook)
  CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY,
    notebook_id TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (notebook_id) REFERENCES notebooks(id) ON DELETE CASCADE
  );
`);

// Migration: add new columns if they don't exist
try {
  db.exec(`ALTER TABLE plans ADD COLUMN scheduled_time TEXT DEFAULT '09:00'`);
} catch (e) { /* column already exists */ }
try {
  db.exec(`ALTER TABLE plans ADD COLUMN auto_start INTEGER DEFAULT 0`);
} catch (e) { /* column already exists */ }
try {
  db.exec(`ALTER TABLE plans ADD COLUMN pre_fetch_refs INTEGER DEFAULT 0`);
} catch (e) { /* column already exists */ }
try {
  db.exec(`ALTER TABLE plans ADD COLUMN instructions TEXT DEFAULT ''`);
} catch (e) { /* column already exists */ }

export default db;
