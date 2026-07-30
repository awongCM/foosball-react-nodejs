import React, { Component } from 'react';
import api from './api';
import './App.css';

const TABS = {
  LEADERBOARD: 'leaderboard',
  LOG_MATCH: 'log-match',
  HISTORY: 'history'
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: TABS.LEADERBOARD,
      players: [],
      matches: [],
      playerName: '',
      winner1: '',
      winner2: '',
      loser1: '',
      loser2: '',
      loading: false,
      message: '',
      error: ''
    };
  }

  componentDidMount() {
    this.loadData();
  }

  setStatus(message = '', error = '') {
    this.setState({ message, error });
  }

  loadData() {
    this.setState({ loading: true, error: '' });

    return Promise.all([
      api.get('/api/players'),
      api.get('/api/matches')
    ])
      .then(([playersRes, matchesRes]) => {
        this.setState({
          players: playersRes.data.payload.players,
          matches: matchesRes.data.payload.matches,
          loading: false
        });
      })
      .catch((err) => {
        const errorMessage = err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : 'Failed to load data from the server';
        this.setState({ loading: false, error: errorMessage });
      });
  }

  handleTabChange(tab) {
    this.setState({ activeTab: tab, message: '', error: '' });
  }

  handleChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  addPlayer(e) {
    e.preventDefault();
    const name = this.state.playerName.trim();

    if (!name) {
      this.setStatus('', 'Enter a player name');
      return;
    }

    api.post('/api/players', { name })
      .then((res) => {
        this.setState({ playerName: '' });
        this.setStatus(res.data.message);
        return this.loadData();
      })
      .catch((err) => {
        const errorMessage = err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : 'Failed to add player';
        this.setStatus('', errorMessage);
      });
  }

  submitMatch(e) {
    e.preventDefault();
    const { winner1, winner2, loser1, loser2 } = this.state;
    const winners = [winner1, winner2].filter(Boolean);
    const losers = [loser1, loser2].filter(Boolean);
    const selected = [winner1, winner2, loser1, loser2].filter(Boolean);

    if (winners.length === 0 || losers.length === 0) {
      this.setStatus('', 'Select at least one player on each team');
      return;
    }

    if (new Set(selected).size !== selected.length) {
      this.setStatus('', 'Each player can only appear once in a match');
      return;
    }

    api.post('/api/game', { winners, losers })
      .then((res) => {
        const match = res.data.payload;
        const winnerSummary = match.winners
          .map((player) => `${player.name} → ${player.winRatio}`)
          .join(', ');
        const loserSummary = match.losers
          .map((player) => `${player.name} → ${player.winRatio}`)
          .join(', ');

        this.setState({
          winner1: '',
          winner2: '',
          loser1: '',
          loser2: ''
        });
        this.setStatus(`Match logged (±${match.delta}). Winners: ${winnerSummary}. Losers: ${loserSummary}.`);
        return this.loadData();
      })
      .catch((err) => {
        const errorMessage = err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : 'Failed to log match';
        this.setStatus('', errorMessage);
      });
  }

  renderPlayerOptions(exclude = []) {
    return this.state.players.map((player) => (
      <option key={player.id} value={player.name} disabled={exclude.includes(player.name)}>
        {player.name} ({player.winRatio})
      </option>
    ));
  }

  renderLeaderboard() {
    const { players } = this.state;

    return (
      <section className="panel">
        <h2>Leaderboard</h2>
        <p className="panel-description">Players ranked by Elo rating. Everyone starts at 1000.</p>

        <form className="inline-form" onSubmit={(e) => this.addPlayer(e)}>
          <input
            type="text"
            name="playerName"
            placeholder="New player name"
            value={this.state.playerName}
            onChange={(e) => this.handleChange(e)}
          />
          <button type="submit">Add Player</button>
        </form>

        {players.length === 0 ? (
          <p className="empty-state">No players yet. Add someone to get started.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Rating</th>
                <th>W-L</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player, index) => (
                <tr key={player.id}>
                  <td>{index + 1}</td>
                  <td>{player.name}</td>
                  <td>{player.winRatio}</td>
                  <td>{player.wins}-{player.losses}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    );
  }

  renderLogMatch() {
    const { players, winner1, winner2, loser1, loser2 } = this.state;
    const selected = [winner1, winner2, loser1, loser2].filter(Boolean);

    return (
      <section className="panel">
        <h2>Log Match</h2>
        <p className="panel-description">Record a 2v2 foosball result. Ratings update automatically.</p>

        {players.length < 2 ? (
          <p className="empty-state">Add at least two players before logging a match.</p>
        ) : (
          <form className="match-form" onSubmit={(e) => this.submitMatch(e)}>
            <div className="team-group">
              <h3>Winners</h3>
              <select name="winner1" value={winner1} onChange={(e) => this.handleChange(e)}>
                <option value="">Select player</option>
                {this.renderPlayerOptions(selected.filter((name) => name !== winner1))}
              </select>
              <select name="winner2" value={winner2} onChange={(e) => this.handleChange(e)}>
                <option value="">Select player (optional)</option>
                {this.renderPlayerOptions(selected.filter((name) => name !== winner2))}
              </select>
            </div>

            <div className="team-group">
              <h3>Losers</h3>
              <select name="loser1" value={loser1} onChange={(e) => this.handleChange(e)}>
                <option value="">Select player</option>
                {this.renderPlayerOptions(selected.filter((name) => name !== loser1))}
              </select>
              <select name="loser2" value={loser2} onChange={(e) => this.handleChange(e)}>
                <option value="">Select player (optional)</option>
                {this.renderPlayerOptions(selected.filter((name) => name !== loser2))}
              </select>
            </div>

            <button type="submit">Submit Match</button>
          </form>
        )}
      </section>
    );
  }

  renderHistory() {
    const { matches } = this.state;

    return (
      <section className="panel">
        <h2>Match History</h2>
        <p className="panel-description">Recent results and rating changes.</p>

        {matches.length === 0 ? (
          <p className="empty-state">No matches logged yet.</p>
        ) : (
          <div className="match-list">
            {matches.map((match) => (
              <article key={match.id} className="match-card">
                <div className="match-meta">
                  <span>{new Date(match.date).toLocaleString()}</span>
                  <span>Rating change: ±{match.delta}</span>
                </div>
                <div className="match-teams">
                  <div>
                    <strong>Winners</strong>
                    <ul>
                      {match.winners.map((player) => (
                        <li key={player.id}>{player.name} ({player.winRatio})</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <strong>Losers</strong>
                    <ul>
                      {match.losers.map((player) => (
                        <li key={player.id}>{player.name} ({player.winRatio})</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    );
  }

  renderActiveTab() {
    switch (this.state.activeTab) {
      case TABS.LOG_MATCH:
        return this.renderLogMatch();
      case TABS.HISTORY:
        return this.renderHistory();
      default:
        return this.renderLeaderboard();
    }
  }

  render() {
    const { activeTab, loading, message, error } = this.state;

    return (
      <div className="App">
        <header className="App-header">
          <h1>Foosball Ranking System</h1>
          <p>Track office foosball matches and climb the leaderboard.</p>
        </header>

        <nav className="tab-nav">
          <button
            type="button"
            className={activeTab === TABS.LEADERBOARD ? 'active' : ''}
            onClick={() => this.handleTabChange(TABS.LEADERBOARD)}
          >
            Leaderboard
          </button>
          <button
            type="button"
            className={activeTab === TABS.LOG_MATCH ? 'active' : ''}
            onClick={() => this.handleTabChange(TABS.LOG_MATCH)}
          >
            Log Match
          </button>
          <button
            type="button"
            className={activeTab === TABS.HISTORY ? 'active' : ''}
            onClick={() => this.handleTabChange(TABS.HISTORY)}
          >
            History
          </button>
        </nav>

        <main className="App-main">
          {loading && <p className="status-message">Loading...</p>}
          {message && <p className="status-message success">{message}</p>}
          {error && <p className="status-message error">{error}</p>}
          {this.renderActiveTab()}
        </main>
      </div>
    );
  }
}

export default App;
