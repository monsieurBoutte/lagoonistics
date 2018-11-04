const express = require('express');
const fetchSensorInformation = require('../services/saintJohn-service');
const app = express();

const axios = require('axios');
const saveSnapshot = require('../services/snapshot-service');

const getLoboSensors = require('../services/lobo-service.js');
const getKilroySensors = require('../services/kilroy-service.js');

app.get('/', (req, res) => {
  res.send('response from server');
});

app.get('/lobo', async (req, res) => {
  const result = await getLoboSensors();
  res.send(result);

  result.forEach( snapshot => saveSnapshot(snapshot) );
})

app.get('/killroy', async (req, res) => {
  const result = await getKilroySensors();
  res.send(result);
});

app.listen(4010, () => console.log('app listening on port 4010!'));

app.get('/saint-john', async (req, res) => {
  try {
    const response = await fetchSensorInformation();
    res.status(200).send(response);
  } catch (error) {
    res.status(500).send(error)
  }
})
