var Thermostat = require('../services/Thermostat');
var sinon = require('sinon');
var Promise = require('bluebird');
var expect = require('chai').expect;

describe('Thermostat', () => {
  describe('#trigger', () => {
    var threshold = 80;
    var requestLib = sinon.stub().returns(Promise.resolve());
    var subject = new Thermostat(threshold, requestLib);

    it('when above threshold makes an HTTP request', (done) => {
      var currentTemperature = 81;
      subject.trigger(currentTemperature)
        .then((result) => {
          expect(requestLib.calledWith(
            'https://maker.ifttt.com/trigger/too_hot/with/key/cYteZfZjX6aUMIR4dKoCFH'
          )).to.eq(true)
          expect(result).to.eq(true);
          done()
        });
    });

    it('when below threshold makes an HTTP request', (done) => {
      var currentTemperature = 79;
      subject.trigger(currentTemperature)
        .then((result) => {
          expect(requestLib.calledWith(
            'https://maker.ifttt.com/trigger/too_cold/with/key/cYteZfZjX6aUMIR4dKoCFH'
          )).to.eq(true)
          expect(result).to.eq(false);
          done()
        });
    });
  });
});
