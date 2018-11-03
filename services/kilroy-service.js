const axios = require("axios");
const cheerio = require("cheerio");

const KILROY_WEB = "http://api.kilroydata.org/public/";
const KILROY_DATA_REGEX = /d\s\=\s(.*)\;/;

// Get HTML
const getKilroySensors = function(res) {
  axios.get(KILROY_WEB).then(({ data }) => {
    const regexMatch = data.match(KILROY_DATA_REGEX);
    const dataString = regexMatch && regexMatch[1];

    if (dataString) {
      const data = JSON.parse(dataString);
      const result = data.mlist.reduce((prev, current) => {
        let data = current.mea_list.map(({ label, value }) => {

          var valu = cheerio.load(value).text();
          valu = parseFloat(valu);
          return { label, valu };
        });
        let { name, alt_name, lat, lon } = current;

        prev.push({ data, name, alt_name, lat, lon });

        return prev;
      }, []);

      console.log({ result });
      res({result})
    } else {
      console.log("NO MATCH");
    }
  });
}

module.exports = getKilroySensors;
