var tessel = require('tessel');
var wifi = require('./wifi');
var gpio = tessel.port.GPIO;
var request = require('request');

wifi.connect()
console.log('connected');

setInterval(function() {
  console.log('reading temp')
  var pin = gpio.analog[0];
  console.log(pin)
  var rawPinValue = pin.read()
  var volts = rawPinValue * 3300.0 / pin.resolution;
  console.log('volts', volts);
  var temp_C = (volts - 0.5) * 100.0;
  var temp_F = (temp_C * 9.0 / 5.0) + 32;
  console.log('celsius:', temp_C);
  console.log('fahrehneit:', temp_F);

  var url = 'http://thermonoto.herokuapp.com/temperature_updates';
  var data = 'data=' + temp_F;

  console.log("POSTing to", url, data);
  request.post(url).form({temperature: temp_F});
  //request.get(url, handleResponse);
}, 10000);

