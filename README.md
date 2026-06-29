# foosball-react-nodejs

Foosball ranking system for tracking 2v2 office matches with Elo-style ratings.

## Stack

- Node.js + Express API
- React frontend
- SQLite persistence (`better-sqlite3`)
- Elo rating calculations via `elo-rank`

## Local development

1. Install dependencies:

```bash
npm install
```

2. Start the API (port 3000):

```bash
npm run dev:server
```

3. In another terminal, start the React dev server (port 8080):

```bash
npm run dev:client
```

Open `http://localhost:8080`. The React dev server proxies API requests to port 3000.

Local SQLite data is stored at `./data/foosball.db`.

## Production build

```bash
npm run build
NODE_ENV=production npm start
```

The Express server serves the React build and API on one port.

## API endpoints

- `GET /api/health` — health check
- `GET /api/players` — list players (sorted by rating)
- `POST /api/players` — add a player `{ "name": "Alice" }`
- `POST /api/game` — log a match `{ "winners": ["Alice", "Bob"], "losers": ["Charlie", "Dave"] }`
- `GET /api/matches` — list match history

## Deploy to Render

This repo includes a [`render.yaml`](render.yaml) Blueprint with:

- One web service (API + React static build)
- Persistent disk mounted at `/data` for SQLite

Connect the repo in the Render Dashboard and apply the Blueprint, or run:

```bash
render blueprints validate render.yaml
```

## Rating system

Player ratings use the [Elo rating system](https://en.wikipedia.org/wiki/Elo_rating_system). New players start at 1000. Team ratings are averaged before calculating the match delta.

References:

- https://www.npmjs.com/package/elo-rank
- https://en.wikipedia.org/wiki/Elo_rating_system
