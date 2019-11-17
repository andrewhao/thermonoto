var request = require("request-promise");

function writeMetric(
  name,
  fieldSet,
  tagSet = {},
  INFLUXDB_ORG_ID = process.env.INFLUXDB_ORG_ID,
  INFLUXDB_BUCKET_ID = process.env.INFLUXDB_BUCKET_ID,
  INFLUXDB_SERVER_URL = process.env.INFLUXDB_SERVER_URL,
  INFLUXDB_TOKEN = process.env.INFLUXDB_TOKEN,
  requestLib = request
) {
  let tagSetMetric = "";
  if (Object.keys(tagSet).length > 0) {
    items = keyify(tagSet);
    tagSetMetric = `,${items}`;
  }

  const lineMetric = `${name}${tagSetMetric} ${keyify(fieldSet)}`;
  const url = `${INFLUXDB_SERVER_URL}/api/v2/write?org=${INFLUXDB_ORG_ID}&bucket=${INFLUXDB_BUCKET_ID}&precision=s`;
  return requestLib
    .post(url, {
      body: lineMetric,
      headers: {
        Authorization: `Token ${INFLUXDB_TOKEN}`
      }
    })
    .then(() => console.log("success"))
    .catch(e => console.error(e));
}

function keyify(set) {
  return Object.entries(set)
    .map(([key, val]) => `${key}=${val}`)
    .join(",");
}

module.exports = {
  writeMetric
};
