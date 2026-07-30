function serializePlayer(player) {
  return {
    id: player.getID(),
    name: player.getName(),
    winRatio: player.getWinRatio(),
    wins: player.getWins(),
    losses: player.getLosses()
  };
}

function serializeMatch(match) {
  return {
    id: match.getID(),
    date: match.getDateOfEntry(),
    delta: match.getDelta(),
    probability: match.getProbability(),
    winners: match.getWinners().map(serializePlayer),
    losers: match.getLosers().map(serializePlayer)
  };
}

module.exports = { serializePlayer, serializeMatch };
