const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

let db;
let activeDbPath;

function getDbPath() {
  return process.env.DB_PATH || path.join(__dirname, '../../data/foosball.db');
}

function migrate(database) {
  const columns = database.prepare('PRAGMA table_info(match_players)').all();
  const columnNames = new Set(columns.map((column) => column.name));

  if (!columnNames.has('win_ratio')) {
    database.exec('ALTER TABLE match_players ADD COLUMN win_ratio INTEGER NOT NULL DEFAULT 1000');
  }

  if (!columnNames.has('wins')) {
    database.exec('ALTER TABLE match_players ADD COLUMN wins INTEGER NOT NULL DEFAULT 0');
  }

  if (!columnNames.has('losses')) {
    database.exec('ALTER TABLE match_players ADD COLUMN losses INTEGER NOT NULL DEFAULT 0');
  }

  database.exec('CREATE INDEX IF NOT EXISTS idx_match_players_match_id ON match_players(match_id)');
}

function getDb() {
  const dbPath = getDbPath();

  if (db && activeDbPath !== dbPath) {
    db.close();
    db = null;
    activeDbPath = null;
  }

  if (!db) {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    db = new Database(dbPath);
    activeDbPath = dbPath;
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    db.exec(fs.readFileSync(SCHEMA_PATH, 'utf8'));
    migrate(db);
  }
  return db;
}

function checkDbHealth() {
  getDb().prepare('SELECT 1 AS ok').get();
}

function resetDb() {
  if (db) {
    db.close();
    db = null;
    activeDbPath = null;
  }
}

module.exports = { getDb, getDbPath, checkDbHealth, resetDb };
