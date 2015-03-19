(function(window) {
    "use strict";
    
    //
    // Constants
    //
    var REFRESH_CRUMB_INTERVAL = 5 * 1000 * 60;
    
    function fetchUrl(url, cb) {
        var xhr = new xhrFn();
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4)
            {
                if (cb) {
                    cb(xhr);
                }
            }
        };
        
        xhr.open("get", url, true);
        xhr.send();
    }
    
    function setImm(fn) {
        if (typeof process !== "undefined" && 
            typeof process.nextTick === "function") {
            process.nextTick(fn);
        } else if (typeof window !== "undefined") {
            if (window.setImmediate) {
                window.setImmediate(fn);
            } else if (window.msSetImmediate) {
                window.msSetImmediate(fn);
            } else if (window.webkitSetImmediate) {
                window.webkitSetImmediate(fn);
            } else if (window.mozSetImmediate) {
                window.mozSetImmediate(fn);
            } else {
                setTimeout(fn, 10);
            }
        } else {
            setTimeout(fn, 10);
        }
    }
    
    var xhrFn;
    if (typeof XMLHttpRequest === "function") {
        xhrFn = XMLHttpRequest;
    } else if (typeof XMLHttpRequest !== "function" &&
        typeof require === "function") {
        xhrFn = require("xmlhttprequest").XMLHttpRequest;
    }
    
    var now = false;
    var nowOffset = +(new Date());
    if (typeof window !== "undefined") {
        if (window.performance && typeof window.performance.now === "function") {
            now = function() { return window.performance.now(); }
        } else if (window.performance) {
            methods = ["webkitNow", "msNow", "mozNow"];

            var foundNow = false;
            for (i = 0; i < methods.length; i++) {
                if (typeof window.performance[methods[i]] === "function") {
                    now = window.performance[methods[i]];
                    break;
                }
            }
        }
    }
    
    if (!now) {
        if (typeof window !== "undefined" &&
            window.performance && 
            window.performance.timing && 
            window.performance.timing.navigationStart) {
            nowOffset = window.performance.timing.navigationStart;
        }
        
        // No browser support, fall back to Date.now
        if (Date.now) {
            now = function() {
                return Date.now() - nowOffset;
            };
        } else {
            // no Date.now support, get the time from new Date()
            now = function() {
                return +(new Date()) - nowOffset;
            };
        }
    }
    
    function createApp(key, options) {
        options = options || {};
        
        //
        // Private Functions
        //
        function ensureUrlPrefix(url) {
            if (forceSSL) {
                url = "https:" + url;
            } else if (typeof window === "undefined") {
                // NodeJS
                if (url.indexOf("http:") === -1) {
                    url = "http:" + url;
                }
            } else if (typeof window !== "undefined" && window.location.protocol === "file:") {
                // NodeJS
                if (url.indexOf("http:") === -1) {
                    url = "http:" + url;
                }
            }
            
            return url;
        }
        
        function getConfigUrl() {
            var url = configUrl;
            if (url.indexOf("?") !== -1) {
                url += "&";
            } else {
                url += "?";
            }
            url += "key=" + apiKey
            
            return ensureUrlPrefix(url);
        }
        
        function getBeaconUrl() {
            return ensureUrlPrefix(configJson.beacon_url + "?");
        }
        
        function parseConfig(e) {
            console.log("Config.json response: " + e.responseText);
            
            try {
                var newConfigJson = JSON.parse(e.responseText);
                
                // merge in updates
                for (var key in newConfigJson) {
                    if (newConfigJson.hasOwnProperty(key)) {
                        configJson[key] = newConfigJson[key];
                    }
                }
            } catch (e) {
                return;
            }
            
            if (configJson.PageParams) {
                // parse custom metrics
                var cms = configJson.PageParams.customMetrics;
                var cts = configJson.PageParams.customTimers;
                var cds = configJson.PageParams.customDimensions;
                
                if (cms) {
                    for (var i = 0; i < cms.length; i++) {
                        var m = cms[i];
                        metricDefs[m.name] = m.label;
                    }
                }
                
                // timers 
                if (cts) {
                    for (var i = 0; i < cts.length; i++) {
                        var t = cts[i];
                        timerDefs[t.name] = t.label;
                    }
                }
                
                // dimensions 
                if (cds) {
                    for (var i = 0; i < cds.length; i++) {
                        var t = cds[i];
                        dimensionDefs[t.name] = t.label;
                    }
                }
            }

            // we're ready to send beacons
            initialized = true;
            
            // refresh the config after 5 minutes
            configJsonRefresh = true;
            setTimeout(fetchConfig.bind(this), REFRESH_CRUMB_INTERVAL);

            setImm(processQueue);
        }
        
        function fetchConfig() {
            var url = getConfigUrl();
            
            // if we've already fetched it once, add an empty refresh crumb parameter
            if (configJsonRefresh) {
                url += "&r=";
            }
            
            console.log("Getting config.json: " + url);
            fetchUrl(url, parseConfig.bind(this));
        }
        
        function currentDimensions() {
            var copy = {};

            for (var dimName in dimensions) {
                if(dimensions.hasOwnProperty(dimName)) {
                    copy[dimName] = dimensions[dimName];
                }
            }
            
            return copy;
        }
        
        function addToQueue(type, name, value) {
            beaconQueue.push({
                type: type,
                name: name,
                value: value,
                group: group,
                dimensions: currentDimensions()
            })
        }
        
        function processQueue() {
            if (beaconQueue.length === 0) {
                return;
            }
            
            if (!initialized) {
                console.log("Not yet initialized, trying again in 5 seconds...");
                
                // try again in 5 seconds
                setTimeout(processQueue, 5000);
                return;
            }
            
            var q = beaconQueue[0];
            
            var type = q.type;
            var name = q.name;
            var val  = q.value;
            
            var data = {};
            
            // page group
            if (typeof q.group !== "boolean") {
                data["h.pg"] = q.group;
            }
            
            // dimensions
            for (var dimName in q.dimensions) {
                if (q.dimensions.hasOwnProperty(dimName)) {
                    if (typeof dimensionDefs[dimName] !== "undefined") {
                        data[dimensionDefs[dimName]] = q.dimensions[dimName];
                    }
                }
            }
            
            if (type === "metric") {
                if (typeof metricDefs[name] !== "undefined") {
                    data[metricDefs[name]] = val;
                    sendBeacon(data);
                }
            } else if (type === "timer") {
                if (typeof timerDefs[name] !== "undefined") {
                    data["t_other"] = timerDefs[name] + "|" + val;
                    sendBeacon(data);
                }
            }
            
            // remove the first item from the queue
            beaconQueue.shift();
            
            // and run again soon until it's empty
            setImm(processQueue);
        }
        
        function currentSessionId() {
            return overriddenSessionId ? overriddenSessionId : configJson["session_id"];
        }
        
        function sendBeacon(params) {
            // TODO: do we expect consumers to send this?
            sessionLength++;
            
            params["d"] = configJson["site_domain"];
            params["h.key"] = configJson["h.key"];
            params["h.d"] = configJson["h.d"];
            params["h.cr"] = configJson["h.cr"];
            params["h.t"] = configJson["h.t"];
            params["rt.si"] = currentSessionId();
            params["rt.ss"] = sessionStart;
            params["rt.sl"] = sessionLength;
            params["http.initiator"] = "api";
            
            // TODO
            params["api"] = 1;
            
            // TODO remove?
            params["v"] = 1;
            params["u"] = "http://" + configJson["site_domain"];
            params["t_done"] = 0;
            
            var paramsArray = [];
            for (var name in params) {
                if (params.hasOwnProperty(name)) {
                    paramsArray.push(encodeURIComponent(name)
                        + "="
                        + (
                            params[name] === undefined || params[name] === null
                            ? ""
                            : encodeURIComponent(params[name])
                        )
                    );
                }
            }

            var baseUrl = getBeaconUrl();
            var url = baseUrl + ((baseUrl.indexOf("?") > -1) ? "&" : "?") + paramsArray.join("&");
            
            console.log("Sending beacon: " + url);
            
            fetchUrl(url, function(e) {
                console.log("Sent!");
            });
        }
        
        //
        // Private members
        //
        
        // API key
        var apiKey = key;
        
        // configuration URL
        var configUrl = "//c.go-mpulse.net/api/config.json";
        
        // whether or not to force SSL
        var forceSSL = false;
        
        // config.js data
        var configJson = {};
        var configJsonRefresh = false;
        var initialized = false;
        
        // beacon queue
        var beaconQueue = [];
        
        // dimensions
        var group = false;
        var dimensions = {};
        var dimensionDefs = {};
        
        var overriddenSessionId = false;
        
        // metrics
        var metricDefs = {};
        
        // timers
        var timers = {};
        var timerDefs = {};
        var currentTimerId = -1;
        
        // session start
        var sessionStart = now();
        var sessionLength = 0;
        
        //
        // Initialization
        //
        
        // parse input options
        if (options.configUrl) {
            configUrl = options.configUrl;
        }
        
        if (options.forceSSL) {
            forceSSL = true;
        }
        
        // fetch the config
        fetchConfig();
        
        //
        // Exports
        //
        var exports = {
            startTimer: function(name) {
                currentTimerId++;
                timers[currentTimerId] = {
                    time: now(),
                    name: name
                };
                
                return currentTimerId;
            },
            stopTimer: function(id) {
                var timer = timers[id];
                if (timer) {
                    this.sendTimer(timer.name, now() - timer.time);
                }
            },
            sendTimer: function(name, value) {
                console.log("sendTimer()");
                addToQueue('timer', name, value);
                setImm(processQueue);
            },
            sendMetric: function(name, value) {
                console.log("sendMetric()");
                addToQueue('metric', name, value);
                setImm(processQueue);
            },
            setViewGroup: function(name) {
                group = name;
            },
            clearViewGroup: function() {
                group = false;
            },
            setDimension: function(name, value) {
                dimensions[name] = value;
            },
            clearDimension: function(name) {
                if (typeof dimensions[name] !== undefined) {
                    delete dimensions[name];
                }
            },
            setSessionID: function(id) {
                overriddenSessionId = id;
            },
            getSessionID: function() {
                return currentSessionId();
            }
        }
        
        return exports;
    }

    //
    // Static private members
    //
    var defaultApp = false;
    var apps = {};

    //
    // Initialization
    //

    // save old ResourceTimingCompression object for noConflict()
    var root;
    var previousObj;
    if (typeof window !== "undefined") {
        root = window;
        previousObj = root.mPulse;
    }

    //
    // Exports
    //
    var mPulse = {
        /**
         * Changes the value of mPulse back to its original value, returning
         * a reference to the mPulse object.
         */
        noConflict: function() {
            root.mPulse = previousObj;
            return mPulse;
        },
        init: function(apiKey, options) {
            var app = createApp(apiKey, options);
            
            if (defaultApp === false) {
                defaultApp = app;
            }

            if (typeof options.name !== undefined) {
                apps[options.name] = app;
            }

            return app;
        },
        startTimer: function(name) {
            if (defaultApp !== false) {
                defaultApp.startTimer(name);
            }
        },
        stopTimer: function(id) {
            if (defaultApp !== false) {
                defaultApp.stopTimer(id);
            }
        },
        sendTimer: function(name, value) {
            if (defaultApp !== false) {
                defaultApp.sendTimer(name, value);
            }
        },
        sendMetric: function(name, value) {
            if (defaultApp !== false) {
                defaultApp.sendMetric(name, value);
            }
        },
        setViewGroup: function(name) {
            if (defaultApp !== false) {
                defaultApp.setViewGroup(name);
            }
        },
        clearViewGroup: function() {
            if (defaultApp !== false) {
                defaultApp.clearViewGroup();
            }
        },
        setDimension: function(name, value) {
            if (defaultApp !== false) {
                defaultApp.setDimension(name, value);
            }
        },
        clearDimension: function(name) {
            if (defaultApp !== false) {
                defaultApp.clearDimension(name);
            }
        },
        setSessionID: function(id) {
            if (defaultApp !== false) {
                defaultApp.setSessionID(id);
            }
        },
        getSessionID: function() {
            if (defaultApp !== false) {
                return defaultApp.getSessionID();
            }
        }
    }

    //
    // Export to the appropriate location
    //
    if (typeof define === "function" && define.amd) {
        //
        // AMD / RequireJS
        //
        define([], function () {
            return mPulse;
        });
    } else if (typeof module !== "undefined" && module.exports) {
        //
        // Node.js
        //
        module.exports = mPulse;
    } else if (typeof root !== "undefined") {
        //
        // Browser Global
        //
        root.mPulse = mPulse;
    }
}(typeof window !== "undefined" ? window : undefined));
