var chai = require('chai');
var sinon = require('sinon');
var Promise = require('bluebird');
var expect = chai.expect;
var { writeMetric } = require('../services/influx');

const INFLUXDB_BUCKET_ID = "test";
const INFLUXDB_ORG_ID = "orgtest";

describe('influx', function() {
  describe('.writeMetric', function() {
    it("writes a line", function(done) {
      const createSpy = sinon.stub().returns(Promise.resolve())
      const fakeInflux = {
        write: {
          create: createSpy
        }
      };

      writeMetric("temperature", { temp: 90.0 }, { host: "raspberrypi" },
        INFLUXDB_ORG_ID, INFLUXDB_BUCKET_ID, fakeInflux).then(() => {
        expect(createSpy.calledWith(
          INFLUXDB_ORG_ID,
          INFLUXDB_BUCKET_ID,
          `temperature,host=raspberrypi temp=90`
        )).to.eql(true);
        done();
      });
    });

    it("writes metrics for multiple tags", function(done) {
      const createSpy = sinon.stub().returns(Promise.resolve())
      const fakeInflux = {
        write: {
          create: createSpy
        }
      };

      writeMetric("temperature", { temp: 90.0 }, { host: "raspberrypi", region: 'us-west' },
         INFLUXDB_ORG_ID, INFLUXDB_BUCKET_ID, fakeInflux).then(() => {
        expect(createSpy.calledWith(
          INFLUXDB_ORG_ID,
          INFLUXDB_BUCKET_ID,
          `temperature,host=raspberrypi,region=us-west temp=90`
        )).to.eql(true);
        done();
      });
    });

    it("writes metrics for multiple fields", function(done) {
      const createSpy = sinon.stub().returns(Promise.resolve())
      const fakeInflux = {
        write: {
          create: createSpy
        }
      };

      writeMetric("temperature", { temp: 90.0, location: 'upstairs' }, { host: "raspberrypi", region: 'us-west' },
        INFLUXDB_ORG_ID, INFLUXDB_BUCKET_ID, fakeInflux).then(() => {
        expect(createSpy.calledWith(
          INFLUXDB_ORG_ID,
          INFLUXDB_BUCKET_ID,
          `temperature,host=raspberrypi,region=us-west temp=90,location=upstairs`
        )).to.eql(true);
        done();
      });
    });
  });
});
