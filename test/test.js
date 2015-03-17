var mPulse = require("../src/mpulse");

mPulse.init("WWMEP-S65ZL-MMXA7-LRRWJ-9J9VA", {
    configUrl: "http://localhost:8080/concerto/api/config.json"
});

for (var i = 0; i < 100; i++) {
    mPulse.setDimension("Dimension 1", "farts" + Math.round(Math.random() * 10));
    mPulse.setViewGroup("VG " +  + Math.round(Math.random() * 10))
    mPulse.sendMetric("foo", Math.round(Math.random() * 10));
    mPulse.sendTimer("Custom Timer 1", Math.round(Math.random() * 1000));
}
