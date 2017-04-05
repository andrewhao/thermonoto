var expect = require('chai').expect;
var sinon = require('sinon');
var Switch = require('../services/switch');

describe('Switch', () => {
  describe('#flipOn', () => {
    var requestLib = sinon.stub().returns(Promise.resolve());
    var subject = new Switch(requestLib);
    it('makes an HTTP request', (done) => {
      subject.flipOn()
        .then((result) => {
          expect(requestLib.calledWith(
            'https://maker.ifttt.com/trigger/too_hot/with/key/cYteZfZjX6aUMIR4dKoCFH'
          )).to.eq(true)
          expect(result).to.eq(true);
          done()
        });
    });

    describe('when switch is disabled', () => {
      it('does not fire a request', (done) => {
        var requestLib = sinon.stub().returns(Promise.resolve());
        var subject = new Switch(requestLib, false);
        subject.flipOn()
        .then((result) => {
          expect(requestLib.calledWith(
            'https://maker.ifttt.com/trigger/too_hot/with/key/cYteZfZjX6aUMIR4dKoCFH'
          )).to.eq(false)
          expect(result).to.eq(false);
          done()
        });
      });
    });
  });

  describe('#flipOff', () => {
    it('makes an HTTP request', (done) => {
      var requestLib = sinon.stub().returns(Promise.resolve());
      var subject = new Switch(requestLib);
      subject.flipOff()
        .then((result) => {
          expect(requestLib.calledWith(
            'https://maker.ifttt.com/trigger/too_cold/with/key/cYteZfZjX6aUMIR4dKoCFH'
          )).to.eq(true)
          expect(result).to.eq(false);
          done()
        });
    });

    describe('when switch is disabled', () => {
      it('does not fire a request', (done) => {
        var requestLib = sinon.stub().returns(Promise.resolve());
        var subject = new Switch(requestLib, false);
        subject.flipOff()
        .then((result) => {
          expect(requestLib.calledWith(
            'https://maker.ifttt.com/trigger/too_cold/with/key/cYteZfZjX6aUMIR4dKoCFH'
          )).to.eq(false)
          expect(result).to.eq(false);
          done()
        });
      });
    });
  });
});
