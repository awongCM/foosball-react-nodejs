const { getDb } = require('./db');
const Player = require('../core/Player');

function rowToPlayer(row) {
  return new Player(row.id, row.name, row.win_ratio, row.wins, row.losses);
}

function findAll() {
  const rows = getDb().prepare('SELECT * FROM players ORDER BY win_ratio DESC, name ASC').all();
  return rows.map(rowToPlayer);
}

function findByName(name) {
  const row = getDb().prepare('SELECT * FROM players WHERE name = ? COLLATE NOCASE').get(name);
  return row ? rowToPlayer(row) : null;
}

function findById(id) {
  const row = getDb().prepare('SELECT * FROM players WHERE id = ?').get(id);
  return row ? rowToPlayer(row) : null;
}

function insert(player) {
  getDb().prepare(
    'INSERT INTO players (id, name, win_ratio, wins, losses, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(
    player.getID(),
    player.getName(),
    player.getWinRatio(),
    player.getWins(),
    player.getLosses(),
    new Date().toISOString()
  );
}

function update(player) {
  getDb().prepare(
    'UPDATE players SET win_ratio = ?, wins = ?, losses = ? WHERE id = ?'
  ).run(
    player.getWinRatio(),
    player.getWins(),
    player.getLosses(),
    player.getID()
  );
}

module.exports = { findAll, findByName, findById, insert, update };
