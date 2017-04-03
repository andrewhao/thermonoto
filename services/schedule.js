var moment = require('moment-timezone');

function Schedule(startTime, endTime) {
  this.startTime = new Date('2016-01-01 ' + startTime);
  this.endTime = new Date('2016-01-01 ' + endTime);
}

Schedule.prototype.isOn = function(currentTime) {
  if(currentTime === undefined) {
    this.currentTime = moment().tz('America/Los_Angeles').toDate();
  } else {
    this.currentTime = currentTime;
  }
  console.log('currentTime', currentTime);
  var hours = this.currentTime.getHours();

  var startHours = this.startTime.getHours();
  var endHours = this.endTime.getHours();

  if(endHours < startHours) {
    endHours += 24
  }

  console.log('startHours', startHours, 'endHours', endHours, 'currentHours', hours);

  return hours >= startHours && hours <= endHours;
}

module.exports = Schedule;