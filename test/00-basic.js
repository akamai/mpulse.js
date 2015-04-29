/*eslint-env mocha*/
"use strict";

describe("mPulse exports", function() {
    var root = typeof window !== "undefined" ? window : {};
    var assert = (root.chai ? root.chai : require("chai")).assert;
    var mPulse = root.mPulse ? root.mPulse : require("../src/mpulse");

    var APP_FUNCTIONS = [
        "startTimer",
        "stopTimer",
        "sendTimer",
        "sendMetric",
        "setViewGroup",
        "resetViewGroup",
        "setDimension",
        "resetDimension",
        "setSessionID",
        "getSessionID",
        "startSession",
        "incrementSessionLength",
        "setSessionLength",
        "getSessionLength",
        "subscribe"
    ];

    it("Should have exported mPulse", function() {
        assert.isObject(mPulse);
    });

    it("Should have an init() function", function() {
        assert.isFunction(mPulse.init);
    });

    it("Should have an noConflict() function", function() {
        assert.isFunction(mPulse.noConflict);
    });

    it("Should have an subsribe() function", function() {
        assert.isFunction(mPulse.subscribe);
    });

    it("Should have a getApp() function", function() {
        assert.isFunction(mPulse.getApp);
    });

    it("Should have a .version", function() {
        assert.isString(mPulse.version);
    });

    function checkStub(fnName) {
        return function() {
            assert.isFunction(mPulse[fnName]);
        };
    }

    for (var i = 0; i < APP_FUNCTIONS.length; i++) {
        it("Should have a stub for " + APP_FUNCTIONS[i] + "()", checkStub(APP_FUNCTIONS[i]));
    }
});
