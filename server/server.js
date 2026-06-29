const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;
const buildPath = path.join(__dirname, '../build');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/api', routes);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(buildPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Foosball Ranking Server listening on 0.0.0.0:${PORT}`);
});
