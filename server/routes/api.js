const express = require('express');
const router = express.Router();
const { v1: uuid } = require('uuid');

const Player = require('../core/Player');
const Game = require('../core/Game');
const { serializePlayer, serializeMatch } = require('../serializers');
const { checkDbHealth } = require('../db/db');
const { requireApiKey } = require('../middleware/auth');
const { handleRoute } = require('../middleware/errorHandler');
const { MAX_PLAYERS_PER_TEAM, MAX_PLAYER_NAME_LENGTH } = require('../constants');

const WINRATIO_DEFAULT = 1000;
const game = new Game();

router.get('/health', (req, res) => {
  try {
    checkDbHealth();
    res.status(200).json({ status: 'ok', db: 'ok' });
  } catch (err) {
    res.status(503).json({ status: 'error', db: 'unavailable' });
  }
});

router.get('/', (req, res) => {
  res.status(200).json({ message: 'Let the foosball game commence!' });
});

router.get('/players', handleRoute((req, res) => {
  const players = game.getPlayersList();

  res.status(200).json({
    message: `Number of total players: ${players.length}`,
    payload: {
      players: players.map(serializePlayer)
    }
  });
}));

router.post('/players', requireApiKey, handleRoute((req, res) => {
  const name = (req.body.name || '').trim();

  if (!name) {
    res.status(400).json({ message: 'Player name is required' });
    return;
  }

  if (name.length > MAX_PLAYER_NAME_LENGTH) {
    res.status(400).json({ message: `Player name must be at most ${MAX_PLAYER_NAME_LENGTH} characters` });
    return;
  }

  if (game.findPlayerByName(name)) {
    res.status(409).json({ message: 'A player with that name already exists' });
    return;
  }

  const winratio = parseWinRatio(req.body.winratio);
  if (winratio === null) {
    res.status(400).json({ message: 'winratio must be a number between 0 and 3000' });
    return;
  }

  const newPlayer = new Player(uuid(), name, winratio);
  game.addNewPlayer(newPlayer);

  res.status(201).json({
    message: 'New player added',
    payload: serializePlayer(newPlayer)
  });
}));

router.post('/game', requireApiKey, handleRoute((req, res) => {
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

  if (winnernames.length > MAX_PLAYERS_PER_TEAM || losernames.length > MAX_PLAYERS_PER_TEAM) {
    res.status(400).json({ message: `Each team can have at most ${MAX_PLAYERS_PER_TEAM} players` });
    return;
  }

  const newMatch = game.recordMatchByNames(winnernames, losernames);

  res.status(201).json({
    message: 'Match ratings updated',
    payload: serializeMatch(newMatch)
  });
}));

router.get('/matches', handleRoute((req, res) => {
  const matches = game.getMatchesList();

  res.status(200).json({
    message: `Number of total matches played so far: ${matches.length}`,
    payload: {
      matches: matches.map(serializeMatch)
    }
  });
}));

function parseWinRatio(value) {
  if (value === undefined || value === null || value === '') {
    return WINRATIO_DEFAULT;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 3000) {
    return null;
  }

  return Math.round(parsed);
}

module.exports = router;
