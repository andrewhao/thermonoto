var wifi = require('wifi-cc3000');
var config = require("./config.json");
var toggleLed = require('./toggleLed');

var wifiManager = {
  connect: function connect(next) {
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

      var tryAgain = function() {
        if (!wifi.isConnected()) {
          wifiManager.connect();
        }
      };

      setTimeout(tryAgain, 20 * 1000);
    });
  }
};

module.exports = wifiManager;
