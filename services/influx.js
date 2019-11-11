const Client = require("@influxdata/influx").Client;

const influxClient = new Client(
  process.env.INFLUXDB_SERVER_URL,
  process.env.INFLUXDB_TOKEN
);

function writeMetric(
  name,
  fieldSet,
  tagSet = {},
  INFLUXDB_ORG_ID = process.env.INFLUXDB_ORG_ID,
  INFLUXDB_BUCKET_ID = process.env.INFLUXDB_BUCKET_ID,
  client = influxClient,
) {

  let tagSetMetric = '';
  if (Object.keys(tagSet).length > 0) {
    items = keyify(tagSet)
    tagSetMetric = `,${items}`
  }


  const lineMetric = `${name}${tagSetMetric} ${keyify(fieldSet)}`;
  return client.write.create(
    INFLUXDB_ORG_ID,
    INFLUXDB_BUCKET_ID,
    lineMetric
  );
}

function keyify(set) {
  return Object.entries(set).map(([key, val]) => `${key}=${val}`).join(',')
}

module.exports = {
  writeMetric,
};
