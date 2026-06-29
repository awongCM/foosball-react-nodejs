class Player {
  constructor(id, name, winratio, wins = 0, losses = 0) {
    this._id = id;
    this._name = name;
    this._winratio = winratio;
    this._wins = wins;
    this._losses = losses;
  }

  getID() {
    return this._id;
  }

  setName(name) {
    this._name = name;
  }

  getName() {
    return this._name;
  }

  updateWinRatio(winratio) {
    this._winratio = winratio;
  }

  getWinRatio() {
    return this._winratio;
  }

  getWins() {
    return this._wins;
  }

  getLosses() {
    return this._losses;
  }

  recordWin() {
    this._wins += 1;
  }

  recordLoss() {
    this._losses += 1;
  }
}

module.exports = Player;
