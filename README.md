# mPulse.js

The mPulse JavaScript API (`mpulse.js`) allows you to send beacons from JavaScript to [Akamai mPulse](https://www.akamai.com/us/en/products/web-performance/mpulse-real-user-monitoring.jsp) via the [mPulse Beacon API](https://techdocs.akamai.com/mpulse/reference/beacons).

## Quick-Start

mpulse.js is available from the [Akamai/mpulse.js Github repository](https://github.com/akamai/mpulse.js).

The un-minified version is available at :

`dist/mpulse.js`

There is a minified version available at:

`dist/mpulse.min.js`

Please include the script in your web app prior to its use:

`<script src="mpulse.js"></script>`

<aside class="notice"> NOTE: Use the files in <code>dist/</code> instead of <code>src/</code>, unless the <a href="https://github.com/sytelus/CryptoJS">CryptoJS</a> libraries are already loaded </aside>

mpulse.js is also available via [bower](http://bower.io/).  You can install using:

```bash
bower install mpulse
```

## Usage

Once `mpulse.js` is loaded, there is a global `mPulse` object available on `window.mPulse`.

mpulse.js also registers itself as a RequireJS module.

For information on how to obtain the REST API Secret Key, go to [mPulse setup] (https://community.akamai.com/docs/DOC-8511).

To start working with the API, you first need to configure it with your API key and REST API Secret Key:

```js
var mPulseApp = mPulse.init("api-key", "rest-api-secret-key");
```

After `init()` has been called, you can either interact with it via the returned object or via the same methods on the core `mPulse` object:

```js
mPulseApp.sendTimer("My Timer", 100);
// or
window.mPulse.sendTimer("My Timer", 100);
```

### Cordova Usage

For mPulse to work on Cordova, you need to make the following changes in your application:

In your `index.html` you need to extend the `Content-Security-Policy` to support HTTP requests to the mPulse servers:

```html
<meta http-equiv="Content-Security-Policy" content="img-src https://*.akstat.io; connect-src https://*.akstat.io https://*.go-mpulse.net;">
```

Explanation of individual rules:

* `img-src https://*.akstat.io`: Boomerang will send GET requests with beacon data to a host in the `akstat.io` domain using dynamically created `IMG` elements over HTTPS.

* `connect-src https://*.akstat.io`: Boomerang will send POST requests with beacon data using XHR or the sendBeacon API to a host in the `akstat.io` domain over HTTPS.

* `connect-src https://*.go-mpulse.net`: Boomerang will fetch it's configuration from `*.go-mpulse.net` using XHR over HTTPS.

Include mpulse.js in your applications body as a script:

```html
<script type="text/javascript" src="js/mpulse.min.js"></script>
```

<aside class="notice"> NOTE: Point the <code>src</code> to the place where your project's setup installed the bower build of <code>mpulse.js</code>. For more information, refer to the <a href="#quick-start">Quick-Start Guide</a>. </aside>

#### Initializing mPulse in your application

In your application initialization, you need to add the following lines:

```js
// The mpulse.js instance to use later on
var mPulseInstance = null;

// Your application specific API credentials
var APIKEY = "YOUR API KEY";
var REST_API_SECRET = "YOUR REST API SECRET";

// The start of your application
var app = {
  // Your application initialization
  initialize: function() {
    mPulseInstance = mPulse.init(APIKEY, REST_API_SECRET);
    // The rest of your application initialization
    this.bindEvents();
  },
  // Bind your application events
  bindEvents: function() {
    document.addEventListener('deviceready', this.onDeviceReady, false);
  },

  onDeviceReady: function() {
    // example mPulse.js instance interaction
    mPulseInstance.sendTimer("deviceReady", deviceReadyTime - deviceInitTime);
  },
};
app.initialize();
```

## API Reference

### Initialization

#### `mPulse.init(apiKey, restApiSecretKey, options)`

##### Parameters

* `apiKey` (String) mPulse API key
* `restApiSecretKey` (String) mPulse REST API Secret Key
* `options` (Object) Additional options

##### Returns

A reference to the `mPulse` app.

##### Example

```js
var mPulseApp = mPulse.init("api-key", "rest-api-secret-key");
```

### Custom Timers

#### `mPulse.startTimer(name)`

Starts a timer with the specified name.  Use `stopTimer(id)` to stop and send the timer.

##### Parameters

* `name` (String) Custom Timer name

##### Returns

An `id` (string) that you can use with `stopTimer(id)`.

##### Example

```js
var timerId = mPulse.startTimer("My Timer");
// ... do stuff ...
mPulse.stopTimer(timerId);
```

#### `stopTimer(id)`

Stops a timer previously started via `startTimer()`.

##### Parameters

* `id` (String) Timer ID from `startTimer()`

##### Returns

The number of milliseconds that the timer ran.

##### Example

```js
var timerId = mPulse.startTimer("My Timer");
// ... do stuff ...
mPulse.stopTimer(timerId);
```

#### `sendTimer(name, value)`

Sends a timer with the specified name and value.

##### Parameters

* `name` (String) Custom Timer name
* `value` (Number) Time (milliseconds)

##### Returns

The number of milliseconds that the timer ran.

##### Example

```js
mPulse.sendTimer("My Timer", 100);
```

### Custom Metrics

#### `sendMetric(name, value)`

Sends a Custom Metric with the specified value.

##### Parameters

* `name` (String) Custom Metric name
* `value` (Number) Custom Metric value

##### Example

```js
mPulse.sendMetric("My Metric", 2);
```

### Page Group

#### `setPageGroup(pageGroup)`

Set the Page Group. All subsequent beacons will have this page group.  It can be later cleared
via `resetPageGroup()`.

##### Parameters

* `pageGroup` (String) Page Group name

##### Example

```js
mPulse.setPageGroup("My Page Group");
```

#### `getPageGroup()`

Gets the current Page Group.

##### Returns

The current Page Group, or `false` if one was not set.

##### Example

```js
var pg = mPulse.getPageGroup();
```

#### `resetPageGroup()`

Resets (clears) the Page Group.

##### Example

```js
mPulse.resetPageGroup();
```

### A/B Test

#### `setABTest(bucket)`

Set the A/B bucket. All subsequent beacons will have this bucket.  It can be later cleared
via `resetABTest()`.

##### Parameters

* `bucket` (String) A/B bucket

##### Example

```js
mPulse.setABTest("A");
```

#### `getABTest()`

Gets the A/B bucket.

##### Returns

The current A/B Test, or `false` if one was not set.

##### Example

```js
var abTest = mPulse.getABTest();
```

#### `resetABTest()`

Resets (clears) the A/B bucket.

##### Example

```js
mPulse.resetABTest();
```

### Custom Dimensions

#### `setDimension(name, value)`

Set the Custom Dimension. All subsequent beacons will have this Custom Dimension.  It
can be later cleared via `resetDimension()`.

##### Parameters

* `name` (String) Custom Dimension name
* `value` (String) Custom Dimension value

##### Example

```js
mPulse.setDimension("My Dimension", "abc");
```

#### `resetDimension(name)`

Resets (clears) a Custom Dimension.

##### Parameters

* `name` (String) Custom Dimension name

##### Example

```js
mPulse.resetDimension(name);
```

### Session

#### `setSessionID(id)`

Set the Session ID.

##### Parameters

* `id` (String) Session ID

##### Example

```js
mPulse.setSessionID("ABC-123");
```

#### `getSessionID()`

Gets the current Session ID.

##### Returns

The current Session ID, or `false` if it was not set.

##### Example

```js
var sid = mPulse.getSessionID();
```

#### `startSession(id)`

Starts a new Session and sets the Session Length to 0.

##### Parameters

* `id` (String) Session ID (optional).  If not specified, a new UUID is used.

##### Returns

The new Session ID.

##### Example

```js
var sid = mPulse.startSession();
// or
var sid = mPulse.startSession("MY-SID");
```

#### `incrementSessionLength()`

Increment the Session Length by one.

##### Example

```js
mPulse.startSession();
mPulse.incrementSessionLength();
```

#### `setSessionLength(len)`

Sets the Session Length to the specified value.

##### Parameters

* `len` (Number) Session length

##### Example

```js
mPulse.startSession();
mPulse.setSessionLength(2);
```

#### `getSessionLength()`

Gets the Session Length.

##### Returns

The Session Length.

##### Example

```js
mPulse.startSession();

mPulse.setSessionLength(2);

// should be 2
var sl = mPulse.getSessionLength();
```

#### `getSessionStart()`

Gets the Session Start.

##### Returns

The Session Start.

##### Example

```js
mPulse.startSession();

var st = mPulse.getSessionStart();
```

#### `setSessionStart()`

Sets the Session Start.

##### Example

```js
mPulse.startSession();

mPulse.setSessionStart(Date.now());
```

#### `transferBoomerangSession()`

Transfers the Session details from Boomerang (`BOOMR`) into mpulse.js.

This will transfer the Session ID, Start and Length from Boomerang, if it's already on the page.

<aside class="notice">
mpulse.js and Boomerang <strong>do not</strong> synchronize their session
details during usage.  For example, if you use <code>mPulse.incrementSessionLength()</code>, it will
increment the Session Length for the <code>mPulse</code> app but not for Boomerang (<code>BOOMR</code>).
</aside>

##### Returns

`true` on success.

##### Example

```js
mPulse.transferBoomerangSession();
```

### Misc

#### `subscribe(event, callback)`

Subscribe to events.

Available events:

* `before_beacon` - Before a beacon is sent
* `beacon` - After a beacon has been sent

##### Parameters

* `event` (String) Event name
* `callback` (Function) Function to run when the event occurs

##### Example

```js
mPulse.subscribe("beacon", function() {
    console.log("A beacon was sent!");
});
```

## Examples

### Sending a custom timer

```js
// initialize the app
mPulse.init("abcd-efgh-ijkl-mnop-qrst", "secret-key");

// set global settings
mPulse.setPageGroup("my page group");
mPulse.setABTest("my bucket");

// start the timer
var timerId = mPulse.startTimer("Timer1");

// ... do your work ...

// stop the timer
mPulse.stopTimer(timerId); // sends a beacon

// or, you can specify the amount of time
mPulse.sendTimer("Timer2", 500); // in ms
```

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
* v1.2.0 - July 19, 2018
  * Adds support for [Appcelerator Titanium](https://en.wikipedia.org/wiki/Appcelerator_Titanium)
* v1.3.0 - November 12, 2019
  * Exports `sendBeacon`
  * Optionally specify the `User-Agent` for the beacon
* v1.3.1 - November 18, 2019
  * Optionally specify the `User-Agent` for the config.json fetch
* v1.3.2 - November 18, 2019
  * Switched `node-XMLHttpRequest` dependency to fix https://github.com/driverdan/node-XMLHttpRequest/pull/128 so `User-Agent` header is set
* v1.3.4 - March 4, 2020
  * Updated to `crypto-js@4.0.0`
* v1.3.5 - April 16, 2020
  * mpulse.js will pause sending beacons when the app is rate limited
  * `mPulse.isInitialized()` function added
* v1.3.6 - July 9, 2021
  * `User-Agent` header is no longer set in the browser
* v1.3.7 - August 23, 2024
  * `crypto-js` NPM package updated
