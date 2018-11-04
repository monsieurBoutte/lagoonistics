const axios = require("axios");
const cheerio = require("cheerio");
const moment = require("moment-timezone");

const KILROY_WEB = "http://api.kilroydata.org/public/";
const KILROY_DATA_REGEX = /d\s\=\s(.*)\;/;

const createSnapshot = require('../src/create-sensor-snapshot');

const SOURCE = 'KILROY';

// 1. function that gets raw kilroy data set
// 2. function that consumes kilroy data ->
async function getKilroyData() {
  console.log(`Fetching ${KILROY_WEB}`);
  const { data } = await axios.get(KILROY_WEB);
  const regexMatch = data.match(KILROY_DATA_REGEX);
  const dataString = regexMatch && regexMatch[1];
  let dataObject;

  console.log("Parsing kilroy response...");
  try {
    dataObject = JSON.parse(dataString);
  } catch (error) {
    console.error(error);
  }

  return dataObject;
}

function transformKilroyData(data) {
  console.log("Transforming data");
  const result = data.mlist.reduce((prev, current) => {
    let { name, alt_name, lat, lon } = current;
    let data = current.mea_list.map(({ label, value }) => {
      const valueText = cheerio.load(value).text();
      const valueWithoutParens = valueText.replace(/ *\([^)]*\) */g, "");
      const numericalValue = parseFloat(valueWithoutParens);
      const units = valueWithoutParens.replace(/[0-9] /, '');
      var labelString = label;

      // Change the name of the label in order to normalize it with the lobo service
      var shouldBe = {
        "Chlorophyll a": "Cholorphyll",
        "Dissolved Oxygen": "Dissolved O2",
        "pH Level": "pH",
        "Water Temp.": "Temperature"
      }

      var properLabel = shouldBe[labelString] || labelString

      return { properLabel, numericalValue, units };
    });

    var date = new Date();
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);

    const format = "YYYY-MM-DD HH:mm:ss z"
    var dateString = moment(date).tz('America/New_York').format();

    let sensorData = {};

    sensorData.data = data;
    sensorData.date = dateString;
    sensorData.source = SOURCE;
    sensorData.displayName = alt_name;
    sensorData.sensorId = name;
    sensorData.long = lon;
    sensorData.lat = lat;

    var sensorSnapshot = createSnapshot(sensorData);
    prev.push(sensorSnapshot);
    return prev;

    // prev.push(createSnapshot({
    //   data,
    //   name,
    //   alt_name,
    //   lat,
    //   long: lon
    // }));

    // return prev;
  }, []);

  return result;
}

module.exports = async function getAndTransform() {
  const data = await getKilroyData();
  const transformed = transformKilroyData(data);

  return transformed;
};
