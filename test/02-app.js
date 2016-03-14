/*eslint-env mocha*/
"use strict";

describe("mPulse app", function() {
    var root = typeof window !== "undefined" ? window : {};
    var assert = (root.chai ? root.chai : require("chai")).assert;
    var mPulse = root.mPulse ? root.mPulse : require("../src/mpulse");

    var APP_FUNCTIONS = [
        "startTimer",
        "stopTimer",
        "sendTimer",
        "sendMetric",
        "setPageGroup",
        "resetPageGroup",
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

    var app = null;
    beforeEach(function() {
        app = mPulse.init("app", "secret-key", {configUrl: ""});
    });

    afterEach(function() {
        mPulse.stop("app");
        app = null;
    });

    function checkStub(fnName) {
        return function() {
            assert.isFunction(app[fnName]);
        };
    }

    for (var i = 0; i < APP_FUNCTIONS.length; i++) {
        it("Should export " + APP_FUNCTIONS[i] + "()", checkStub(APP_FUNCTIONS[i]));
    }
});
