const { getDb } = require('./db');
const Match = require('../core/Match');
const Player = require('../core/Player');

function recordMatch(match) {
  const db = getDb();
  const updatePlayerStmt = db.prepare(
    'UPDATE players SET win_ratio = ?, wins = ?, losses = ? WHERE id = ?'
  );
  const insertMatchStmt = db.prepare(
    'INSERT INTO matches (id, played_at, delta, probability) VALUES (?, ?, ?, ?)'
  );
  const insertParticipantStmt = db.prepare(
    'INSERT INTO match_players (match_id, player_id, side, win_ratio, wins, losses) VALUES (?, ?, ?, ?, ?, ?)'
  );

  const participants = [
    ...match.getWinners().map((player) => ({ player, side: 'winner' })),
    ...match.getLosers().map((player) => ({ player, side: 'loser' }))
  ];

  const tx = db.transaction(() => {
    participants.forEach(({ player }) => {
      updatePlayerStmt.run(
        player.getWinRatio(),
        player.getWins(),
        player.getLosses(),
        player.getID()
      );
    });

    insertMatchStmt.run(
      match.getID(),
      match.getDateOfEntry().toISOString(),
      match.getDelta(),
      match.getProbability()
    );

    participants.forEach(({ player, side }) => {
      insertParticipantStmt.run(
        match.getID(),
        player.getID(),
        side,
        player.getWinRatio(),
        player.getWins(),
        player.getLosses()
      );
    });
  });

  tx();
}

function findAll() {
  const db = getDb();
  const matchRows = db.prepare('SELECT * FROM matches ORDER BY played_at DESC').all();
  const participantRows = db.prepare(`
    SELECT mp.match_id, mp.player_id, mp.side, mp.win_ratio, mp.wins, mp.losses, p.name
    FROM match_players mp
    JOIN players p ON p.id = mp.player_id
    ORDER BY mp.match_id, mp.side
  `).all();

  const participantsByMatch = participantRows.reduce((acc, row) => {
    if (!acc[row.match_id]) {
      acc[row.match_id] = { winners: [], losers: [] };
    }

    const player = new Player(
      row.player_id,
      row.name,
      row.win_ratio,
      row.wins,
      row.losses
    );

    acc[row.match_id][row.side === 'winner' ? 'winners' : 'losers'].push(player);
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

module.exports = { recordMatch, findAll };
