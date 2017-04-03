var request = require('request-promise');

// Turns on fan if too hot, turns off if too cold.
function Thermostat(threshold, requestLib) {
  this.request = requestLib || request;
  this.threshold = threshold;
}

Thermostat.prototype.trigger = function(temp) {
  var tooHotUrl = 'https://maker.ifttt.com/trigger/too_hot/with/key/cYteZfZjX6aUMIR4dKoCFH'
  var tooColdUrl = 'https://maker.ifttt.com/trigger/too_cold/with/key/cYteZfZjX6aUMIR4dKoCFH'
  if (temp > this.threshold) {
    console.log('OVER threshold. Turning on the fan...');
    return this.request(tooHotUrl).then(() => true);
  } else {
    console.log('UNDER threshold. Turning off the fan...');
    return this.request(tooColdUrl).then(() => false);
  }
};

module.exports = Thermostat;
