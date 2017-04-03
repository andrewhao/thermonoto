var Promise = require('bluebird');

function fetchOperatingHours(redisClient) {
  var getStartTime = redisClient.getAsync("start_time");
  var getEndTime = redisClient.getAsync('end_time');
  return Promise.all([getStartTime, getEndTime]);
}

module.exports = fetchOperatingHours
