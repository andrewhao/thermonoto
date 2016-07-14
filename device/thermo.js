var tessel = require('tessel');
var wifiManager = require('./wifi');
var wifi = require('wifi-cc3000');
var gpio = tessel.port.GPIO;
var request = require('request');
var toggleLed = require('./toggleLed');

function readTemperatureAndReport() {
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
  var data = {temperature: temp_F};

  console.log("POSTing to", url, data);
	toggleLed(0, 2);
  request.post({url: url, form: data}, function(e, res) {
    if (!e) {
			console.log('success', res.body)
			toggleLed(1, 2);
		}
    else { console.error("http error", e) }
	});
}

wifi.on("connect", function(data) {
	setInterval(readTemperatureAndReport, 10000)
	toggleLed(0, 100);
  console.log('wifi> on:connect', data);
});
wifi.on("disconnect", function(data) {
	clearInterval(readTemperatureAndReport)
	toggleLed(1, 100);
  console.log('wifi> on:disconnect', data);
});
wifi.on("timeout", function(data) {
  console.log('wifi> on:timeout', data);
  wifiManager.powerCycle()
});
wifi.on("error", function(data) {
  console.log('wifi> on:error', data);
});

console.log("Running thermo.js...")
setTimeout(function() {
	console.log("[wifiManager] Connecting with the wifiManager..")
  wifiManager.connect(function(err, res) {
		if(!err) {
			console.log('[wifiManager] connected', res);
		}
    else { console.error('[wifiManager] connection error', err) }
  })
}, 6000);
