class Player {
  constructor(id, name, winratio) {
    this._id = id;
    this._name = name;
    this._winratio = winratio;

    console.log('Player object initialized');
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

}

// export the class
module.exports = Player;