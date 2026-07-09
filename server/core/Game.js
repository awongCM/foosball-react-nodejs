const uuid = require('uuid/v1');

const FoosballRatingCalculator = require('../libs/FoosballRatingCalculator');
const Match = require('./Match');
const playerRepo = require('../db/playerRepo');
const matchRepo = require('../db/matchRepo');

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

  recordMatch(winners, losers) {
    const payload = this.calculateMatchRatings({ winners, losers });
    const match = new Match(
      uuid(),
      payload.date,
      payload.delta,
      payload.probability,
      payload.winners,
      payload.losers
    );

    matchRepo.recordMatch(match);
    return match;
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
