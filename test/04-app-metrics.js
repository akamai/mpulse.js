/*eslint-env mocha*/
"use strict";

describe("mPulse app - Metrics", function() {
    var root = typeof window !== "undefined" ? window : {};
    var assert = (root.chai ? root.chai : require("chai")).assert;
    var mPulse = root.mPulse ? root.mPulse : require("../src/mpulse");

    /*eslint-disable camelcase*/
    var CONFIG_JSON_STRING = JSON.stringify({
        beacon_url: "http://127.0.0.1/beacon",
        PageParams: {
            customMetrics: [
                {
                    name: "metric",
                    label: "cmet_metric"
                }
            ]
        }
    });
    /*eslint-enable camelcase*/

    var app = null;
    beforeEach(function() {
        app = mPulse.init("app_metrics", {configUrl: ""});

        app.parseConfig(CONFIG_JSON_STRING);
    });

    afterEach(function() {
        mPulse.stop("app_metrics");
        app = null;
    });

    describe("sendMetric()", function() {
        it("Should not send a beacon if the metric name is missing", function(done) {
            app.subscribe("beacon", function() {
                assert.fail("Should not have fired a beacon");
            });

            app.sendMetric();

            setTimeout(function() {
                // give it 100ms to fire a beacon (and fail)
                done();
            }, 100);
        });

        it("Should not send a beacon if the metric name is not a string", function(done) {
            app.subscribe("beacon", function() {
                assert.fail("Should not have fired a beacon");
            });

            app.sendMetric(-1);
            app.sendMetric(false);
            app.sendMetric(undefined);
            app.sendMetric(null);

            setTimeout(function() {
                // give it 100ms to fire a beacon (and fail)
                done();
            }, 100);
        });

        it("Should send a beacon with a value of 1 if the value is not specified", function(done) {
            app.subscribe("beacon", function(data) {
                assert.equal(data.cmet_metric, 1);
                done();
            });

            app.sendMetric("metric");
        });

        it("Should send a beacon with a value specified (number = 100) ", function(done) {
            app.subscribe("beacon", function(data) {
                assert.equal(data.cmet_metric, 100);
                done();
            });

            app.sendMetric("metric", 100);
        });

        it("Should send a beacon with a value specified (number = 0) ", function(done) {
            app.subscribe("beacon", function(data) {
                assert.equal(data.cmet_metric, 0);
                done();
            });

            app.sendMetric("metric", 0);
        });

        it("Should not send a beacon if the value was a string", function(done) {
            app.subscribe("beacon", function() {
                assert.fail("Should not have fired a beacon");
            });

            app.sendMetric("metric", "bad");

            setTimeout(function() {
                // give it 100ms to fire a beacon (and fail)
                done();
            }, 100);
        });

        it("Should send a beacon twice for the same metric", function(done) {
            var beaconCount = 0;
            app.subscribe("beacon", function(data) {
                ++beaconCount;
                assert.equal(data.cmet_metric, beaconCount);

                if (beaconCount === 2) {
                    done();
                }
            });

            app.sendMetric("metric", 1);
            app.sendMetric("metric", 2);
        });
    });
});
