var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.urlencoded());

app.set('port', (process.env.PORT || 5000));

app.get('/temperature_updates', function(request, response) {
  response.sendStatus(200);
});
app.post('/temperature_updates', function(request, response) {
  console.log(response)
  console.log(response.query)
  console.log(response.body)
  response.sendStatus(200);
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
