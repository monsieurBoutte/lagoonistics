const axios = require("axios");
const cheerio = require("cheerio");

const KILROY_WEB = "http://api.kilroydata.org/public/";
const KILROY_DATA_REGEX = /d\s\=\s(.*)\;/;

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
      var value = cheerio.load(value).text();
      value = parseFloat(value);
      return { label, value };
    });

    prev.push({
      data,
      name,
      alt_name,
      lat,
      long: lon
    });

    return prev;
  }, []);

  return result;
}

module.exports = async function getAndTransform() {
  const data = await getKilroyData();
  const transformed = transformKilroyData(data);

  return transformed;
};
