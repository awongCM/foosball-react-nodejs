const express = require('express');
const router = express.Router();
const uuid = require('uuid/v1');

const Match = require('../core/Match');
const Player = require('../core/Player');
const Game = require('../core/Game');
const { serializePlayer, serializeMatch } = require('../serializers');

const WINRATIO_DEFAULT = 1000;
const game = new Game();

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

router.get('/', (req, res) => {
  res.status(200).json({ message: 'Let the foosball game commence!' });
});

router.get('/players', (req, res) => {
  const players = game.getPlayersList();

  res.status(200).json({
    message: `Number of total players: ${players.length}`,
    payload: {
      players: players.map(serializePlayer)
    }
  });
});

router.post('/players', (req, res) => {
  const name = (req.body.name || '').trim();

  if (!name) {
    res.status(400).json({ message: 'Player name is required' });
    return;
  }

  if (game.findPlayerByName(name)) {
    res.status(409).json({ message: 'A player with that name already exists' });
    return;
  }

  const winratio = req.body.winratio ? req.body.winratio : WINRATIO_DEFAULT;
  const newPlayer = new Player(uuid(), name, winratio);

  game.addNewPlayer(newPlayer);

  res.status(201).json({
    message: 'New player added',
    payload: serializePlayer(newPlayer)
  });
});

router.post('/game', (req, res) => {
  const winnernames = req.body.winners || [];
  const losernames = req.body.losers || [];

  if (!Array.isArray(winnernames) || !Array.isArray(losernames)) {
    res.status(400).json({ message: 'Winners and losers must be arrays of player names' });
    return;
  }

  if (winnernames.length === 0 || losernames.length === 0) {
    res.status(400).json({ message: 'Each team must have at least one player' });
    return;
  }

  if (game.getPlayersList().length === 0) {
    res.status(400).json({ message: 'Cannot determine the match ratings at this time' });
    return;
  }

  const winnersFound = winnernames.map((name) => game.findPlayerByName(name.trim()));
  const losersFound = losernames.map((name) => game.findPlayerByName(name.trim()));

  const missingWinners = winnernames.filter((name, index) => !winnersFound[index]);
  const missingLosers = losernames.filter((name, index) => !losersFound[index]);

  if (missingWinners.length > 0 || missingLosers.length > 0) {
    res.status(400).json({
      message: 'Cannot determine the match ratings due to unavailable player data',
      missingPlayers: [...missingWinners, ...missingLosers]
    });
    return;
  }

  const allSelected = [...winnersFound, ...losersFound];
  const uniqueIds = new Set(allSelected.map((player) => player.getID()));

  if (uniqueIds.size !== allSelected.length) {
    res.status(400).json({ message: 'Each player can only appear once in a match' });
    return;
  }

  const payload = game.handleXMatches({ winners: winnersFound, losers: losersFound });
  const newMatch = new Match(
    uuid(),
    payload.date,
    payload.delta,
    payload.probability,
    payload.winners,
    payload.losers
  );

  game.addRecentMatch(newMatch);

  res.status(201).json({
    message: 'Match ratings updated',
    payload: serializeMatch(newMatch)
  });
});

router.get('/matches', (req, res) => {
  const matches = game.getMatchesList();

  res.status(200).json({
    message: `Number of total matches played so far: ${matches.length}`,
    payload: {
      matches: matches.map(serializeMatch)
    }
  });
});

module.exports = router;
