var Thermostat = require('../services/thermostat');
var expect = require('chai').expect;
var Promise = require('bluebird');

describe('Thermostat', () => {
  describe('#trigger', () => {
    var threshold = 80;
    var fakeSwitch = {
      flipOn: () => Promise.resolve(true),
      flipOff: () => Promise.resolve(false)
    }
    var subject = new Thermostat(threshold, fakeSwitch);

    it('when above threshold makes an HTTP request', (done) => {
      var currentTemperature = 81;
      subject.trigger(currentTemperature)
        .then((result) => {
          expect(result).to.eq(true);
          done()
        });
    });

    it('when below threshold makes an HTTP request', (done) => {
      var currentTemperature = 79;
      subject.trigger(currentTemperature)
        .then((result) => {
          expect(result).to.eq(false);
          done()
        });
    });
  });
});
