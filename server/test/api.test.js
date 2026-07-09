const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const request = require('supertest');

const { createApp } = require('../app');
const { resetDb, getDbPath } = require('../db/db');

let app;
let tempDir;

function removeDbFiles(dbPath) {
  for (const suffix of ['', '-wal', '-shm']) {
    const file = `${dbPath}${suffix}`;
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
    }
  }
}

before(() => {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'foosball-test-'));
  process.env.DB_PATH = path.join(tempDir, 'test.db');
});

after(() => {
  resetDb();
  removeDbFiles(getDbPath());
  if (tempDir && fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
  delete process.env.DB_PATH;
  delete process.env.API_KEY;
});

beforeEach(() => {
  delete process.env.API_KEY;
  resetDb();
  removeDbFiles(getDbPath());
  app = createApp();
});

test('health check verifies database connectivity', async () => {
  const response = await request(app).get('/api/health');

  assert.equal(response.status, 200);
  assert.equal(response.body.status, 'ok');
  assert.equal(response.body.db, 'ok');
});

test('match history keeps snapshot ratings after later matches', async () => {
  for (const name of ['Alice', 'Bob', 'Charlie', 'Dave']) {
    await request(app).post('/api/players').send({ name }).expect(201);
  }

  await request(app)
    .post('/api/game')
    .send({ winners: ['Alice', 'Bob'], losers: ['Charlie', 'Dave'] })
    .expect(201);

  await request(app)
    .post('/api/game')
    .send({ winners: ['Charlie', 'Dave'], losers: ['Alice', 'Bob'] })
    .expect(201);

  const matchesResponse = await request(app).get('/api/matches').expect(200);
  const matches = matchesResponse.body.payload.matches;

  assert.equal(matches.length, 2);

  const firstMatch = matches[1];
  const aliceInFirstMatch = firstMatch.winners.find((player) => player.name === 'Alice');

  assert.equal(aliceInFirstMatch.winRatio, 1008);

  const playersResponse = await request(app).get('/api/players').expect(200);
  const aliceCurrent = playersResponse.body.payload.players.find((player) => player.name === 'Alice');

  assert.equal(aliceCurrent.winRatio, 1000);
  assert.notEqual(aliceInFirstMatch.winRatio, aliceCurrent.winRatio);
});

test('rejects matches with missing players', async () => {
  await request(app).post('/api/players').send({ name: 'Alice' }).expect(201);

  const response = await request(app)
    .post('/api/game')
    .send({ winners: ['Alice'], losers: ['Nobody'] })
    .expect(400);

  assert.match(response.body.message, /unavailable player data/);
});

test('rejects duplicate players in the same match', async () => {
  await request(app).post('/api/players').send({ name: 'Alice' }).expect(201);
  await request(app).post('/api/players').send({ name: 'Bob' }).expect(201);

  const response = await request(app)
    .post('/api/game')
    .send({ winners: ['Alice'], losers: ['Alice'] })
    .expect(400);

  assert.match(response.body.message, /once in a match/);
});

test('rejects duplicate player names', async () => {
  await request(app).post('/api/players').send({ name: 'Alice' }).expect(201);

  const response = await request(app)
    .post('/api/players')
    .send({ name: 'alice' })
    .expect(409);

  assert.match(response.body.message, /already exists/);
});

test('rejects invalid winratio values', async () => {
  const response = await request(app)
    .post('/api/players')
    .send({ name: 'Alice', winratio: -5 })
    .expect(400);

  assert.match(response.body.message, /winratio must be a number/);
});

test('requires API key for write routes when configured', async () => {
  process.env.API_KEY = 'test-secret-key';
  app = createApp();

  await request(app).post('/api/players').send({ name: 'Alice' }).expect(401);

  await request(app)
    .post('/api/players')
    .set('x-api-key', 'test-secret-key')
    .send({ name: 'Alice' })
    .expect(201);

  await request(app).get('/api/players').expect(200);
});

test('match write persists players and match atomically', async () => {
  await request(app).post('/api/players').send({ name: 'Alice' }).expect(201);
  await request(app).post('/api/players').send({ name: 'Bob' }).expect(201);

  await request(app)
    .post('/api/game')
    .send({ winners: ['Alice'], losers: ['Bob'] })
    .expect(201);

  const playersResponse = await request(app).get('/api/players').expect(200);
  const alice = playersResponse.body.payload.players.find((player) => player.name === 'Alice');
  const bob = playersResponse.body.payload.players.find((player) => player.name === 'Bob');

  assert.equal(alice.winRatio, 1016);
  assert.equal(bob.winRatio, 984);
  assert.equal(alice.wins, 1);
  assert.equal(bob.losses, 1);

  const matchesResponse = await request(app).get('/api/matches').expect(200);
  assert.equal(matchesResponse.body.payload.matches.length, 1);
});
