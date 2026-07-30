const { createApp } = require('./app');
const { resetDb } = require('./db/db');

const PORT = process.env.PORT || 3000;
const app = createApp();

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Foosball Ranking Server listening on 0.0.0.0:${PORT}`);
});

function shutdown() {
  server.close(() => {
    resetDb();
    process.exit(0);
  });
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
