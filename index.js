var express = require('express');
var bodyParser = require('body-parser');
var keenIO = require('keen.io');
var request = require('request');
var app = express();
var path = require('path');
var moment = require('moment-timezone');

var Promise = require('bluebird');
var Schedule = require('./services/schedule');
var Thermostat = require('./services/thermostat');
var Switch = require('./services/switch');
var fetchOperatingHours = require('./services/fetchOperatingHours')

var redis = require("redis");
Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);

var redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
var redisClient = redis.createClient(redisUrl);

keen = keenIO.configure({
  projectId: process.env.KEEN_PROJECT_ID,
  writeKey: process.env.KEEN_WRITE_KEY
});

app.use(bodyParser.urlencoded({extended: true}));
app.set('port', (process.env.PORT || 5000));
app.use(express.static('public'))

app.set('view engine', 'ejs');

// Only auto-turn on the fan if it's hotter than 74 degrees.
var TEMP_THRESHOLD = parseFloat(process.env.TEMP_THRESHOLD) || 74.0;
var theSwitch = new Switch(undefined, false);

function toggleFan(temp) {
  return fetchOperatingHours(redisClient)
  .then(function(results) {
    var startTime = results[0];
    var endTime = results[1];
    var scheduler = new Schedule(startTime, endTime)

    if (!scheduler.isOn()) {
      console.log("Outside the hours of fan management. Skipping....");
      return theSwitch.flipOff()
      .then(() => false)
    }

    var thermostat = new Thermostat(TEMP_THRESHOLD, theSwitch);
    return thermostat.trigger(temp)
    .catch((err) => {
      console.error(err);
      return Promise.resolve(false);
    });
  });
};

app.get('/', function(request, response) {
  response.render('index.html.ejs');
});

app.get('/operating_hours', function(request, response) {
  fetchOperatingHours(redisClient)
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

  toggleFan(humidity)
  .then(function(isFanOn) {
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
