/*eslint-env mocha*/
"use strict";

describe("mPulse.init()", function() {
    var root = typeof window !== "undefined" ? window : {};
    var assert = (root.chai ? root.chai : require("chai")).assert;
    var mPulse = root.mPulse ? root.mPulse : require("../src/mpulse");

    it("Should return an app", function() {
        var app = mPulse.init("abc", "secret-key", {
            configUrl: ""
        });
        assert.isObject(app);
    });

    it("Should work without passing in an options argument", function() {
        mPulse.init("abc", "secret-key");
    });

    it("Should return the same app if init() is called twice with the same name", function() {
        var app1 = mPulse.init("abc", "secret-key", {name: "abc"});
        app1.foo = 1;

        var app2 = mPulse.init("abc", "secret-key", {name: "abc"});
        assert.equal(app2.foo, 1);
    });

    it("Should let you specify an app name that you can later get with getApp()", function() {
        var app = mPulse.init("abc", "secret-key", {
            name: "myapp",
            configUrl: ""
        });

        var app2 = mPulse.getApp("myapp");

        assert.deepEqual(app, app2);
    });

    it("Should let you create several apps", function() {
        var app1 = mPulse.init("app1", "secret-key", {configUrl: ""});
        var app2 = mPulse.init("app2", "secret-key", {configUrl: ""});
        var app3 = mPulse.init("app3", "secret-key", {configUrl: ""});

        assert.isObject(app1);
        assert.isObject(app2);
        assert.isObject(app3);

        assert.notEqual(app1, app2);
        assert.notEqual(app2, app3);
        assert.notEqual(app1, app3);
    });
});
