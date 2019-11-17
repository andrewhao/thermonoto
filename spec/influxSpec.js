var chai = require("chai");
var sinon = require("sinon");
var Promise = require("bluebird");
var expect = chai.expect;
var { writeMetric } = require("../services/influx");

const INFLUXDB_BUCKET_ID = "test";
const INFLUXDB_ORG_ID = "orgtest";
const INFLUXDB_SERVER_URL = "https://www.testurl.com";
const INFLUXDB_TOKEN = "token";

const expectedUrl = `${INFLUXDB_SERVER_URL}/api/v2/write?org=${INFLUXDB_ORG_ID}&bucket=${INFLUXDB_BUCKET_ID}&precision=s`;
const expectedAuthorizationHeader = {
  Authorization: `Token ${INFLUXDB_TOKEN}`
};

describe("influx", function() {
  describe(".writeMetric", function() {
    let fakeRequest;

    beforeEach(() => {
      fakeRequest = { post: sinon.stub().returns(Promise.resolve()) };
    });

    it("writes a line", function(done) {
      writeMetric(
        "temperature",
        { temp: 90.0 },
        { host: "raspberrypi" },
        INFLUXDB_ORG_ID,
        INFLUXDB_BUCKET_ID,
        INFLUXDB_SERVER_URL,
        INFLUXDB_TOKEN,
        fakeRequest
      ).then(() => {
        sinon.assert.calledWith(fakeRequest.post, expectedUrl, {
          body: `temperature,host=raspberrypi temp=90`,
          headers: expectedAuthorizationHeader
        });

        done();
      });
    });

    it("writes metrics for multiple tags", function(done) {
      writeMetric(
        "temperature",
        { temp: 90.0 },
        { host: "raspberrypi", region: "us-west" },
        INFLUXDB_ORG_ID,
        INFLUXDB_BUCKET_ID,
        INFLUXDB_SERVER_URL,
        INFLUXDB_TOKEN,
        fakeRequest
      ).then(() => {
        sinon.assert.calledWith(fakeRequest.post, expectedUrl, {
          body: `temperature,host=raspberrypi,region=us-west temp=90`,
          headers: expectedAuthorizationHeader
        });

        done();
      });
    });

    describe("data type casting", () => {
      it("wraps string field values in double quotes", done => {
        writeMetric(
          "temperature",
          { temp: 90, location: "upstairs" },
          {},
          INFLUXDB_ORG_ID,
          INFLUXDB_BUCKET_ID,
          INFLUXDB_SERVER_URL,
          INFLUXDB_TOKEN,
          fakeRequest
        ).then(() => {
          sinon.assert.calledWith(fakeRequest.post, expectedUrl, {
            body: `temperature location="upstairs",temp=90`,
            headers: expectedAuthorizationHeader
          });

          done();
        });
      });

      it("forces an is_* boolean field value to use true/false values", done => {
        writeMetric(
          "temperature",
          { is_crying: 0, is_sleeping: 1 },
          {},
          INFLUXDB_ORG_ID,
          INFLUXDB_BUCKET_ID,
          INFLUXDB_SERVER_URL,
          INFLUXDB_TOKEN,
          fakeRequest
        ).then(() => {
          sinon.assert.calledWith(fakeRequest.post, expectedUrl, {
            body: `temperature is_crying=false,is_sleeping=true`,
            headers: expectedAuthorizationHeader
          });

          done();
        });
      });
    });

    it("writes metrics for multiple fields, sorting on keys and tags", function(done) {
      writeMetric(
        "temperature",
        { temp: 90.0, humidity: 70.2 },
        { region: "us-west", host: "raspberrypi" },
        INFLUXDB_ORG_ID,
        INFLUXDB_BUCKET_ID,
        INFLUXDB_SERVER_URL,
        INFLUXDB_TOKEN,
        fakeRequest
      ).then(() => {
        sinon.assert.calledWith(fakeRequest.post, expectedUrl, {
          body: `temperature,host=raspberrypi,region=us-west humidity=70.2,temp=90`,
          headers: expectedAuthorizationHeader
        });

        done();
      });
    });
  });
});
