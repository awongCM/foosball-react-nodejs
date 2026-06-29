CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE COLLATE NOCASE,
  win_ratio INTEGER NOT NULL DEFAULT 1000,
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY,
  played_at TEXT NOT NULL,
  delta INTEGER NOT NULL,
  probability REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS match_players (
  match_id TEXT NOT NULL,
  player_id TEXT NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('winner', 'loser')),
  PRIMARY KEY (match_id, player_id),
  FOREIGN KEY (match_id) REFERENCES matches(id),
  FOREIGN KEY (player_id) REFERENCES players(id)
);

CREATE INDEX IF NOT EXISTS idx_matches_played_at ON matches(played_at DESC);
