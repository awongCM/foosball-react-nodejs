// Source: https://www.npmjs.com/package/elo-rank
// For more info about the formula used here, go to https://en.wikipedia.org/wiki/Elo_rating_system
const elo = require('elo-rank');

const KCOEFFICIENT_BASE = 32;

class FoosballRatingCalculator {
  constructor() {
    this._elo = new elo(KCOEFFICIENT_BASE);

    console.log('FoosBallRatingCalculator initialized');
  }
  
  getExpectedScore(winnerRatio, loserRatio, kFactor) {
    const expectedScore = this._elo.getExpected(winnerRatio, loserRatio);

    return (kFactor || KCOEFFICIENT_BASE) * (1 - expectedScore);
  }

  updatePlayerRating(expectedPlayerScore, didWin, playerRatio) {
    return this._elo.updateRating(expectedPlayerScore, didWin, playerRatio);
  }

  // basically the same idea as updatePlayerRating method above but it's bluntly more simplistic than the former approach
  calculatePlayerWinRatio(playerWinRatio, delta, didWin) {
    return (didWin) ? playerWinRatio + delta : playerWinRatio - delta;
  }

  calculateAverageElo(players) {
    const eloRatioSum = players.reduce( (sumWinRatio, player)=> sumWinRatio + player.getWinRatio(), 0);
    return Math.round(eloRatioSum / players.length);
  }

}

// export the class
module.exports = FoosballRatingCalculator;