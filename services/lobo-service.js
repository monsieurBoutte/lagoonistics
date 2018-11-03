const axios = require("axios");
const cheerio = require("cheerio");
const cheerioTableparser = require('cheerio-tableparser');
const xml2js = require('xml2js');

const LOBO_BASE_URL = "http://fau-hboi.loboviz.com/latest/";
const LOBO_IRL_NODE_IDS = ['0054', '0035', '0056', '0055', '0062', '0061'];

var sensorRequests = LOBO_IRL_NODE_IDS.map ( id => axios.get(LOBO_BASE_URL + id + '.kml') );

function parseSensor(response) {
  var sensor = {};
  xml2js.parseString(response.data, function (err, result) {

    // Get the relevant sensor data from the xml
    const sensorData = result.kml.Document[0].Placemark[0];

    // Get name
    sensor.name = sensorData.name[0];

    // Get lat/long
    const point = sensorData.Point[0].coordinates[0].split(',');
    sensor.lon = parseFloat(point[0]);
    sensor.lat = parseFloat(point[1]);

    // Get the sensory data (temp, salinity, turbidity, etc.)
    var sensoryData = [];
    var tableHtml = sensorData.description[0].trim();
    var tableParser = cheerio.load(tableHtml);
    cheerioTableparser(tableParser);
    const table = tableParser("table table").parsetable();
    const LABELS = 0, VALUES = 1, UNITS = 2;
    for (var col = 1; col < table[0].length; col++) {
      sensoryData.push({
        'label':  cheerio.load(table[LABELS][col]).text(),
        'value': cheerio.load(table[VALUES][col]).text(),
        'unit': cheerio.load(table[UNITS][col]).text()
      })
    }
    sensor.data = sensoryData;
  });
  return sensor;
};

axios.all(sensorRequests).then(response => {
  const sensors = response.reduce((acc, current) => {
    return [
      ...acc,
      parseSensor(current)
    ]
  }, []);
  console.log(JSON.stringify(sensors, null, 2));
  return sensors;
}).catch(err => {
  console.log(err);
});
