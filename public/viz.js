Keen.ready(function() {
  var client = new Keen({
    projectId: "5786691233e40614f79844e2",
    readKey:
      "1d40bf9bbc24ce048783abb7b3c9b2a6ce6b4590aa28a495a4b46defe2108f6b8c4641da03bf038f7efe6fa407159360eb5ad9198f113dc3c35b87ed9f16c7badf53a3e349e71d2943dca1f5ae6dd3a829f0e192bf5546adbee78883de0c5720"
  });

  var query = new Keen.Query("average", {
    event_collection: "temperature_updates",
    group_by: ["device_id"],
    interval: "hourly",
    target_property: "humidity",
    timeframe: "this_24_hours",
    timezone: "US/Pacific"
  });

  var ambientNoiseChart = new Keen.Dataviz()
    .el("#ambient_noise")
    .height(window.innerHeight / 2)
    .title("Last Day Noise")
    .type("spline")
    .prepare();

  var cryDetectionChart = new Keen.Dataviz()
    .el("#cry_detection")
    .height(window.innerHeight / 2)
    .title("Cry Detection")
    .type("area-step")
    .colorMapping({
      crying: "red",
      silence: "green"
    })
    .prepare();

  var ambientNoiseQuery = new Keen.Query("average", {
    event_collection: "ambient_noise_updates",
    interval: "minutely",
    target_property: "rms_lev_db",
    timeframe: "this_600_minutes",
    timezone: "US/Pacific"
  });

  var ambientNoiseTroughQuery = new Keen.Query("average", {
    event_collection: "ambient_noise_updates",
    interval: "minutely",
    target_property: "rms_tr_db",
    timeframe: "this_600_minutes",
    timezone: "US/Pacific"
  });

  var ambientNoisePeakQuery = new Keen.Query("average", {
    event_collection: "ambient_noise_updates",
    interval: "minutely",
    target_property: "rms_pk_db",
    timeframe: "this_600_minutes",
    timezone: "US/Pacific"
  });

  var cryDetectionQuery = new Keen.Query("count_unique", {
    event_collection: "cry_detection_updates",
    filters: [
      {
        operator: "exists",
        property_name: "human_string",
        property_value: true
      }
    ],
    group_by: ["human_string"],
    interval: "minutely",
    target_property: "human_string",
    timeframe: "this_600_minutes",
    timezone: "US/Pacific"
  });

  var cryAccuracyQuery = new Keen.Query("average", {
    event_collection: "cry_detection_updates",
    filters: [
      {
        operator: "exists",
        property_name: "human_string",
        property_value: true
      }
    ],
    interval: "minutely",
    target_property: "score",
    timeframe: "this_600_minutes",
    timezone: "US/Pacific"
  });

  const queryAndRenderCryDetection = function() {
    client.run(cryDetectionQuery).then(function(detectionResult) {
      cryDetectionChart.data(detectionResult).render();
    });
  };

  queryAndRenderCryDetection();
  setInterval(queryAndRenderCryDetection, 60000);

  const queryAndRenderAmbientNoiseQueries = function() {
    client
      .run([ambientNoiseQuery, ambientNoiseTroughQuery, ambientNoisePeakQuery])
      .then(function(res) {
        var result1 = res[0].result; // data from first query
        var result2 = res[1].result; // data from second query
        var result3 = res[2].result; // data from third query
        var data = _.chain(_.zip(result1, result2, result3))
          .map(function(value) {
            return {
              timeframe: value[0]["timeframe"],
              value: [
                { category: "Average (dB)", result: value[0]["value"] },
                { category: "Trough (dB)", result: value[1]["value"] },
                { category: "Peak (dB)", result: value[2]["value"] }
              ]
            };
          })
          .value();

        var data$ = Rx.Observable.from(data)
          .filter(function(d) {
            return d.value[0].result !== null;
          })
          .bufferCount(5, 4)
          .map(function(aggregateReportGroup) {
            var reportValues = _.map(aggregateReportGroup, "value");
            var sum1 = _.chain(reportValues)
              .map(function(reportValue) {
                return reportValue[0].result;
              })
              .mean()
              .value();
            var sum2 = _.chain(reportValues)
              .map(function(reportValue) {
                return reportValue[1].result;
              })
              .mean()
              .value();
            var sum3 = _.chain(reportValues)
              .map(function(reportValue) {
                return reportValue[2].result;
              })
              .mean()
              .value();
            return {
              timeframe: _.first(aggregateReportGroup).timeframe,
              value: [
                { category: "Average (dB)", result: sum1 },
                { category: "Trough (dB)", result: sum2 },
                { category: "Peak (dB)", result: sum3 }
              ]
            };
          });
        var result$ = data$
          .toArray()
          .first()
          .subscribe(function(result) {
            // chart the data
            result = _.dropRight(result, 2);
            ambientNoiseChart.parseRawData({ result: result }).render();
          });
      });
  };
  queryAndRenderAmbientNoiseQueries();
  setInterval(queryAndRenderAmbientNoiseQueries, 60000);

  var dailyTemperatureQuery = new Keen.Query("average", {
    event_collection: "temperature_updates",
    group_by: ["device_id"],
    interval: "hourly",
    target_property: "temperature",
    timeframe: "this_24_hours",
    timezone: "US/Pacific"
  });

  client.draw(query, document.getElementById("daily_humidity"), {
    title: "Last Day Humidity",
    height: window.innerHeight / 2,
    vAxis: { gridLines: 12 }
  });

  client.draw(
    dailyTemperatureQuery,
    document.getElementById("daily_temperature"),
    {
      title: "Last Day Temperature",
      height: window.innerHeight / 2,
      vAxis: { gridLines: 12 }
    }
  );

  var query2 = new Keen.Query("average", {
    event_collection: "temperature_updates",
    filters: [
      {
        operator: "eq",
        property_name: "device_id",
        property_value: "flyhost"
      }
    ],
    target_property: "temperature",
    timeframe: "this_20_minutes",
    timezone: "US/Pacific"
  });

  client.draw(query2, document.getElementById("current_temperature"), {
    title: "Current Temperature (Flyhost)"
  });

  var query3 = new Keen.Query("average", {
    event_collection: "temperature_updates",
    filters: [
      {
        operator: "eq",
        property_name: "device_id",
        property_value: "flyhost"
      }
    ],
    target_property: "humidity",
    timeframe: "this_20_minutes",
    timezone: "US/Pacific"
  });

  client.draw(query3, document.getElementById("current_humidity"), {
    title: "Current Humidity (Flyhost)"
  });
});

var node = document.getElementById("app-root");
var app = Elm.App.embed(node, {
  serverUrl: "<%= process.env.CANONICAL_URL %>"
});
