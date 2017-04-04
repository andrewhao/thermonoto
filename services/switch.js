var request = require('request-promise');

// Turns on fan if too hot, turns off if too cold.
function Switch(requestLib) {
  this.request = requestLib || request;
}

var tooHotUrl = 'https://maker.ifttt.com/trigger/too_hot/with/key/cYteZfZjX6aUMIR4dKoCFH'
var tooColdUrl = 'https://maker.ifttt.com/trigger/too_cold/with/key/cYteZfZjX6aUMIR4dKoCFH'

Switch.prototype.flipOn = function(temp) {
  console.log('[Switch] Turning on.');
  return this.request(tooHotUrl).then(() => true);
};

Switch.prototype.flipOff = function() {
  console.log('[Switch] Turning off.');
  return this.request(tooColdUrl).then(() => false);
};

module.exports = Switch;
