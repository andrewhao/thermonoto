var express = require('express');
var bodyParser = require('body-parser');
var keenIO = require('keen.io');
var request = require('request');
var app = express();
var moment = require('moment-timezone');
var path = require('path');
var redis = require("redis");

var redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
var redisClient = redis.createClient(redisUrl);
var Promise = require('bluebird');

Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);

keen = keenIO.configure({
  projectId: process.env.KEEN_PROJECT_ID,
  writeKey: process.env.KEEN_WRITE_KEY
});

app.use(bodyParser.urlencoded({extended: true}));
app.set('port', (process.env.PORT || 5000));

// Only auto-turn on the fan if it's hotter than 74 degrees.
var TEMP_THRESHOLD = parseFloat(process.env.TEMP_THRESHOLD) || 74.0;

function fanManagementEnabled() {
  // Enable fan management within certain time thresholds.
  var time = moment().tz('America/Los_Angeles');
  var START_TIME_HOUR_THRESHOLD = parseInt(process.env.START_TIME_HOUR_THRESHOLD);
  var END_TIME_HOUR_THRESHOLD = parseInt(process.env.END_TIME_HOUR_THRESHOLD);

  console.log('Current hour is:', time.hour());
  console.log('Start time: ', START_TIME_HOUR_THRESHOLD);
  console.log('End time: ', END_TIME_HOUR_THRESHOLD);

  return (time.hour() >= START_TIME_HOUR_THRESHOLD) &&
    (time.hour() < END_TIME_HOUR_THRESHOLD);
}

function toggleFan(temp, cb) {
  if (!fanManagementEnabled()) {
    console.log("Outside the hours of fan management. Skipping....");
    return cb(false);
  }

  console.log("toggling fan", temp);
  if (temp > TEMP_THRESHOLD) {
    console.log('OVER threshold. Turning on the fan...');
    request.get('https://maker.ifttt.com/trigger/too_hot/with/key/cYteZfZjX6aUMIR4dKoCFH')
      .on('response', function() { return cb(true) });
  } else {
    console.log('UNDER threshold. Turning off the fan...');
    request.get('https://maker.ifttt.com/trigger/too_cold/with/key/cYteZfZjX6aUMIR4dKoCFH')
    .on('response', function() { return cb(false) });
  }
};

app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/operating_hours', function(request, response) {
  var getStartTime = redisClient.getAsync("start_time");
  var getEndTime = redisClient.getAsync('end_time');
  Promise.all([getStartTime, getEndTime])
  .then(function(results) {
    var startTime = results[0];
    var endTime = results[1];
    var hours = {
      start_time: startTime,
      end_time: endTime
    };
    response.json(hours);
  });
});

app.put('/operating_hours', function(request, response) {
  console.log(request.body);
  var hours = {
    start_time: request.body.start_time,
    end_time: request.body.end_time
  };
  redisClient.setAsync("start_time", hours.start_time)
  .then(function() {
    return redisClient.setAsync("end_time", hours.end_time);
  })
  .then(function() {
    response.json(hours);
  });
});

app.get('/temperature_updates', function(request, response) {
  response.sendStatus(200);
});

app.post('/temperature_updates', function(request, response) {
  console.log(request.body);
  var temperature = parseFloat(request.body.temperature);
  var humidity = parseFloat(request.body.humidity);

  toggleFan(humidity, function(isFanOn) {
    keen.addEvent("temperature_updates", {
      temperature: temperature,
      humidity: humidity,
      isFanOn: isFanOn,
      device_id: request.body.device_id,
      receivedAt: new Date()
    }, function(err, res) {
      if(err) {
        console.error("Error updating Keen", err);
        throw "Error updating Keen.";
      }
      else {
        console.log('successfully logged to Keen');
        response.sendStatus(200);
      }
    });
  });
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
