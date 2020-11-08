/* the wifi-cc3000 library is bundled in with Tessel's firmware,
 * so there's no need for an npm install. It's similar
 * to how require('tessel') works.
 */ 
var wifi = require('wifi-cc3000');
var network = '#####'; // put in your network name here
var pass = '#####'; // put in your password here, or leave blank for unsecured
var security = 'wpa2'; // other options are 'wep', 'wpa', or 'unsecured'
var timeouts = 0;

wifi.on('connect', function(data){});

wifi.on('disconnect', function(data){})

wifi.on('timeout', function(err){
  timeouts++;
  if (timeouts > 2) {
    // reset the wifi chip if we've timed out too many times
    powerCycle();
  } else {
    // try to reconnect
    connect();
  }
});

wifi.on('error', function(err){});

// reset the wifi chip progammatically
function powerCycle(){
  // when the wifi chip resets, it will automatically try to reconnect
  // to the last saved network
  wifi.reset(function(){
    timeouts = 0; // reset timeouts
    // give it some time to auto reconnect
    setTimeout(function(){
      if (!wifi.isConnected()) {
        // try to reconnect
        connect();
      }
      }, 20 *1000); // 20 second wait
  })
}

function connect(){
  wifi.connect({
  security: security
  , ssid: network
  , password: pass
  , timeout: 30 // in seconds
  });
}

// connect wifi now, if not already connected
if (!wifi.isConnected()) {
  connect();
}

