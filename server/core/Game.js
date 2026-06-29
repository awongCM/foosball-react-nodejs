const FoosballRatingCalculator = require('../libs/FoosballRatingCalculator');
const playerRepo = require('../db/playerRepo');
const matchRepo = require('../db/matchRepo');

const ratingCalculator = new FoosballRatingCalculator();

class Game {
  handleXMatches(players) {
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
      playerRepo.update(winner);
    });

    losers.forEach((loser) => {
      const updatedWinRatio = ratingCalculator.calculatePlayerWinRatio(loser.getWinRatio(), delta, 0);
      loser.updateWinRatio(updatedWinRatio);
      loser.recordLoss();
      playerRepo.update(loser);
    });

    return {
      winners,
      losers,
      delta,
      probability,
      date: new Date()
    };
  }

  addNewPlayer(newPlayer) {
    playerRepo.insert(newPlayer);
  }

  addRecentMatch(recentMatch) {
    matchRepo.insertMatch(recentMatch);
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
