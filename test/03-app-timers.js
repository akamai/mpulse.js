/*eslint-env mocha*/
"use strict";

describe("mPulse app - Timers", function() {
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
        app = mPulse.init("app_timers", "secret-key", {configUrl: ""});

        app.parseConfig(CONFIG_JSON_STRING);
    });

    afterEach(function() {
        mPulse.stop("app_timers");
        app = null;
    });

    describe("startTimer()", function() {
        it("Should return a timer ID if called correctly", function() {
            assert.isNumber(app.startTimer("timer"));
        });

        it("Should return -1 if name is missing", function() {
            assert.equal(app.startTimer(), -1);
        });

        it("Should return -1 if name is not a string", function() {
            assert.equal(app.startTimer(1), -1);
            assert.equal(app.startTimer(null), -1);
            assert.equal(app.startTimer(undefined), -1);
            assert.equal(app.startTimer(true), -1);
        });
    });

    describe("stopTimer()", function() {
        it("Should return 0 if you don't specify a timer ID", function() {
            assert.equal(app.stopTimer(), -1);
        });

        it("Should return 0 if id is not a number", function() {
            assert.equal(app.stopTimer("a"), -1);
            assert.equal(app.stopTimer(null), -1);
            assert.equal(app.stopTimer(undefined), -1);
            assert.equal(app.stopTimer(true), -1);
        });

        it("Should return 0 if you specify a wrong timer ID", function() {
            assert.equal(app.stopTimer(-1), -1);
        });

        it("Should return the number of milliseconds changed if you specify a correct timer ID", function(done) {
            var timerId = app.startTimer("timer");
            setTimeout(function() {
                var deltaMs = app.stopTimer(timerId);
                assert.closeTo(deltaMs, 100, 50);
                done();
            }, 100);
        });

        it("Should send a beacon if the timer is defined", function(done) {
            var deltaMs = -1;

            app.subscribe("beacon", function(data) {
                assert.equal(data["t_other"], "timer|" + deltaMs);
                done();
            });

            var timerId = app.startTimer("timer");
            deltaMs = app.stopTimer(timerId);
            assert.closeTo(deltaMs, 0, 100);
        });

        it("Should set rt.tstart on the beacon", function(done) {
            var now = +(new Date());

            app.subscribe("beacon", function(data) {
                assert.operator(data["rt.tstart"], ">=", now);

                // give the beacon 5 seconds to send
                assert.operator(data["rt.tstart"], "<=", now + 5000);
                done();
            });

            app.sendTimer("timer", 10);
        });

        it("Should set rt.end on the beacon", function(done) {
            var now = +(new Date());

            app.subscribe("beacon", function(data) {
                assert.operator(data["rt.end"], ">=", now);

                // give the beacon 5 seconds to send
                assert.operator(data["rt.end"], "<=", now + 5000);
                done();
            });

            app.sendTimer("timer", 10);
        });

        it("Should set rt.end=rt.tstart on the beacon", function(done) {
            app.subscribe("beacon", function(data) {
                assert.equal(data["rt.end"], data["rt.tstart"]);
                done();
            });

            app.sendTimer("timer", 10);
        });

        it("Should not send a beacon if the timer is not defined", function(done) {
            app.subscribe("beacon", function() {
                assert.fail("Should not have fired a beacon");
            });

            var timerId = app.startTimer("timer_bad");
            var deltaMs = app.stopTimer(timerId);
            assert.closeTo(deltaMs, 0, 100);

            setTimeout(function() {
                // give it 100ms to fire a beacon (which would cause a fail)
                done();
            }, 100);
        });

        it("Should only send a beacon for a timer once", function(done) {
            var deltaMs = -1;

            var beaconsFired = 0;
            app.subscribe("beacon", function(data) {
                beaconsFired++;
                assert.equal(beaconsFired, 1);
                assert.equal(data["t_other"], "timer|" + deltaMs);
                done();
            });

            var timerId = app.startTimer("timer");
            deltaMs = app.stopTimer(timerId);
            assert.closeTo(deltaMs, 0, 100);

            // second call shouldn't work
            assert.equal(app.stopTimer(timerId), -1);
        });
    });

    describe("sendTimer()", function() {
        it("Should return 0 if name is missing", function() {
            assert.equal(app.sendTimer(), -1);
        });

        it("Should return 0 if name is not a string", function() {
            assert.equal(app.sendTimer(1), -1);
            assert.equal(app.sendTimer(null), -1);
            assert.equal(app.sendTimer(undefined), -1);
            assert.equal(app.sendTimer(true), -1);
        });

        it("Should return 0 if value is not a number", function() {
            assert.equal(app.sendTimer("timer", "a"), -1);
            assert.equal(app.sendTimer("timer", null), -1);
            assert.equal(app.sendTimer("timer", undefined), -1);
            assert.equal(app.sendTimer("timer", true), -1);
        });

        it("Should return 0 if value less than 0", function() {
            assert.equal(app.sendTimer("timer", -1), -1);
            assert.equal(app.sendTimer("timer", -10), -1);
        });

        it("Should return the value given for good inputs", function() {
            assert.equal(app.sendTimer("timer", 1), 1);
            assert.equal(app.sendTimer("timer", 10), 10);
        });

        it("Should round the input value", function() {
            assert.equal(app.sendTimer("timer", 1.1), 1);
            assert.equal(app.sendTimer("timer", 10.5), 11);
        });

        it("Should send a beacon", function(done) {
            app.subscribe("beacon", function(data) {
                assert.equal(data["t_other"], "timer|100");
                done();
            });

            assert.equal(app.sendTimer("timer", 100), 100);
        });

        it("Should send a beacon twice for the same timer", function(done) {
            var beaconCount = 0;
            app.subscribe("beacon", function(data) {
                ++beaconCount;
                assert.equal(data["t_other"], "timer|" + (beaconCount * 100));

                if (beaconCount === 2) {
                    done();
                }
            });

            assert.equal(app.sendTimer("timer", 100), 100);
            assert.equal(app.sendTimer("timer", 200), 200);
        });
    });
});
