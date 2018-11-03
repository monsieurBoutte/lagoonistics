const express = require('express');

const app = express();

const axios = require('axios');

const getLoboSensors = require('../services/lobo-service.js');
const getKilroySensors = require('../services/kilroy-service.js');

app.get('/', (req, res) => {
  res.send('response from server');
});

app.get('/lobo', async (req, res) => {
  const result = await getLoboSensors();
  res.send(result);
})

app.get('/killroy', async (req, res) => {
  const result = await getKilroySensors();
  res.send(result);
});

app.listen(4010, () => console.log('app listening on port 4010!'));
