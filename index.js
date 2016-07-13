var express = require('express');
var bodyParser = require('body-parser');
var keenIO = require('keen.io');
var app = express();

keen = keenIO.configure({
  projectId: process.env.KEEN_PROJECT_ID,
  writeKey: process.env.KEEN_WRITE_KEY
});

app.use(bodyParser.raw());

app.set('port', (process.env.PORT || 5000));

app.get('/temperature_updates', function(request, response) {
  response.sendStatus(200);
});

app.post('/temperature_updates', function(request, response) {
  console.log(request.body);
  keen.addEvent("temperature_updates", { temperature: request.body.temperature }, function(err, res) {
    if(err) {
      console.error("Error updating Keen", err);
      throw "Error updating Keen.";
    }
    else {
      response.sendStatus(200);
    }
  });
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
