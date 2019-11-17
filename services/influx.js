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
    items = keyify(sortOnKeys(tagSet));
    tagSetMetric = `,${items}`;
  }

  const fs = fieldSetDataFormat(sortOnKeys(fieldSet));

  const lineMetric = `${name}${tagSetMetric} ${keyify(fs)}`;
  console.log(lineMetric);
  const url = `${INFLUXDB_SERVER_URL}/api/v2/write?org=${INFLUXDB_ORG_ID}&bucket=${INFLUXDB_BUCKET_ID}&precision=s`;
  return requestLib
    .post(url, {
      body: lineMetric,
      headers: {
        Authorization: `Token ${INFLUXDB_TOKEN}`
      }
    })
    .then(() => console.log("Logged metric successfully to InfluxDB"))
    .catch(e => console.error(e));
}

function fieldSetDataFormat(set) {
  return Object.entries(set).reduce((acc, entry) => {
    const [key, val] = entry;
    return { ...acc, [key]: cast(key, val) };
  }, {});
}

function cast(key, val) {
  if (typeof val === "string") {
    return `"${val}"`;
  }
  if (key.startsWith("is") && (val == 0 || val == 1)) {
    return !!val;
  }
  return val;
}

function keyify(set) {
  return Object.entries(set)
    .map(([key, val]) => `${key}=${val}`)
    .join(",");
}

function sortOnKeys(set) {
  return Object.entries(set)
    .sort((a, b) => a[0] > b[0])
    .reduce((acc, entry) => {
      return { ...acc, [entry[0]]: entry[1] };
    }, {});
}

module.exports = {
  writeMetric
};
