var tessel = require('tessel');
var gpio = tessel.port.GPIO;
var request = require('request');
var led = require('tessel-led');
var tesselWifi = require('tessel-wifi');
var config = require("./config.json");
request.debug = true;

function readTemperatureAndReport() {
  console.log('[readTemperatureAndReport]');
  var pin = gpio.analog[0];
  console.log(pin);
  var rawPinValue = pin.read();
  var volts = rawPinValue * 3300.0 / pin.resolution;
  console.log('[readTemperatureAndReport] volts', volts);
  var temp_C = (volts - 0.5) * 100.0;
  var temp_F = (temp_C * 9.0 / 5.0) + 32;
  console.log('[readTemperatureAndReport] celsius:', temp_C);
  console.log('[readTemperatureAndReport] fahrehneit:', temp_F);

  postToKeen(temp_F);
}

function postToKeen(temp_F) {
  var url = 'http://thermonoto.herokuapp.com/temperature_updates';
  var data = {temperature: temp_F};

  request.get({url: url}, function(e, res) { console.log('made get', e, res); });

  console.log("[postToKeen] POSTing to", url, data);
  request.post({url: url, form: data}, function(e, res) {
    console.log('[postToKeen] response', e, res);
    if (!e) {
			console.log('[postToKeen] success', res.body);
		}
    else {
      console.error("[postToKeen] http error", e);
    }
	});
}

tesselWifi.prototype.DEBUG = true;

function main() {
  function handleWifiError(err) {
    console.error(err);
    wifi.reconnect();
    led.red.blink();
  }

  var wifi = new tesselWifi({
    ssid: config.wifi.network,
    password: config.wifi.password,
    reconnect: 10,
    powerCycle: 5,
  });
  console.log('booting with wifi config', config.wifi)
  console.log(wifi);

  wifi.on("connect", function(data) {
    console.log('wifi> on:connect', data);
    setInterval(readTemperatureAndReport, 10000);
    led.green.show();
    led.blue.hide();
  })
  .on("disconnect", function(data) {
    console.log('wifi> on:disconnect', data);
    led.green.hide();
    led.blue.show();
    clearInterval(readTemperatureAndReport);
  })
  .on('error', handleWifiError);

  console.log("Running thermo.js...");
  led.blue.show();
}

setTimeout(main, 6000);
