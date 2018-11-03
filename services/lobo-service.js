const axios = require("axios");
const cheerio = require("cheerio");
const cheerioTableparser = require('cheerio-tableparser');
const xml2js = require('xml2js');

const LOBO_BASE_URL = "http://fau-hboi.loboviz.com/latest/";
const LOBO_IRL_NODE_IDS = ['0054', '0035', '0056', '0055', '0062', '0061'];

// Takes the raw xml data from the response of a single call to LOBO_BASE_URL/{id}.kml
// and returns a sensor
function parseSensor(rawSensorData) {
  let sensor = {};
  xml2js.parseString(rawSensorData, function (err, result) {

    // Get the relevant sensor data from the xml
    console.log(result);
    const sensorData = result.kml.Document[0].Placemark[0];

    // Get name
    sensor.name = sensorData.name[0];

    // Get lat/long
    const point = sensorData.Point[0].coordinates[0].split(',');
    sensor.long = parseFloat(point[0]);
    sensor.lat = parseFloat(point[1]);

    // Get the sensory data (temp, salinity, turbidity, etc.)
    let sensoryData = [];
    const tableHtml = sensorData.description[0].trim();
    const tableParser = cheerio.load(tableHtml);
    cheerioTableparser(tableParser);
    const table = tableParser("table table").parsetable();
    const LABELS = 0, VALUES = 1, UNITS = 2;
    for (let col = 1; col < table[0].length; col++) {
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

async function getLoboSensors() {
  // Make the requests
  const sensorRequests = LOBO_IRL_NODE_IDS.map( id => axios.get(LOBO_BASE_URL + id + '.kml') );
  const rawSensorDataArr = await axios.all(sensorRequests)

  // Step through each result and parse the sensors
  const sensors = rawSensorDataArr.reduce((acc, current) => {
    return [
      ...acc,
      parseSensor(current.data)
    ]
  }, []);

  return sensors;
}

module.exports = getLoboSensors;
