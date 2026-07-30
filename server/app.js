const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes/api');
const { errorHandler } = require('./middleware/errorHandler');

const buildPath = path.join(__dirname, '../build');

function createApp() {
  const app = express();

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use('/api', routes);

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(buildPath));

    app.get(/^(?!\/api(\/|$)).*/, (req, res, next) => {
      res.sendFile(path.join(buildPath, 'index.html'), (err) => {
        if (err) {
          next(err);
        }
      });
    });
  }

  app.use('/api', (req, res) => {
    res.status(404).json({ message: 'API route not found' });
  });

  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
