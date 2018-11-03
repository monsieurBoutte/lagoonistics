const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.send('response from server');
});

app.listen(4010, () => console.log('app listening on port 4010!'));