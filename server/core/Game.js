// import the libraries
const FoosballRatingCalculator = require('../libs/FoosballRatingCalculator');
const newFoosballRatingCalculator = new FoosballRatingCalculator();

class Game {
  constructor() {
    this._playersArr = [];
    this._matchesArr = [];

    console.log('Game object initialized');
  }

  // For more infomation on determine player win ratio algorithm rankings, check this page out:
  // https://en.wikipedia.org/wiki/Elo_rating_system
  handleXMatches(players) {
    const winners = players.winners;
    const losers = players.losers;
    console.log("Winners: ", winners);
    console.log("Losers: ", losers);

    const winnersElo = newFoosballRatingCalculator.calculateAverageElo(winners);
    const losersElo = newFoosballRatingCalculator.calculateAverageElo(losers);

    const delta = Math.round(newFoosballRatingCalculator.getExpectedScore(winnersElo, losersElo) / winners.length);

    const probability = 1 - newFoosballRatingCalculator.getExpectedScore(winnersElo, losersElo, 1);

    winners.map((winner)=> {
      const updatedWinRatio = newFoosballRatingCalculator.calculatePlayerWinRatio(winner.getWinRatio(), delta, 1);
      return winner.updateWinRatio(updatedWinRatio);
    });

    losers.map((loser)=> {
      const updatedWinRatio = newFoosballRatingCalculator.calculatePlayerWinRatio(loser.getWinRatio(), delta, 0);
      return loser.updateWinRatio(updatedWinRatio);
    });

    return {
      winners: winners,
      losers: losers,
      delta: delta,
      probability: probability,
      date: new Date()
    };
  }

  addNewPlayer(newPlayer) {
    this._playersArr.push(newPlayer);
  }

  addRecentMatches(recentMatch) {
    this._matchesArr.push(recentMatch);
  }

  getMatchesList() {
    return this._matchesArr;
  }

  getPlayersList() {
    return this._playersArr;
  }

}

module.exports = Game;