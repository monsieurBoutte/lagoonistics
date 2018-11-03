const axios = require('axios');
const flattenDeep = require('lodash/flattenDeep');

const formatMapServerRequest = (queryParam, geometryParam) => `
  http://webapub.sjrwmd.com/arcgis/
  rest/services/srvc/cw/MapServer/0/
  query?f=json&where=PARAM%3D%27${queryParam}%27
  &returnGeometry=true
  &spatialRel=esriSpatialRelIntersects
  &geometry=${geometryParam}
  &geometryType=esriGeometryEnvelope
  &inSR=102100&outFields=*
  &outSR=102100
`;

const formatGraphRequest = (hydronNumber, queryParamCode) => `
  http://webapub.sjrwmd.com
  /proxycache10
  /hdsf
  /ForWeb
  /${hydronNumber}_${queryParamCode}.png
`;

const listOfLocations = [
  {
    location: 'Indian River Lagoon',
    geometryParam: '%7B%22xmin%22%3A-9671881.83722554%2C%22ymin%22%3A3446770.161392245%2C%22xmax%22%3A-9326360.953706762%2C%22ymax%22%3A3792291.0449110237%2C%22spatialReference%22%3A%7B%22wkid%22%3A102100%2C%22latestWkid%22%3A3857%7D%7D'
  },
  {
    location: 'Indian River Lagoon',
    geometryParam: '%7B%22xmin%22%3A-9326360.953706762%2C%22ymin%22%3A3446770.161392245%2C%22xmax%22%3A-8980840.070187982%2C%22ymax%22%3A3792291.0449110237%2C%22spatialReference%22%3A%7B%22wkid%22%3A102100%2C%22latestWkid%22%3A3857%7D%7D'
  },
  {
    location: 'Indian River Lagoon',
    geometryParam: '%7B%22xmin%22%3A-8980840.070187982%2C%22ymin%22%3A3446770.161392245%2C%22xmax%22%3A-8635319.186669203%2C%22ymax%22%3A3792291.0449110237%2C%22spatialReference%22%3A%7B%22wkid%22%3A102100%2C%22latestWkid%22%3A3857%7D%7D'
  },
  {
    location: 'Indian River Lagoon',
    geometryParam: '%7B%22xmin%22%3A-8635319.186669203%2C%22ymin%22%3A3446770.161392245%2C%22xmax%22%3A-8289798.303150425%2C%22ymax%22%3A3792291.0449110237%2C%22spatialReference%22%3A%7B%22wkid%22%3A102100%2C%22latestWkid%22%3A3857%7D%7D'
  },
  {
    location: 'Indian River Lagoon',
    geometryParam: '%7B%22xmin%22%3A-9671881.83722554%2C%22ymin%22%3A3101249.277873466%2C%22xmax%22%3A-9326360.953706762%2C%22ymax%22%3A3446770.161392245%2C%22spatialReference%22%3A%7B%22wkid%22%3A102100%2C%22latestWkid%22%3A3857%7D%7D'
  },
  {
    location: 'Indian River Lagoon',
    geometryParam: '%7B%22xmin%22%3A-9326360.953706762%2C%22ymin%22%3A3101249.277873466%2C%22xmax%22%3A-8980840.070187982%2C%22ymax%22%3A3446770.161392245%2C%22spatialReference%22%3A%7B%22wkid%22%3A102100%2C%22latestWkid%22%3A3857%7D%7D'
  },
  {
    location: 'Indian River Lagoon',
    geometryParam: '%7B%22xmin%22%3A-8980840.070187982%2C%22ymin%22%3A3101249.277873466%2C%22xmax%22%3A-8635319.186669203%2C%22ymax%22%3A3446770.161392245%2C%22spatialReference%22%3A%7B%22wkid%22%3A102100%2C%22latestWkid%22%3A3857%7D%7D'
  },
  {
    location: 'Indian River Lagoon',
    geometryParam: '%7B%22xmin%22%3A-8635319.186669203%2C%22ymin%22%3A3101249.277873466%2C%22xmax%22%3A-8289798.303150425%2C%22ymax%22%3A3446770.161392245%2C%22spatialReference%22%3A%7B%22wkid%22%3A102100%2C%22latestWkid%22%3A3857%7D%7D'
  },
  {
    location: 'Indian River Lagoon',
    geometryParam: '%7B%22xmin%22%3A-9671881.83722554%2C%22ymin%22%3A2755728.394354687%2C%22xmax%22%3A-9326360.953706762%2C%22ymax%22%3A3101249.277873466%2C%22spatialReference%22%3A%7B%22wkid%22%3A102100%2C%22latestWkid%22%3A3857%7D%7D'
  },
  {
    location: 'Indian River Lagoon',
    geometryParam: '%7B%22xmin%22%3A-9326360.953706762%2C%22ymin%22%3A2755728.394354687%2C%22xmax%22%3A-8980840.070187982%2C%22ymax%22%3A3101249.277873466%2C%22spatialReference%22%3A%7B%22wkid%22%3A102100%2C%22latestWkid%22%3A3857%7D%7D'
  },
  {
    location: 'Indian River Lagoon',
    geometryParam: '%7B%22xmin%22%3A-8980840.070187982%2C%22ymin%22%3A2755728.394354687%2C%22xmax%22%3A-8635319.186669203%2C%22ymax%22%3A3101249.277873466%2C%22spatialReference%22%3A%7B%22wkid%22%3A102100%2C%22latestWkid%22%3A3857%7D%7D'
  },
  {
    location: 'Indian River Lagoon',
    geometryParam: '%7B%22xmin%22%3A-8635319.186669203%2C%22ymin%22%3A2755728.394354687%2C%22xmax%22%3A-8289798.303150425%2C%22ymax%22%3A3101249.277873466%2C%22spatialReference%22%3A%7B%22wkid%22%3A102100%2C%22latestWkid%22%3A3857%7D%7D'
  },
];

