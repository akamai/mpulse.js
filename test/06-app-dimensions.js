/*eslint-env mocha*/
"use strict";

describe("mPulse app - Dimensions", function() {
    var root = typeof window !== "undefined" ? window : {};
    var assert = (root.chai ? root.chai : require("chai")).assert;
    var mPulse = root.mPulse ? root.mPulse : require("../src/mpulse");

    /*eslint-disable camelcase*/
    var CONFIG_JSON_STRING = JSON.stringify({
        beacon_url: "http://127.0.0.1/beacon",
        PageParams: {
            customTimers: [
                {
                    name: "timer",
                    label: "timer"
                }
            ],
            customDimensions: [{
                "name": "dim1",
                "index": 0,
                "type": "JavaScriptVar",
                "label": "cdim.dim1",
                "dataType": "Boolean",
                "varName": "dim1"
            }]
        }
    });
    /*eslint-enable camelcase*/

    var app = null;
    beforeEach(function() {
        app = mPulse.init("app_dim", {configUrl: ""});

        app.parseConfig(CONFIG_JSON_STRING);
    });

    afterEach(function() {
        mPulse.stop("app_dim");
        app = null;
    });

    describe("setDimension()", function() {
        it("Should not set a dimension if not called", function(done) {
            app.subscribe("beacon", function(data) {
                assert.isUndefined(data["cdim.dim1"]);
                done();
            });

            app.sendTimer("timer", 100);
        });

        it("Should not set a dimension for non-string names (number)", function(done) {
            app.subscribe("beacon", function(data) {
                assert.isUndefined(data["h.pg"]);
                done();
            });

            app.setDimension(1, "dimension");
            app.sendTimer("timer", 100);
        });

        it("Should not set a dimension for non-string names (boolean)", function(done) {
            app.subscribe("beacon", function(data) {
                assert.isUndefined(data["h.pg"]);
                done();
            });

            app.setDimension(true, "dimension");
            app.sendTimer("timer", 100);
        });

        it("Should not set a dimension for non-string names (null)", function(done) {
            app.subscribe("beacon", function(data) {
                assert.isUndefined(data["h.pg"]);
                done();
            });

            app.setDimension(null, "dimension");
            app.sendTimer("timer", 100);
        });

        it("Should not set a dimension for non-string names (undefined)", function(done) {
            app.subscribe("beacon", function(data) {
                assert.isUndefined(data["h.pg"]);
                done();
            });

            app.setDimension(undefined, "dimension");
            app.sendTimer("timer", 100);
        });

        it("Should set the dimension if called", function(done) {
            app.subscribe("beacon", function(data) {
                assert.equal(data["cdim.dim1"], "dimension");
                done();
            });

            app.setDimension("dim1", "dimension");
            app.sendTimer("timer", 100);
        });

        it("Should set the dimension for all following beacons if called", function(done) {
            var beaconsFired = 0;
            app.subscribe("beacon", function(data) {
                beaconsFired++;

                assert.equal(data["cdim.dim1"], "dimension");

                if (beaconsFired === 2) {
                    done();
                }
            });

            app.setDimension("dim1", "dimension");
            app.sendTimer("timer", 100);
            app.sendTimer("timer", 100);
        });

        it("Should remove the dimension if called with an empty value", function(done) {
            app.subscribe("beacon", function(data) {
                assert.isUndefined(data["h.pg"]);
                done();
            });

            app.setDimension("dim1", "dimension");
            app.setDimension("dim1");
            app.sendTimer("timer", 100);
        });
    });

    describe("resetDimension()", function() {
        it("Should remove the dimension after being called", function(done) {
            app.subscribe("beacon", function(data) {
                assert.isUndefined(data["h.pg"]);
                done();
            });

            app.setDimension("dim1", "dimension");
            app.resetDimension("dim1");
            app.sendTimer("timer", 100);
        });
    });
});
