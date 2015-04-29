/*eslint-env mocha*/
"use strict";

describe("mPulse app - View Groups", function() {
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

    describe("setViewGroup()", function() {
        it("Should not set a view group if not called", function(done) {
            app.subscribe("beacon", function(data) {
                assert.isUndefined(data["h.pg"]);
                done();
            });

            app.sendTimer("timer", 100);
        });

        it("Should not set a view group for non-string names (number)", function(done) {
            app.subscribe("beacon", function(data) {
                assert.isUndefined(data["h.pg"]);
                done();
            });

            app.setViewGroup(1);
            app.sendTimer("timer", 100);
        });

        it("Should not set a view group for non-string names (boolean)", function(done) {
            app.subscribe("beacon", function(data) {
                assert.isUndefined(data["h.pg"]);
                done();
            });

            app.setViewGroup(true);
            app.sendTimer("timer", 100);
        });

        it("Should not set a view group for non-string names (null)", function(done) {
            app.subscribe("beacon", function(data) {
                assert.isUndefined(data["h.pg"]);
                done();
            });

            app.setViewGroup(null);
            app.sendTimer("timer", 100);
        });

        it("Should not set a view group for non-string names (undefined)", function(done) {
            app.subscribe("beacon", function(data) {
                assert.isUndefined(data["h.pg"]);
                done();
            });

            app.setViewGroup();
            app.sendTimer("timer", 100);
        });

        it("Should set the view group for the next beacon if called", function(done) {
            app.subscribe("beacon", function(data) {
                assert.equal(data["h.pg"], "group");
                done();
            });

            app.setViewGroup("group");
            app.sendTimer("timer", 100);
        });

        it("Should set the view group for all following beacons if called", function(done) {
            var beaconsFired = 0;
            app.subscribe("beacon", function(data) {
                beaconsFired++;

                assert.equal(data["h.pg"], "group");

                if (beaconsFired === 2) {
                    done();
                }
            });

            app.setViewGroup("group");
            app.sendTimer("timer", 100);
            app.sendTimer("timer", 100);
        });
    });

    describe("resetViewGroup()", function() {
        it("Shouldn't cause any problems if called without calling setViewGroup() first", function(done) {
            app.subscribe("beacon", function(data) {
                assert.isUndefined(data["h.pg"]);
                assert.equal(data["t_other"], "timer|100");
                done();
            });

            app.resetViewGroup();
            app.sendTimer("timer", 100);
        });

        it("Should remove the view group after being called", function(done) {
            app.subscribe("beacon", function(data) {
                assert.isUndefined(data["h.pg"]);
                done();
            });

            app.setViewGroup("group");
            app.resetViewGroup();
            app.sendTimer("timer", 100);
        });
    });
});
