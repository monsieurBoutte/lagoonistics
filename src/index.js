const express = require('express');

const app = express();

const axios = require('axios');

const getLoboSensors = require('../services/lobo-service.js');
const getKilroySensors = require('../services/kilroy-service.js');

app.get('/', (req, res) => {
  res.send('response from server');
});

app.get('/lobo', (req, res) => {
  getLoboSensors( (response) => {
    res.send(response);
  });
})

app.get('/killroy', (req, res) => {
  getKilroySensors( (response) => {
    res.send(response);
  })
})

app.listen(4010, () => console.log('app listening on port 4010!'));
