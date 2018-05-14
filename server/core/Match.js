class Match {
  constructor(id, date, delta, _probability, winners, losers) {
    this._id = id;
    this._date = date;
    this._delta = delta;
    this._probability = _probability;
    this._winners = winners;
    this._losers = losers;

    console.log('Match object initialized');
  }

  setDateOfEntry(date) {
    this._date = date;
  }

  setDelta(delta) {
    this._delta = delta;
  }

  setProbability(probability) {
    this._probability = probability;
  }

  getID() {
    return this._id;
  }

  getDateOfEntry(){
    return this._date;
  }

  getDelta(){
    return this._delta;
  }

  getProbability(){
    return this._probability;
  }

  getWinners() {
    return this._winners;
  }

  getLosers() {
    return this._losers;
  }

}

module.exports = Match;