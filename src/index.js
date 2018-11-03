const express = require('express');
const fetchSensorInformation = require('../services/saintJohn-service');
const app = express();

app.get('/', (req, res) => {
  res.send('response from server');
});

app.get('/saint-john', async (req, res) => {
  try {
    const response = await fetchSensorInformation();
    res.status(200).send(response);
  } catch (error) {
    res.status(500).send(error)
  }
})

app.listen(4010, () => console.log('app listening on port 4010!'));