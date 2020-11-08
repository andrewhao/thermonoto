var request = require('request-promise');
var Promise = require('bluebird');

// Turns on fan if too hot, turns off if too cold.
function Switch(requestLib=request, isEnabled=true) {
  this.request = requestLib;
  this.isEnabled = isEnabled;
}

var tooHotUrl = 'https://maker.ifttt.com/trigger/too_hot/with/key/cYteZfZjX6aUMIR4dKoCFH'
var tooColdUrl = 'https://maker.ifttt.com/trigger/too_cold/with/key/cYteZfZjX6aUMIR4dKoCFH'

Switch.prototype.flipOn = function(temp) {
  if(!this.isEnabled) {
    console.debug('[Switch] Disabled, exiting.');
    return Promise.resolve(false);
  }
  console.debug('[Switch] Turning on.');
  return this.request(tooHotUrl).then(() => true);
};

Switch.prototype.flipOff = function() {
  if(!this.isEnabled) {
    console.log('[Switch] Disabled, exiting.');
    return Promise.resolve(false)
  }
  console.log('[Switch] Turning off.');
  return this.request(tooColdUrl).then(() => false);
};

module.exports = Switch;