const listOfQueryParamsAndCodes = [
  {
    queryParam: 'DISSOLVED_OXYGEN_CUR',
    queryParamCode: 'DO'
  },
  {
    queryParam: 'SALINITY_CUR',
    queryParamCode: 'SALINITY'
  },
  {
    queryParam: 'WATER_TEMP_CUR',
    queryParamCode: 'WATER_TEMP'
  },
  {
    queryParam: 'TURBIDITY_CUR',
    queryParamCode: 'TURBIDITY'
  },
  {
    queryParam: 'PHOSPHATE_CUR',
    queryParamCode: 'PHOSPHATE'
  },
  {
    queryParam: 'DEPTH_CUR',
    queryParamCode: 'DEPTH'
  },
  {
    queryParam: 'CONDUCTIVITY_CUR',
    queryParamCode: 'CONDUCTIVITY'
  },
  {
    queryParam: 'PH_CUR',
    queryParamCode: 'PH'
  },
];

const queryParamCodeLookUp = queryParam => {
  switch (queryParam) {
    case 'DISSOLVED_OXYGEN_CUR':
      return 'DO';
    case 'SALINITY_CUR':
      return 'SALINITY';
    case 'WATER_TEMP_CUR':
      return 'WATER_TEMP';
    case 'TURBIDITY_CUR':
      return 'TURBIDITY';
    case 'PHOSPHATE_CUR':
      return 'PHOSPHATE';
    case 'DEPTH_CUR':
      return 'DEPTH';
    case 'CONDUCTIVITY_CUR':
      return 'CONDUCTIVITY';
    case 'PH_CUR':
      return 'PH';
  }
};

// reducer for creating a list of url's to query for sensor locations
// that's currently 12 locations and 8 different parameters for each location
// that's 96 urls that need to be hit ¯\_(ツ)_/¯
const listOfSaintJohnUrls = listOfLocations.reduce((accumulator, currentValue) => {
  const sensorLocationUrls = listOfQueryParamsAndCodes.map(
    val =>
      formatMapServerRequest(val.queryParam, currentValue.geometryParam)
        .replace(/\s+/g, '')
  );
  return [
    ...accumulator,
    ...sensorLocationUrls
  ];
}, []);

const fetchSensorGraph = sensor => formatGraphRequest(sensor.attributes.HYDRON_NUMBER, queryParamCodeLookUp(sensor.attributes.PARAM)).replace(/\s+/g, '')

const fetchSensorInformation = async () => {
  try {
    const allSensorLocations = listOfSaintJohnUrls.map(saintJohnUrl => axios.get(saintJohnUrl));
    const request = await Promise.all(allSensorLocations);
    const sensorLocationInfo = request
      .map(location => location.data)
      .filter(location => location.features.length > 0)
      .map(sensor => sensor.features);
    const packagedSensorInfo = flattenDeep(sensorLocationInfo).reduce((accumulator, currentValue) => {
      return [
        ...accumulator,
        {
          metaData: { ...currentValue },
          sensorGraphUrl: fetchSensorGraph(currentValue)
        }
      ]
    }, [])
    return packagedSensorInfo;
  } catch (error) {
    console.error('Error:', error);
  }
};


module.exports = fetchSensorInformation;