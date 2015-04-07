var mPulse = require("../src/mpulse");

mPulse.init("WWMEP-S65ZL-MMXA7-LRRWJ-9J9VA", {
    configUrl: "http://localhost:8080/concerto/api/config.json"
});

for (var i = 0; i < 100; i++) {
    mPulse.setDimension("Dimension 1", "val" + Math.round(Math.random() * 10));
    mPulse.setViewGroup("View Group " + Math.round(Math.random() * 10));
    mPulse.sendMetric("Metric 1", Math.round(Math.random() * 10));
    mPulse.sendTimer("Timer 1", Math.round(Math.random() * 1000));
}
