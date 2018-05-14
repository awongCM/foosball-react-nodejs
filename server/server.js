const express = require('express'),
      bodyParser = require('body-parser'),
      app = express();
      routes = require('./routes/api');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use('/api', routes);

app.listen(process.env.PORT || 3000, () => console.log('Foosball Ranking Server listening on port 3000'));