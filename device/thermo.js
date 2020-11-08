var tessel = require('tessel');
var gpio = tessel.port.GPIO;
var request = require('request');
var led = require('tessel-led');
var tesselWifi = require('tessel-wifi');
var config = require("./config.json");
request.debug = true;

function readTemperatureAndReport() {
  var pin = gpio.analog[0];
  var rawPinValue = pin.read();
  var volts = rawPinValue * 3300.0 / pin.resolution;
  var temp_C = (volts - 0.5) * 100.0;
  var temp_F = (temp_C * 9.0 / 5.0) + 32;

  postToKeen(temp_F);
}

function postToKeen(temp_F) {
  var url = 'http://thermonoto.herokuapp.com/temperature_updates';
  var data = {temperature: temp_F};

  request.get({url: url}, function(e, res) {});

  request.post({url: url, form: data}, function(e, res) {
    if (!e) {}
    else {}
  });
}

tesselWifi.prototype.DEBUG = true;

function main() {
  function handleWifiError(err) {
    wifi.reconnect();
    led.red.blink();
  }

  var wifi = new tesselWifi({
    ssid: config.wifi.network,
    password: config.wifi.password,
    reconnect: 10,
    powerCycle: 5,
  });

  wifi.on("connect", function(data) {
    setInterval(readTemperatureAndReport, 10000);
    led.green.show();
    led.blue.hide();
  })
  .on("disconnect", function(data) {
    led.green.hide();
    led.blue.show();
    clearInterval(readTemperatureAndReport);
  })
  .on('error', handleWifiError);

  led.blue.show();
}

setTimeout(main, 6000);
