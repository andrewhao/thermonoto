require("dotenv").config();

var express = require("express");
var bodyParser = require("body-parser");
var keenIO = require("keen.io");
var request = require("request");
var app = express();
var path = require("path");
var moment = require("moment-timezone");

var Promise = require("bluebird");
var Schedule = require("./services/schedule");
var Thermostat = require("./services/thermostat");
var Switch = require("./services/switch");
var fetchOperatingHours = require("./services/fetchOperatingHours");
var writeMetric = require("isomorphic-influx").writeMetric;

var redis = require("redis");
Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);

var redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
var redisClient = redis.createClient(redisUrl);

keen = keenIO.configure({
  projectId: process.env.KEEN_PROJECT_ID || "default",
  writeKey: process.env.KEEN_WRITE_KEY || "default,"
});

const urlencodedParser = bodyParser.urlencoded({ extended: true });

app.set("port", process.env.PORT || 5000);
app.use(express.static("public"));

app.set("view engine", "ejs");

// Only auto-turn on the fan if it's hotter than 74 degrees.
var TEMP_THRESHOLD = parseFloat(process.env.TEMP_THRESHOLD) || 74.0;
var theSwitch = new Switch(undefined, false);

function toggleFan(temp) {
  return fetchOperatingHours(redisClient).then(function(results) {
    var startTime = results[0];
    var endTime = results[1];
    var scheduler = new Schedule(startTime, endTime);

    if (!scheduler.isOn()) {
      return theSwitch.flipOff().then(() => false);
    }

    var thermostat = new Thermostat(TEMP_THRESHOLD, theSwitch);
    return thermostat.trigger(temp).catch(err => {
      return Promise.resolve(false);
    });
  });
}

app.get("/", function(request, response) {
  response.render("index.html.ejs");
});

app.get("/cry", function(request, response) {
  response.render("cry.html.ejs");
});

app.get("/operating_hours", function(request, response) {
  fetchOperatingHours(redisClient).then(function(results) {
    var startTime = results[0];
    var endTime = results[1];
    var hours = {
      start_time: startTime,
      end_time: endTime
    };
    response.json(hours);
  });
});

app.put("/operating_hours", function(request, response) {
  var hours = {
    start_time: request.body.start_time,
    end_time: request.body.end_time
  };
  redisClient
    .setAsync("start_time", hours.start_time)
    .then(function() {
      return redisClient.setAsync("end_time", hours.end_time);
    })
    .then(function() {
      response.json(hours);
    });
});

app.get("/temperature_updates", function(request, response) {
  response.sendStatus(200);
});

app.post("/ambient_noise_updates", urlencodedParser, function(request, response) {
  // {'pk_lev_db': '-48.51', 'rms_tr_db': '-79.41', 'rms_pk_db': '-61.28', 'rms_lev_db': '-75.40'}
  var rms_tr_db = parseFloat(request.body.rms_tr_db);
  var rms_pk_db = parseFloat(request.body.rms_pk_db);
  var rms_lev_db = parseFloat(request.body.rms_lev_db);
  var pk_lev_db = parseFloat(request.body.pk_lev_db);

  writeMetric(
    "ambient_noise_updates",
    {
      rms_tr_db: rms_tr_db,
      rms_pk_db: rms_pk_db,
      rms_lev_db: rms_lev_db,
      pk_lev_db: pk_lev_db
    },
    {
      device_id: request.body.device_id
    }
  )
    .then(() => {
      response.sendStatus(200);
    })
    .catch(err => {
    throw err;
  });
});

app.post("/cry_detection_updates", urlencodedParser, function(request, response) {
  var isCrying = parseInt(request.body.is_crying);
  var score = parseFloat(request.body.score);
  var humanString = request.body.human_string;
  var receivedAt = moment.tz(request.body.received_at, "Etc/UTC");

  writeMetric(
    "cry_detection_updates",
    {
      is_crying: isCrying,
      score: score,
      human_string: humanString
    },
    {
      device_id: request.body.device_id,
      human_string: humanString
    }
  )
    .then(() => {
      response.sendStatus(200);
    })
    .catch(err => {
    throw err;
  });
});

app.post("/air_quality_updates", bodyParser.json(), function(request, response) {
  const metric = {...request.body};
  delete metric.device_id

  writeMetric(
    "air_quality_updates",
    metric,
    {
      device_id: request.body.device_id,
    }
  )
    .then(() => {
      response.sendStatus(200);
    })
    .catch(err => {
    throw err;
  });
});

app.post("/temperature_updates", urlencodedParser, function(request, response) {
  var temperature = parseFloat(request.body.temperature);
  var humidity = parseFloat(request.body.humidity);

  if (humidity > 100) {
    return response.sendStatus(400);
  }

  toggleFan(humidity).then(function(isFanOn) {
    writeMetric(
      "temperature_updates",
      {
        temperature: temperature,
        humidity: humidity,
        isFanOn: isFanOn
      },
      {
        device_id: request.body.device_id
      }
    )
      .then(() => {
        response.sendStatus(200);
      })
      .catch(err => {
      throw err;
    });
  });
});


app.post("/motion_detection_updates", urlencodedParser, function(request, response) {
  writeMetric(
    "motion_detection_updates",
    {
      motion_detected: true
    },
    {
      device_id: request.body.device_id
    }
  )
    .then(() => {
      response.sendStatus(200);
    })
    .catch(err => {
    throw err;
  });
});

app.listen(app.get("port"), function() {});
