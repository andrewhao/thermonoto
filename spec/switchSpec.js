var expect = require('chai').expect;
var sinon = require('sinon');
var Switch = require('../services/switch');

describe('Switch', () => {
  var requestLib = sinon.stub().returns(Promise.resolve());
  var subject = new Switch(requestLib);
  describe('#flipOn', () => {
    var threshold = 80;

    it('when above threshold makes an HTTP request', (done) => {
      var currentTemperature = 81;
      subject.flipOn()
        .then((result) => {
          expect(requestLib.calledWith(
            'https://maker.ifttt.com/trigger/too_hot/with/key/cYteZfZjX6aUMIR4dKoCFH'
          )).to.eq(true)
          expect(result).to.eq(true);
          done()
        });
    });
  });

  describe('#flipOff', () => {
    it('when below threshold makes an HTTP request', (done) => {
      subject.flipOff()
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
