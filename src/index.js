const express = require('express');

const app = express();

const axios = require('axios');

const getLoboSensors = require('../services/lobo-service.js');

app.get('/', (req, res) => {
  res.send('response from server');
});

app.get('/lobo', (req, res) => {
  getLoboSensors( (response) => {
    res.send(response);
  });
})

app.listen(4010, () => console.log('app listening on port 4010!'));
