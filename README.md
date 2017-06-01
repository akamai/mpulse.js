# mPulse.js

Documentation is available at: [http://docs.soasta.com/mpulse.js](http://docs.soasta.com/mpulse.js).

## Version History

* v0.0.1 - May 26, 2015
    * Initial release
* v0.0.2 - September 10, 2015:
    * Added support for A/B tests: `setABTest()`, `getABTest()` and `resetABTest()` functions added
    * BREAKING Change: `setViewGroup()` was changed to `setPageGroup()`.  `resetViewGroup()` was changed to `resetPageGroup()`
    * Added `getPageGroup()`
* v1.0.0 - March 14, 2016
    * Updated to mPulse Beacon API v2
* v1.0.1 - April 13, 2016
    * console.warn() when using a Custom Timer, Metric or Dimension that doesn't exist
    * console.warn() if you don't specify the REST API Secret Key on `init()`
* v1.0.2 - July 11, 2016
    * Fix for IE 9 / `XDomainRequest`
* v1.1.0 - June 1, 2017
    * Fix for session start time
    * Set `rt.tstart` and `rt.end` on the beacon instead of `when`
    * New session start functions: `.setSessionStart()`, `.getSessionStart()`
    * New function to transfer Boomerang sessions: `.transferBoomerangSession()`
