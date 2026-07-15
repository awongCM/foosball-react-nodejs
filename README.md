# foosball-react-nodejs

Foosball ranking system for tracking 2v2 office matches with Elo-style ratings.

## Stack

- Node.js + Express API
- React frontend (uses native `fetch` for API calls)
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

## Tests

```bash
npm test
```

## Production build

```bash
npm run build
NODE_ENV=production npm start
```

The Express server serves the React build and API on one port.

## API endpoints

- `GET /api/health` — health check (includes database connectivity)
- `GET /api/players` — list players (sorted by rating)
- `POST /api/players` — add a player `{ "name": "Alice" }`
- `POST /api/game` — log a match `{ "winners": ["Alice", "Bob"], "losers": ["Charlie", "Dave"] }`
- `GET /api/matches` — list match history

## Optional API protection

Set `API_KEY` to require authentication on write routes (`POST /api/players`, `POST /api/game`). In production, write routes are blocked until `API_KEY` is configured. Send the key via:

- `x-api-key: your-secret-key`, or
- `Authorization: Bearer your-secret-key`

When deploying the bundled React UI with auth enabled, also set `REACT_APP_API_KEY` to the same value at **build time** so the browser can submit matches. Read routes remain public. Leave both unset for local development.

## Deploy to Render

This repo includes a [`render.yaml`](render.yaml) Blueprint with:

- One web service (API + React static build)
- Persistent disk mounted at `/data` for SQLite
- Optional `API_KEY` secret (set in the Render Dashboard)

Connect the repo in the Render Dashboard and apply the Blueprint, or run:

```bash
render blueprints validate render.yaml
```

## Rating system

Player ratings use the [Elo rating system](https://en.wikipedia.org/wiki/Elo_rating_system). New players start at 1000. Team ratings are averaged before calculating the match delta.

References:

- https://www.npmjs.com/package/elo-rank
- https://en.wikipedia.org/wiki/Elo_rating_system
