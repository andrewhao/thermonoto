var wifi = require('wifi-cc3000');
var config = require("./config.json");
var toggleLed = require('./toggleLed');

var wifiManager = {
  connect: function connect(next) {
    console.log("[wifiManager] Connecting to %s...", config.wifi.network);
		console.log(config.wifi);

    // Green blink
    toggleLed(0, 4, 1000);

		wifi.connect({
			security: config.wifi.security,
			ssid: config.wifi.network,
			password: config.wifi.password
    }, next);
  },
  powerCycle: function powerCycle() {
    wifi.reset(function() {

      // Blue blink
      toggleLed(1, 4, 1000);
      console.log('[wifiManager] Reset called');

      var tryAgain = function() {
        if (!wifi.isConnected()) {
          console.log('[wifiManager] Wifi not connected, trying...');
          wifiManager.connect();
        }
      };

      setTimeout(tryAgain, 20 * 1000);
    });
  }
};

console.log("[wifiManager] Exporting...");
module.exports = wifiManager;
