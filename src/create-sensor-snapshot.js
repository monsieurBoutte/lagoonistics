function createSensorSnapshot(obj) {
  console.log(obj);
  return {
    'sensorId': obj.sensorId || null,
    'source': obj.source || null,
    'date': obj.date || null,
    'displayName': obj.name,
    'lat': obj.lat,
    'long': obj.long,
    'data': obj.data,
    'filename': obj.source + "-" + obj.sensorId + "-" + obj.date.replace(/\:/g, '-').replace(/ /g, '-')
  };
}

module.exports = createSensorSnapshot;
