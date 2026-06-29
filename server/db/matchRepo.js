const { getDb } = require('./db');
const Match = require('../core/Match');
const playerRepo = require('./playerRepo');

function insertMatch(match) {
  const db = getDb();
  const insertMatchStmt = db.prepare(
    'INSERT INTO matches (id, played_at, delta, probability) VALUES (?, ?, ?, ?)'
  );
  const insertParticipantStmt = db.prepare(
    'INSERT INTO match_players (match_id, player_id, side) VALUES (?, ?, ?)'
  );

  const tx = db.transaction(() => {
    insertMatchStmt.run(
      match.getID(),
      match.getDateOfEntry().toISOString(),
      match.getDelta(),
      match.getProbability()
    );

    match.getWinners().forEach((player) => {
      insertParticipantStmt.run(match.getID(), player.getID(), 'winner');
    });

    match.getLosers().forEach((player) => {
      insertParticipantStmt.run(match.getID(), player.getID(), 'loser');
    });
  });

  tx();
}

function findAll() {
  const db = getDb();
  const matchRows = db.prepare('SELECT * FROM matches ORDER BY played_at DESC').all();
  const participantRows = db.prepare('SELECT match_id, player_id, side FROM match_players').all();

  const participantsByMatch = participantRows.reduce((acc, row) => {
    if (!acc[row.match_id]) {
      acc[row.match_id] = { winners: [], losers: [] };
    }
    const player = playerRepo.findById(row.player_id);
    if (player) {
      acc[row.match_id][row.side === 'winner' ? 'winners' : 'losers'].push(player);
    }
    return acc;
  }, {});

  return matchRows.map((row) => {
    const participants = participantsByMatch[row.id] || { winners: [], losers: [] };
    return new Match(
      row.id,
      new Date(row.played_at),
      row.delta,
      row.probability,
      participants.winners,
      participants.losers
    );
  });
}

module.exports = { insertMatch, findAll };
