var tessel = require('tessel');
var wifiManager = require('./wifi');
var wifi = require('wifi-cc3000');
var gpio = tessel.port.GPIO;
var request = require('request');

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

wifi.on("connect", function(data) {
  console.log('wifi> on:connect', data);
});
wifi.on("disconnect", function(data) {
  console.log('wifi> on:disconnect', data);
});
wifi.on("timeout", function(data) {
  console.log('wifi> on:timeout', data);
  if (timeouts-- > 0) {
    console.log("simple reconnect...");
    wifiManager.connect()
  } else {
    wifiManager.powerCycle()
  }
});
wifi.on("error", function(data) {
  console.log('wifi> on:error', data);
});

console.log("Running...")
console.log("%j", wifiManager)
wifiManager.connect()
