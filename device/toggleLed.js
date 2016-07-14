var tessel = require('tessel');

function toggleLed(ledIdx, cycles, interval) {
  if (interval === undefined) { interval = 50 }
  var cycle = 0,
  maxCycles = cycles,
  lights = [ledIdx];

  var ledTimer = setInterval(function () {
    lights.forEach(function(light){
      tessel.led[light].toggle();
    });

    cycle++;
    if (cycle == maxCycles) {
      cycle = 0;
      clearInterval(ledTimer);
    }
  }, interval);
}

module.exports = toggleLed;
