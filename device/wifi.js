var wifi = require('wifi-cc3000');
var config = require("./config.json");

var wifiManager = {
  connect: function connect(next) {
    console.log("[wifiManager] Connecting to %s...", config.wifi.network)
		console.log(config.wifi)

    wifi.connect({
      security: config.wifi.security || 'wpa2'
      , ssid: config.wifi.network
      , password: config.wifi.password
      , timeout: config.wifi.timeout || '20s'
    }, next);
  }
  ,
  powerCycle: function powerCycle() {
    wifi.reset(function() {
      console.log('[wifiManager] Reset called');
      allowedTimeouts = 0+config.allowedTimeouts;
      setTimeout(function() {
        if (!wifi.isConnected()) {
          console.log('[wifiManager] Wifi not connected, trying...');
          wifiManager.connect()
        }
      }, 20 * 1000);
    })
  }
};
console.log("[wifiManager] Exporting...");
module.exports = wifiManager;
