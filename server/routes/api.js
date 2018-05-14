const express = require('express'),
      router = express.Router(), 
      uuid = require('uuid/v1');
      WINRATIO_DEFAULT = 1000; //give all new players their default win ratios
      
const Match = require('../core/Match');
const Player = require('../core/Player');
const Game = require('../core/Game');
const FoosballRatingCalculator = require('../libs/FoosballRatingCalculator');

// initializes these classes
const newGame = new Game();
const newFoosballRatingCalculator = new FoosballRatingCalculator();

// main endpoint
router.get('/', (req, res) => {
  res.status(200).json({message: "Let the foosball game commence!"});
});

//retrieve all players
router.get('/players', (req, res) => {
  
  let playerArr = [];
  playerArr = newGame.getPlayersList();

  res.status(200).json({
    message: 'Number of total players: ' + playerArr.length,
    payload: {
      players: playerArr
    }
  });
});

// Add new players
router.post('/players', (req, res) => {
  console.log('new player added');

  const name = req.body.name;
  const winratio = req.body.winratio ? req.body.winratio : WINRATIO_DEFAULT;

  // generate globally unique identifier 
  const id = uuid();

  const newPlayer = new Player(id, name, winratio);

  newGame.addNewPlayer(newPlayer);

  res.status(200).json({
    message: 'New player added',
    payload: {
      id: newPlayer.getID(),
      name: newPlayer.getName(),
      winratio: newPlayer.getWinRatio()
    }
  });
});

//Calculate win ratios between opponents of a match
router.post('/game', (req, res) => {

  const winnernames = req.body.winners;
  const losernames = req.body.losers;
  let playersArr = newGame.getPlayersList();

  if (playersArr.length === 0 ) {
    res.status(401).json({message: 'Cannot determine the match ratings at this time'});
    return;
  }

  const winnersFound = winnernames.map(name => playersArr.find((player)=> { return player.getName() === name;}) );
  const losersFound = losernames.map(name => playersArr.find((player)=> { return player.getName() === name;}) ) ;

  if(winnersFound === undefined  || losersFound === undefined) {
    res.status(401).json({message: "Cannot determine the match ratings due to unavailable player data"});
    return;
  }

  const players = {winners: winnersFound, losers: losersFound};
  let payload = newGame.handleXMatches(players);
    
  const newMatch = constructMatchObj(payload);

  newGame.addRecentMatches(newMatch);

  res.status(201).json(constructResponseMatchJSON(newMatch));
});

// Retrieve all matches
router.get('/matches', (req, res) => {
  let matchArr = [];

  matchArr = newGame.getMatchesList();

  res.status(200).json({
    message: 'Number of total matches played so far: ' + matchArr.length,
    payload: {
      matches: matchArr
    }
  });
});


// Helper methods for Match data
function constructMatchObj(payload) {
  // generate globally unique identifier 
  const id = uuid();

  return new Match(id, payload.date, payload.delta, payload.probability, payload.winners, payload.losers);
}

function constructResponseMatchJSON(newMatch) {
  return {
    message: 'Match ratings updated', 
    payload: {
      id: newMatch.getID(),
      date: newMatch.getDateOfEntry(),
      delta: newMatch.getDelta(),
      probablity: newMatch.getProbability(),
      winners: newMatch.getWinners(),
      losers: newMatch.getLosers()
    } 
  };
}

module.exports = router;