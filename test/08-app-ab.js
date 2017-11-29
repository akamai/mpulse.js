/*eslint-env mocha*/
"use strict";

describe("mPulse app - A/B buckets", function() {
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
            ]
        }
    });
    /*eslint-enable camelcase*/

    var app = null;
    beforeEach(function() {
        app = mPulse.init("app_vg", "secret-key", {configUrl: ""});

        app.parseConfig(CONFIG_JSON_STRING);
    });

    afterEach(function() {
        mPulse.stop("app_vg");
        app = null;
    });

    describe("setViewAB()", function() {
        it("Should not set a A/B bucket if not called", function(done) {
            app.subscribe("beacon", function(data) {
                assert.isUndefined(data["h.ab"]);
                done();
            });

            app.sendTimer("timer", 100);
        });

        it("Should not set a A/B bucket for non-string names (number)", function(done) {
            app.subscribe("beacon", function(data) {
                assert.isUndefined(data["h.ab"]);
                done();
            });

            app.setABTest(1);
            app.sendTimer("timer", 100);
        });

        it("Should not set a A/B bucket for non-string names (boolean)", function(done) {
            app.subscribe("beacon", function(data) {
                assert.isUndefined(data["h.ab"]);
                done();
            });

            app.setABTest(true);
            app.sendTimer("timer", 100);
        });

        it("Should not set a A/B bucket for non-string names (null)", function(done) {
            app.subscribe("beacon", function(data) {
                assert.isUndefined(data["h.ab"]);
                done();
            });

            app.setABTest(null);
            app.sendTimer("timer", 100);
        });

        it("Should not set a A/B bucket for non-string names (undefined)", function(done) {
            app.subscribe("beacon", function(data) {
                assert.isUndefined(data["h.ab"]);
                done();
            });

            app.setABTest();
            app.sendTimer("timer", 100);
        });

        it("Should set the A/B bucket for the next beacon if called", function(done) {
            app.subscribe("beacon", function(data) {
                assert.equal(data["h.ab"], "bucket");
                done();
            });

            app.setABTest("bucket");
            app.sendTimer("timer", 100);
        });

        it("Should set the A/B bucket for all following beacons if called", function(done) {
            var beaconsFired = 0;
            app.subscribe("beacon", function(data) {
                beaconsFired++;

                assert.equal(data["h.ab"], "bucket");

                if (beaconsFired === 2) {
                    done();
                }
            });

            app.setABTest("bucket");
            app.sendTimer("timer", 100);
            app.sendTimer("timer", 100);
        });

        it("Should not set a A/B bucket if it contains invalid characters", function() {
            var chars = [
                "!", "`", "!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "+", "=",
                "<", ",", ">", ".", "/", "?", "{", "}", "[", "]", "|", "\\", ":", ";",
                "\"", "'"
            ];

            for (var i = 0; i < chars.length; i++) {
                assert.equal(app.setABTest("a" + chars[i] + "b"), false);
            }
        });

        it("Should not set a A/B bucket if it's an empty string", function() {
            assert.equal(app.setABTest(""), false);
        });

        it("Should not set a A/B bucket if it's over 25 characters", function() {
            assert.equal(app.setABTest("12345678901234567890123456"), false);
        });

        it("Should set a A/B bucket if it contains valid characters", function() {
            assert.equal(app.setABTest("ab"), true);
            assert.equal(app.setABTest("a_b"), true);
            assert.equal(app.setABTest("a-b"), true);
            assert.equal(app.setABTest("a b"), true);
            assert.equal(app.setABTest("a1b"), true);
            assert.equal(app.setABTest("aAb"), true);
        });
    });

    describe("getABTest()", function() {
        it("Should return false if no A/B bucket is called", function() {
            assert.equal(app.getABTest(), false);
        });

        it("Should return false for non-string names (number)", function() {
            app.setABTest(1);
            assert.equal(app.getABTest(), false);
        });

        it("Should return false for non-string names (boolean)", function() {
            app.setABTest(true);
            assert.equal(app.getABTest(), false);
        });

        it("Should return false for non-string names (null)", function() {
            app.setABTest(null);
            assert.equal(app.getABTest(), false);
        });

        it("Should return false for non-string names (undefined)", function() {
            app.setABTest();
            assert.equal(app.getABTest(), false);
        });

        it("Should return the bucket if called with a string", function() {
            app.setABTest("bucket");
            assert.equal(app.getABTest(), "bucket");
        });
    });

    describe("resetABTest()", function() {
        it("Shouldn't cause any problems if called without calling setABTest() first", function(done) {
            app.subscribe("beacon", function(data) {
                assert.isUndefined(data["h.ab"]);
                assert.equal(data["t_other"], "timer|100");
                done();
            });

            app.resetABTest();
            app.sendTimer("timer", 100);
        });

        it("Should remove the A/B bucket after being called", function(done) {
            app.subscribe("beacon", function(data) {
                assert.isUndefined(data["h.ab"]);
                done();
            });

            app.setABTest("bucket");
            app.resetABTest();
            app.sendTimer("timer", 100);
        });
    });
});
