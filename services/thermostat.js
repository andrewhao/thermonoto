var request = require('request-promise');
var Switch = require('./switch');

// Turns on fan if too hot, turns off if too cold.
function Thermostat(threshold, switchLib) {
  this.switch = switchLib || new Switch;
  this.threshold = threshold;
}

Thermostat.prototype.trigger = function(temp) {
  var tooHotUrl = 'https://maker.ifttt.com/trigger/too_hot/with/key/cYteZfZjX6aUMIR4dKoCFH'
  var tooColdUrl = 'https://maker.ifttt.com/trigger/too_cold/with/key/cYteZfZjX6aUMIR4dKoCFH'
  if (temp > this.threshold) {
    console.debug('OVER threshold.');
    return this.switch.flipOn();
  } else {
    console.debug('UNDER threshold');
    return this.switch.flipOff();
  }
};

module.exports = Thermostat;
