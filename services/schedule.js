var moment = require('moment-timezone');
moment.tz.setDefault('America/Los_Angeles');

function Schedule(startTime, endTime) {
  this.startTime = new Date('2016-01-01 ' + startTime);
  this.endTime = new Date('2016-01-01 ' + endTime);
}

Schedule.prototype.isOn = function(currentTime) {
  if(currentTime === undefined) {
    this.currentTime = moment();
  } else {
    this.currentTime = currentTime;
  }
  var hours = this.currentTime.hours();

  var startHours = this.startTime.getHours();
  var endHours = this.endTime.getHours();

  if(endHours < startHours) {
    endHours += 24
  }

  return hours >= startHours && hours <= endHours;
}

module.exports = Schedule;
