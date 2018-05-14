import React, { Component } from 'react';
import './App.css';
import ReactJson from 'react-json-view';
import axios from 'axios';

class App extends Component {

  constructor(props){
    super(props);
    this.state = {
      responseJSONObj: {},
      player: '',
      winners: '',
      losers: ''
    };
  }

  fetchGame() {

    axios.get('/api/' )
      .then(res => {
        console.log(res.data);
        this.setState({responseJSONObj: res.data});
      })
      .catch(err => console.log(err));
  }

  fetchPlayers() {

    axios.get('/api/players' )
      .then(res => {
        console.log(res.data);
        this.setState({responseJSONObj: res.data});
      })
      .catch(err => console.log(err));
  }

  fetchMatches() {

    axios.get('/api/matches' )
      .then(res => {
        console.log(res.data);
        this.setState({responseJSONObj: res.data});
      })
      .catch(err => console.log(err));
  }

  handleChange(e) {
    this.setState({[e.target.name]: e.target.value});
  }

  addPlayer() {
    const data = {
      name: this.state.player
    };

    axios.post('/api/players', data )
      .then(res => {
        console.log(res.data);
        this.setState({responseJSONObj: res.data});
      })
      .catch(err => {
        console.log(err);
        this.setState({responseJSONObj: err});
      });
  }

  submitMatch() {
    // grab the comma-delimited list and trim them
    const winnersList = this.state.winners.split(',').map(winner => winner.trim());
    const losersList = this.state.losers.split(',').map(loser => loser.trim());

    console.log(winnersList);
    console.log(losersList);

    const data = {
      winners: winnersList,
      losers: losersList
    };

    axios.post('/api/game', data )
      .then(res => {
        console.log(res.data);
        this.setState({responseJSONObj: res.data});
      })
      .catch(err => {
        console.log(err);
        this.setState({responseJSONObj: err}); 
      });
  }

  render() {
    
    const isEnabled = this.state.player.length > 0;

    return (
      <div className="App">
        <header className="App-header">
          <h1>Foosball Ranking System </h1>
          <span>Do any one of the following choices:</span>
        </header>
        <div className="button-groups">
          <h2>1) Fetch the following endpoints data</h2>
          <button type="button" onClick={(e) =>this.fetchGame(e)}>Home</button>
          <button type="button" onClick={(e) =>this.fetchPlayers(e)}>Players</button>
          <button type="button" onClick={(e) =>this.fetchMatches(e)}>Matches</button>
        </div>
        <div className="form-group">
          <h2>2 )Add Player</h2>
          <label htmlFor="player">Player Name:</label>
          <input type="text" name="player" value={this.state.player} onChange={(e) => this.handleChange(e)}/>
          <button type="button" onClick={(e) =>this.addPlayer(e)} disabled={!isEnabled}>Submit</button>
        </div>

        <div className="form-group">
          <h2>3) Enter players into their respective fields to compete </h2>
          <label htmlFor="winner">Winners:</label>
          <input type="text" name="winners" value={this.state.winners} onChange={(e) => this.handleChange(e)}/>
          <label htmlFor="loser">Losers:</label>
          <input type="text" name="losers" value={this.state.losers} onChange={(e) => this.handleChange(e)}/>
          <button type="button" onClick={(e) =>this.submitMatch(e)}>Submit</button>
        </div>
        <div className="divider"></div>
        <h2>JSON Response Object Viewer</h2>
        <ReactJson name={false} theme={"monokai"} displayObjectSize={false} displayDataTypes={false} src={this.state.responseJSONObj} />
      </div>
    );
  }
}

export default App;
