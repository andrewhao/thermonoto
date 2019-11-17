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
        expect(
          fakeRequest.post.calledWith(expectedUrl, {
            body: `temperature,host=raspberrypi temp=90`,
            headers: expectedAuthorizationHeader
          })
        ).to.eql(true);
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
        expect(
          fakeRequest.post.calledWith(expectedUrl, {
            body: `temperature,host=raspberrypi,region=us-west temp=90`,
            headers: expectedAuthorizationHeader
          })
        ).to.eql(true);
        done();
      });
    });

    it("writes metrics for multiple fields", function(done) {
      writeMetric(
        "temperature",
        { temp: 90.0, location: "upstairs" },
        { host: "raspberrypi", region: "us-west" },
        INFLUXDB_ORG_ID,
        INFLUXDB_BUCKET_ID,
        INFLUXDB_SERVER_URL,
        INFLUXDB_TOKEN,
        fakeRequest
      ).then(() => {
        expect(
          fakeRequest.post.calledWith(expectedUrl, {
            body: `temperature,host=raspberrypi,region=us-west temp=90,location=upstairs`,
            headers: expectedAuthorizationHeader
          })
        ).to.eql(true);

        done();
      });
    });
  });
});
