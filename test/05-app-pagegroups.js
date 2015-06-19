/*eslint-env mocha*/
"use strict";

describe("mPulse app - page groups", function() {
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

    describe("setPageGroup()", function() {
        it("Should not set a page group if not called", function(done) {
            app.subscribe("beacon", function(data) {
                assert.isUndefined(data["h.pg"]);
                done();
            });

            app.sendTimer("timer", 100);
        });

        it("Should not set a page group for non-string names (number)", function(done) {
            app.subscribe("beacon", function(data) {
                assert.isUndefined(data["h.pg"]);
                done();
            });

            app.setPageGroup(1);
            app.sendTimer("timer", 100);
        });

        it("Should not set a page group for non-string names (boolean)", function(done) {
            app.subscribe("beacon", function(data) {
                assert.isUndefined(data["h.pg"]);
                done();
            });

            app.setPageGroup(true);
            app.sendTimer("timer", 100);
        });

        it("Should not set a page group for non-string names (null)", function(done) {
            app.subscribe("beacon", function(data) {
                assert.isUndefined(data["h.pg"]);
                done();
            });

            app.setPageGroup(null);
            app.sendTimer("timer", 100);
        });

        it("Should not set a page group for non-string names (undefined)", function(done) {
            app.subscribe("beacon", function(data) {
                assert.isUndefined(data["h.pg"]);
                done();
            });

            app.setPageGroup();
            app.sendTimer("timer", 100);
        });

        it("Should set the page group for the next beacon if called", function(done) {
            app.subscribe("beacon", function(data) {
                assert.equal(data["h.pg"], "group");
                done();
            });

            app.setPageGroup("group");
            app.sendTimer("timer", 100);
        });

        it("Should set the page group for all following beacons if called", function(done) {
            var beaconsFired = 0;
            app.subscribe("beacon", function(data) {
                beaconsFired++;

                assert.equal(data["h.pg"], "group");

                if (beaconsFired === 2) {
                    done();
                }
            });

            app.setPageGroup("group");
            app.sendTimer("timer", 100);
            app.sendTimer("timer", 100);
        });
    });

    describe("getPageGroup()", function() {
        it("Should return false if no page group is called", function() {
            assert.equal(app.getPageGroup(), false);
        });

        it("Should return false for non-string names (number)", function() {
            app.setPageGroup(1);
            assert.equal(app.getPageGroup(), false);
        });

        it("Should return false for non-string names (boolean)", function() {
            app.setPageGroup(true);
            assert.equal(app.getPageGroup(), false);
        });

        it("Should return false for non-string names (null)", function() {
            app.setPageGroup(null);
            assert.equal(app.getPageGroup(), false);
        });

        it("Should return false for non-string names (undefined)", function() {
            app.setPageGroup();
            assert.equal(app.getPageGroup(), false);
        });

        it("Should return the group if called with a string", function() {
            app.setPageGroup("group");
            assert.equal(app.getPageGroup(), "group");
        });
    });

    describe("resetPageGroup()", function() {
        it("Shouldn't cause any problems if called without calling setPageGroup() first", function(done) {
            app.subscribe("beacon", function(data) {
                assert.isUndefined(data["h.pg"]);
                assert.equal(data["t_other"], "timer|100");
                done();
            });

            app.resetPageGroup();
            app.sendTimer("timer", 100);
        });

        it("Should remove the page group after being called", function(done) {
            app.subscribe("beacon", function(data) {
                assert.isUndefined(data["h.pg"]);
                done();
            });

            app.setPageGroup("group");
            app.resetPageGroup();
            app.sendTimer("timer", 100);
        });
    });
});
