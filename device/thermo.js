var tessel = require('tessel');
var wifiManager = require('./wifiManager');
var wifi = require('wifi-cc3000');
var gpio = tessel.port.GPIO;
var request = require('request');
var led = require('tessel-led');
var tesselWifi = require('tessel-wifi');
var config = require("./config.json");

function readTemperatureAndReport() {
  console.log('reading temp');
  var pin = gpio.analog[0];
  console.log(pin);
  var rawPinValue = pin.read();
  var volts = rawPinValue * 3300.0 / pin.resolution;
  console.log('volts', volts);
  var temp_C = (volts - 0.5) * 100.0;
  var temp_F = (temp_C * 9.0 / 5.0) + 32;
  console.log('celsius:', temp_C);
  console.log('fahrehneit:', temp_F);

  var url = 'http://thermonoto.herokuapp.com/temperature_updates';
  var data = {temperature: temp_F};

  console.log("POSTing to", url, data);
  led.blue.flash(5, 50);
  request.post({url: url, form: data}, function(e, res) {
    if (!e) {
			console.log('success', res.body);
      led.blue.flash(10, 25);
		}
    else {
      led.red.flash(5, 50);
      console.error("http error", e);
    }
	});
}

function handleWifiError(err) {
  console.error(err);
  led.red.blink();
}

var wifi = new tesselWifi({
  ssid: config.wifi.network,
  password: config.wifi.password,
  DEBUG: true,
});

wifi.on("connect", function(err, data) {
  if (!err) {
    setInterval(readTemperatureAndReport, 10000);
    led.green.show();
    console.log('wifi> on:connect', data);
  }
  else {
    handleWifiError(err);
  }
})
.on("disconnect", function(err, data) {
  if (!err) {
    led.green.hide();
    clearInterval(readTemperatureAndReport);
    console.log('wifi> on:disconnect', data);
  } else {
    handleWifiError(err);
  }
})
.on('error', handleWifiError);

console.log("Running thermo.js...");

