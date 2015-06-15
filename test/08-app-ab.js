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
        app = mPulse.init("app_vg", {configUrl: ""});

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

            app.setAB(1);
            app.sendTimer("timer", 100);
        });

        it("Should not set a A/B bucket for non-string names (boolean)", function(done) {
            app.subscribe("beacon", function(data) {
                assert.isUndefined(data["h.ab"]);
                done();
            });

            app.setAB(true);
            app.sendTimer("timer", 100);
        });

        it("Should not set a A/B bucket for non-string names (null)", function(done) {
            app.subscribe("beacon", function(data) {
                assert.isUndefined(data["h.ab"]);
                done();
            });

            app.setAB(null);
            app.sendTimer("timer", 100);
        });

        it("Should not set a A/B bucket for non-string names (undefined)", function(done) {
            app.subscribe("beacon", function(data) {
                assert.isUndefined(data["h.ab"]);
                done();
            });

            app.setAB();
            app.sendTimer("timer", 100);
        });

        it("Should set the A/B bucket for the next beacon if called", function(done) {
            app.subscribe("beacon", function(data) {
                assert.equal(data["h.ab"], "bucket");
                done();
            });

            app.setAB("bucket");
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

            app.setAB("bucket");
            app.sendTimer("timer", 100);
            app.sendTimer("timer", 100);
        });

        it("Should not set a A/B bucket if it contains invalid characters", function() {
            var chars = ["!", "`", "!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "+", "=",
                         "<", ",", ">", ".", "/", "?", "{", "}", "[", "]", "|", "\\", ":", ";",
                         "\"", "'"];

            for (var i = 0; i < chars.length; i++) {
                assert.equal(app.setAB("a" + chars[i] + "b"), false);
            }
        });

        it("Should not set a A/B bucket if it's an empty string", function() {
            assert.equal(app.setAB(""), false);
        });

        it("Should not set a A/B bucket if it's over 25 characters", function() {
            assert.equal(app.setAB("12345678901234567890123456"), false);
        });

        it("Should set a A/B bucket if it contains valid characters", function() {
            assert.equal(app.setAB("ab"), true);
            assert.equal(app.setAB("a_b"), true);
            assert.equal(app.setAB("a-b"), true);
            assert.equal(app.setAB("a b"), true);
            assert.equal(app.setAB("a1b"), true);
            assert.equal(app.setAB("aAb"), true);
        });
    });

    describe("getAB()", function() {
        it("Should return false if no A/B bucket is called", function() {
            assert.equal(app.getAB(), false);
        });

        it("Should return false for non-string names (number)", function() {
            app.setAB(1);
            assert.equal(app.getAB(), false);
        });

        it("Should return false for non-string names (boolean)", function() {
            app.setAB(true);
            assert.equal(app.getAB(), false);
        });

        it("Should return false for non-string names (null)", function() {
            app.setAB(null);
            assert.equal(app.getAB(), false);
        });

        it("Should return false for non-string names (undefined)", function() {
            app.setAB();
            assert.equal(app.getAB(), false);
        });

        it("Should return the bucket if called with a string", function() {
            app.setAB("bucket");
            assert.equal(app.getAB(), "bucket");
        });
    });

    describe("resetAB()", function() {
        it("Shouldn't cause any problems if called without calling setAB() first", function(done) {
            app.subscribe("beacon", function(data) {
                assert.isUndefined(data["h.ab"]);
                assert.equal(data["t_other"], "timer|100");
                done();
            });

            app.resetAB();
            app.sendTimer("timer", 100);
        });

        it("Should remove the A/B bucket after being called", function(done) {
            app.subscribe("beacon", function(data) {
                assert.isUndefined(data["h.ab"]);
                done();
            });

            app.setAB("bucket");
            app.resetAB();
            app.sendTimer("timer", 100);
        });
    });
});
