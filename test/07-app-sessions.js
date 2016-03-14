/*eslint-env mocha*/
"use strict";

describe("mPulse app - Sessions", function() {
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
        app = mPulse.init("app_session", "secret-key", {configUrl: ""});

        app.parseConfig(CONFIG_JSON_STRING);
    });

    afterEach(function() {
        mPulse.stop("app_session");
        app = null;
    });

    describe("setSessionID()", function() {
        it("Should set the session ID", function(done) {
            app.subscribe("beacon", function(data) {
                assert.equal(data["rt.si"], "abc");
                done();
            });

            app.setSessionID("abc");
            assert.equal(app.getSessionID(), "abc");
            app.incrementSessionLength();

            app.sendTimer("timer", 100);
        });

        it("Should not set the session ID if not a string/number (boolean)", function(done) {
            app.subscribe("beacon", function(data) {
                assert.equal(data["rt.si"], "abc");
                done();
            });

            app.setSessionID("abc");
            app.setSessionID(false);
            assert.equal(app.getSessionID(), "abc");
            app.incrementSessionLength();

            app.sendTimer("timer", 100);
        });

        it("Should work with numeric session IDs", function(done) {
            app.subscribe("beacon", function(data) {
                assert.equal(data["rt.si"], "100");
                done();
            });

            app.setSessionID(100);
            assert.equal(app.getSessionID(), "100");
            app.incrementSessionLength();

            app.sendTimer("timer", 100);
        });

        it("Should overwrite a previous session ID", function(done) {
            app.subscribe("beacon", function(data) {
                assert.equal(data["rt.si"], "def");
                done();
            });

            app.setSessionID("abc");
            assert.equal(app.getSessionID(), "abc");

            app.setSessionID("def");
            assert.equal(app.getSessionID(), "def");
            app.incrementSessionLength();

            app.sendTimer("timer", 100);
        });
    });

    describe("getSessionID()", function() {
        it("Should return a generic session ID if not specified", function() {
            assert.typeOf(app.getSessionID(), "string");
        });

        it("Should return the specified string after specified", function() {
            var before = app.getSessionID();
            assert.typeOf(before, "string");

            app.setSessionID("abc");
            assert.typeOf(app.getSessionID(), "string");
            assert.notEqual(app.getSessionID(), before);
        });
    });

    describe("startSession()", function() {
        it("Should return a generic session ID if not specified", function() {
            assert.typeOf(app.startSession(), "string");
        });

        it("Should reset the session ID and length", function() {
            app.setSessionID("abc");
            app.incrementSessionLength();
            assert.equal(app.getSessionID(), "abc");
            assert.equal(app.getSessionLength(), 1);

            assert.typeOf(app.startSession(), "string");
            assert.notEqual(app.getSessionID(), "abc");
            assert.equal(app.getSessionLength(), 0);
        });

        it("Should accept an return the specified session ID", function() {
            assert.equal(app.startSession("abc"), "abc");
            assert.equal(app.getSessionID(), "abc");
            assert.equal(app.getSessionLength(), 0);
        });
    });

    describe("incrementSessionLength()", function() {
        it("Should increment the session length", function() {
            assert.equal(app.getSessionLength(), 0);
            app.incrementSessionLength();
            assert.equal(app.getSessionLength(), 1);
            app.incrementSessionLength();
            assert.equal(app.getSessionLength(), 2);
        });
    });

    describe("setSessionLength()", function() {
        it("Should set the session length", function() {
            assert.equal(app.getSessionLength(), 0);
            app.setSessionLength(1);
            assert.equal(app.getSessionLength(), 1);
            app.setSessionLength(100);
            assert.equal(app.getSessionLength(), 100);
            app.setSessionLength(0);
            assert.equal(app.getSessionLength(), 0);
        });

        it("Should not set the session length if not a number", function() {
            assert.equal(app.getSessionLength(), 0);
            app.setSessionLength(100);
            assert.equal(app.getSessionLength(), 100);
            app.setSessionLength("a");
            assert.equal(app.getSessionLength(), 100);
            app.setSessionLength(undefined);
            assert.equal(app.getSessionLength(), 100);
            app.setSessionLength(null);
            assert.equal(app.getSessionLength(), 100);
            app.setSessionLength(false);
            assert.equal(app.getSessionLength(), 100);
        });

        it("Should not set the session length if less than 0", function() {
            assert.equal(app.getSessionLength(), 0);
            app.setSessionLength(100);
            assert.equal(app.getSessionLength(), 100);
            app.setSessionLength(-1);
            assert.equal(app.getSessionLength(), 100);
            app.setSessionLength(-100);
            assert.equal(app.getSessionLength(), 100);
        });
    });

    describe("getSessionLength()", function() {
        it("Should get the session length", function() {
            assert.equal(app.getSessionLength(), 0);
            app.incrementSessionLength();
            assert.equal(app.getSessionLength(), 1);
            app.incrementSessionLength();
            assert.equal(app.getSessionLength(), 2);
        });
    });
});
