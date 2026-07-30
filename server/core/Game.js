const { v1: uuid } = require('uuid');

const FoosballRatingCalculator = require('../libs/FoosballRatingCalculator');
const Match = require('./Match');
const playerRepo = require('../db/playerRepo');
const matchRepo = require('../db/matchRepo');
const { getDb } = require('../db/db');
const { ValidationError } = require('../errors');

const ratingCalculator = new FoosballRatingCalculator();

class Game {
  calculateMatchRatings(players) {
    const winners = players.winners;
    const losers = players.losers;

    const winnersElo = ratingCalculator.calculateAverageElo(winners);
    const losersElo = ratingCalculator.calculateAverageElo(losers);

    const delta = Math.round(ratingCalculator.getExpectedScore(winnersElo, losersElo) / winners.length);
    const probability = 1 - ratingCalculator.getExpectedScore(winnersElo, losersElo, 1);

    winners.forEach((winner) => {
      const updatedWinRatio = ratingCalculator.calculatePlayerWinRatio(winner.getWinRatio(), delta, 1);
      winner.updateWinRatio(updatedWinRatio);
      winner.recordWin();
    });

    losers.forEach((loser) => {
      const updatedWinRatio = ratingCalculator.calculatePlayerWinRatio(loser.getWinRatio(), delta, 0);
      loser.updateWinRatio(updatedWinRatio);
      loser.recordLoss();
    });

    return {
      winners,
      losers,
      delta,
      probability,
      date: new Date()
    };
  }

  recordMatchByNames(rawWinnerNames, rawLoserNames) {
    const winnerNames = rawWinnerNames.map((name) => name.trim());
    const loserNames = rawLoserNames.map((name) => name.trim());

    const db = getDb();
    const record = db.transaction(() => {
      const winners = winnerNames.map((name) => playerRepo.findByName(name, db));
      const losers = loserNames.map((name) => playerRepo.findByName(name, db));

      const missingWinners = winnerNames.filter((name, index) => !winners[index]);
      const missingLosers = loserNames.filter((name, index) => !losers[index]);

      if (missingWinners.length > 0 || missingLosers.length > 0) {
        throw new ValidationError(
          'Cannot determine the match ratings due to unavailable player data',
          { missingPlayers: [...missingWinners, ...missingLosers] }
        );
      }

      const allSelected = [...winners, ...losers];
      const uniqueIds = new Set(allSelected.map((player) => player.getID()));

      if (uniqueIds.size !== allSelected.length) {
        throw new ValidationError('Each player can only appear once in a match');
      }

      const payload = this.calculateMatchRatings({ winners, losers });
      const match = new Match(
        uuid(),
        payload.date,
        payload.delta,
        payload.probability,
        payload.winners,
        payload.losers
      );

      matchRepo.persistMatch(db, match);
      return match;
    });

    return record();
  }

  addNewPlayer(newPlayer) {
    playerRepo.insert(newPlayer);
  }

  getMatchesList() {
    return matchRepo.findAll();
  }

  getPlayersList() {
    return playerRepo.findAll();
  }

  findPlayerByName(name) {
    return playerRepo.findByName(name);
  }
}

module.exports = Game;
