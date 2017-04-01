var chai = require('chai')
var expect = chai.expect;
chai.use(require('chai-datetime'));
var Schedule = require('../services/schedule');

describe('Schedule', function() {
  describe('#isOn', function() {
    describe('for wrapping start/end around midnight', function() {
      var startTime = '11:00';
      var endTime = '6:00';

      describe('when current time is outside an operating range', function() {
        it("returns false", function() {
          var currentTime = new Date('2017-01-01 05:00');
          var subject = new Schedule(startTime, endTime);
          expect(subject.isOn(currentTime)).to.eq(false)
        });
      });

      describe('when current time is inside operating range', function() {
        it('returns true', function() {
          var currentTime = new Date('2017-01-01 13:00');
          var subject = new Schedule(startTime, endTime);
          expect(subject.isOn(currentTime)).to.eq(true)
        });
      });
    });

    describe('for nonwrapping start/end around midnight', function() {
      var startTime = '6:00';
      var endTime = '8:00';

      describe('when current time is outside an operating range', function() {
        it("returns false", function() {
          var currentTime = new Date('2017-01-01 05:00');
          var subject = new Schedule(startTime, endTime);
          expect(subject.isOn(currentTime)).to.eq(false)
        });
      });

      describe('when current time is inside operating range', function() {
        it('returns true', function() {
          var currentTime = new Date('2017-01-01 7:00');
          var subject = new Schedule(startTime, endTime);
          expect(subject.isOn(currentTime)).to.eq(true)
        });
      });
    });
  });
});
