/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
/**
 * CryptoJS core components.
 */
var CryptoJS = CryptoJS || (function (Math, undefined) {
    /**
     * CryptoJS namespace.
     */
    var C = {};

    /**
     * Library namespace.
     */
    var C_lib = C.lib = {};

    /**
     * Base object for prototypal inheritance.
     */
    var Base = C_lib.Base = (function () {
        function F() {}

        return {
            /**
             * Creates a new object that inherits from this object.
             *
             * @param {Object} overrides Properties to copy into the new object.
             *
             * @return {Object} The new object.
             *
             * @static
             *
             * @example
             *
             *     var MyType = CryptoJS.lib.Base.extend({
             *         field: 'value',
             *
             *         method: function () {
             *         }
             *     });
             */
            extend: function (overrides) {
                // Spawn
                F.prototype = this;
                var subtype = new F();

                // Augment
                if (overrides) {
                    subtype.mixIn(overrides);
                }

                // Create default initializer
                if (!subtype.hasOwnProperty('init')) {
                    subtype.init = function () {
                        subtype.$super.init.apply(this, arguments);
                    };
                }

                // Initializer's prototype is the subtype object
                subtype.init.prototype = subtype;

                // Reference supertype
                subtype.$super = this;

                return subtype;
            },

            /**
             * Extends this object and runs the init method.
             * Arguments to create() will be passed to init().
             *
             * @return {Object} The new object.
             *
             * @static
             *
             * @example
             *
             *     var instance = MyType.create();
             */
            create: function () {
                var instance = this.extend();
                instance.init.apply(instance, arguments);

                return instance;
            },

            /**
             * Initializes a newly created object.
             * Override this method to add some logic when your objects are created.
             *
             * @example
             *
             *     var MyType = CryptoJS.lib.Base.extend({
             *         init: function () {
             *             // ...
             *         }
             *     });
             */
            init: function () {
            },

            /**
             * Copies properties into this object.
             *
             * @param {Object} properties The properties to mix in.
             *
             * @example
             *
             *     MyType.mixIn({
             *         field: 'value'
             *     });
             */
            mixIn: function (properties) {
                for (var propertyName in properties) {
                    if (properties.hasOwnProperty(propertyName)) {
                        this[propertyName] = properties[propertyName];
                    }
                }

                // IE won't copy toString using the loop above
                if (properties.hasOwnProperty('toString')) {
                    this.toString = properties.toString;
                }
            },

            /**
             * Creates a copy of this object.
             *
             * @return {Object} The clone.
             *
             * @example
             *
             *     var clone = instance.clone();
             */
            clone: function () {
                return this.init.prototype.extend(this);
            }
        };
    }());

    /**
     * An array of 32-bit words.
     *
     * @property {Array} words The array of 32-bit words.
     * @property {number} sigBytes The number of significant bytes in this word array.
     */
    var WordArray = C_lib.WordArray = Base.extend({
        /**
         * Initializes a newly created word array.
         *
         * @param {Array} words (Optional) An array of 32-bit words.
         * @param {number} sigBytes (Optional) The number of significant bytes in the words.
         *
         * @example
         *
         *     var wordArray = CryptoJS.lib.WordArray.create();
         *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607]);
         *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607], 6);
         */
        init: function (words, sigBytes) {
            words = this.words = words || [];

            if (sigBytes != undefined) {
                this.sigBytes = sigBytes;
            } else {
                this.sigBytes = words.length * 4;
            }
        },

        /**
         * Converts this word array to a string.
         *
         * @param {Encoder} encoder (Optional) The encoding strategy to use. Default: CryptoJS.enc.Hex
         *
         * @return {string} The stringified word array.
         *
         * @example
         *
         *     var string = wordArray + '';
         *     var string = wordArray.toString();
         *     var string = wordArray.toString(CryptoJS.enc.Utf8);
         */
        toString: function (encoder) {
            return (encoder || Hex).stringify(this);
        },

        /**
         * Concatenates a word array to this word array.
         *
         * @param {WordArray} wordArray The word array to append.
         *
         * @return {WordArray} This word array.
         *
         * @example
         *
         *     wordArray1.concat(wordArray2);
         */
        concat: function (wordArray) {
            // Shortcuts
            var thisWords = this.words;
            var thatWords = wordArray.words;
            var thisSigBytes = this.sigBytes;
            var thatSigBytes = wordArray.sigBytes;

            // Clamp excess bits
            this.clamp();

            // Concat
            if (thisSigBytes % 4) {
                // Copy one byte at a time
                for (var i = 0; i < thatSigBytes; i++) {
                    var thatByte = (thatWords[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
                    thisWords[(thisSigBytes + i) >>> 2] |= thatByte << (24 - ((thisSigBytes + i) % 4) * 8);
                }
            } else if (thatWords.length > 0xffff) {
                // Copy one word at a time
                for (var i = 0; i < thatSigBytes; i += 4) {
                    thisWords[(thisSigBytes + i) >>> 2] = thatWords[i >>> 2];
                }
            } else {
                // Copy all words at once
                thisWords.push.apply(thisWords, thatWords);
            }
            this.sigBytes += thatSigBytes;

            // Chainable
            return this;
        },

        /**
         * Removes insignificant bits.
         *
         * @example
         *
         *     wordArray.clamp();
         */
        clamp: function () {
            // Shortcuts
            var words = this.words;
            var sigBytes = this.sigBytes;

            // Clamp
            words[sigBytes >>> 2] &= 0xffffffff << (32 - (sigBytes % 4) * 8);
            words.length = Math.ceil(sigBytes / 4);
        },

        /**
         * Creates a copy of this word array.
         *
         * @return {WordArray} The clone.
         *
         * @example
         *
         *     var clone = wordArray.clone();
         */
        clone: function () {
            var clone = Base.clone.call(this);
            clone.words = this.words.slice(0);

            return clone;
        },

        /**
         * Creates a word array filled with random bytes.
         *
         * @param {number} nBytes The number of random bytes to generate.
         *
         * @return {WordArray} The random word array.
         *
         * @static
         *
         * @example
         *
         *     var wordArray = CryptoJS.lib.WordArray.random(16);
         */
        random: function (nBytes) {
            var words = [];
            for (var i = 0; i < nBytes; i += 4) {
                words.push((Math.random() * 0x100000000) | 0);
            }

            return new WordArray.init(words, nBytes);
        }
    });

    /**
     * Encoder namespace.
     */
    var C_enc = C.enc = {};

    /**
     * Hex encoding strategy.
     */
    var Hex = C_enc.Hex = {
        /**
         * Converts a word array to a hex string.
         *
         * @param {WordArray} wordArray The word array.
         *
         * @return {string} The hex string.
         *
         * @static
         *
         * @example
         *
         *     var hexString = CryptoJS.enc.Hex.stringify(wordArray);
         */
        stringify: function (wordArray) {
            // Shortcuts
            var words = wordArray.words;
            var sigBytes = wordArray.sigBytes;

            // Convert
            var hexChars = [];
            for (var i = 0; i < sigBytes; i++) {
                var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
                hexChars.push((bite >>> 4).toString(16));
                hexChars.push((bite & 0x0f).toString(16));
            }

            return hexChars.join('');
        },

        /**
         * Converts a hex string to a word array.
         *
         * @param {string} hexStr The hex string.
         *
         * @return {WordArray} The word array.
         *
         * @static
         *
         * @example
         *
         *     var wordArray = CryptoJS.enc.Hex.parse(hexString);
         */
        parse: function (hexStr) {
            // Shortcut
            var hexStrLength = hexStr.length;

            // Convert
            var words = [];
            for (var i = 0; i < hexStrLength; i += 2) {
                words[i >>> 3] |= parseInt(hexStr.substr(i, 2), 16) << (24 - (i % 8) * 4);
            }

            return new WordArray.init(words, hexStrLength / 2);
        }
    };

    /**
     * Latin1 encoding strategy.
     */
    var Latin1 = C_enc.Latin1 = {
        /**
         * Converts a word array to a Latin1 string.
         *
         * @param {WordArray} wordArray The word array.
         *
         * @return {string} The Latin1 string.
         *
         * @static
         *
         * @example
         *
         *     var latin1String = CryptoJS.enc.Latin1.stringify(wordArray);
         */
        stringify: function (wordArray) {
            // Shortcuts
            var words = wordArray.words;
            var sigBytes = wordArray.sigBytes;

            // Convert
            var latin1Chars = [];
            for (var i = 0; i < sigBytes; i++) {
                var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
                latin1Chars.push(String.fromCharCode(bite));
            }

            return latin1Chars.join('');
        },

        /**
         * Converts a Latin1 string to a word array.
         *
         * @param {string} latin1Str The Latin1 string.
         *
         * @return {WordArray} The word array.
         *
         * @static
         *
         * @example
         *
         *     var wordArray = CryptoJS.enc.Latin1.parse(latin1String);
         */
        parse: function (latin1Str) {
            // Shortcut
            var latin1StrLength = latin1Str.length;

            // Convert
            var words = [];
            for (var i = 0; i < latin1StrLength; i++) {
                words[i >>> 2] |= (latin1Str.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
            }

            return new WordArray.init(words, latin1StrLength);
        }
    };

    /**
     * UTF-8 encoding strategy.
     */
    var Utf8 = C_enc.Utf8 = {
        /**
         * Converts a word array to a UTF-8 string.
         *
         * @param {WordArray} wordArray The word array.
         *
         * @return {string} The UTF-8 string.
         *
         * @static
         *
         * @example
         *
         *     var utf8String = CryptoJS.enc.Utf8.stringify(wordArray);
         */
        stringify: function (wordArray) {
            try {
                return decodeURIComponent(escape(Latin1.stringify(wordArray)));
            } catch (e) {
                throw new Error('Malformed UTF-8 data');
            }
        },

        /**
         * Converts a UTF-8 string to a word array.
         *
         * @param {string} utf8Str The UTF-8 string.
         *
         * @return {WordArray} The word array.
         *
         * @static
         *
         * @example
         *
         *     var wordArray = CryptoJS.enc.Utf8.parse(utf8String);
         */
        parse: function (utf8Str) {
            return Latin1.parse(unescape(encodeURIComponent(utf8Str)));
        }
    };

    /**
     * Abstract buffered block algorithm template.
     *
     * The property blockSize must be implemented in a concrete subtype.
     *
     * @property {number} _minBufferSize The number of blocks that should be kept unprocessed in the buffer. Default: 0
     */
    var BufferedBlockAlgorithm = C_lib.BufferedBlockAlgorithm = Base.extend({
        /**
         * Resets this block algorithm's data buffer to its initial state.
         *
         * @example
         *
         *     bufferedBlockAlgorithm.reset();
         */
        reset: function () {
            // Initial values
            this._data = new WordArray.init();
            this._nDataBytes = 0;
        },

        /**
         * Adds new data to this block algorithm's buffer.
         *
         * @param {WordArray|string} data The data to append. Strings are converted to a WordArray using UTF-8.
         *
         * @example
         *
         *     bufferedBlockAlgorithm._append('data');
         *     bufferedBlockAlgorithm._append(wordArray);
         */
        _append: function (data) {
            // Convert string to WordArray, else assume WordArray already
            if (typeof data == 'string') {
                data = Utf8.parse(data);
            }

            // Append
            this._data.concat(data);
            this._nDataBytes += data.sigBytes;
        },

        /**
         * Processes available data blocks.
         *
         * This method invokes _doProcessBlock(offset), which must be implemented by a concrete subtype.
         *
         * @param {boolean} doFlush Whether all blocks and partial blocks should be processed.
         *
         * @return {WordArray} The processed data.
         *
         * @example
         *
         *     var processedData = bufferedBlockAlgorithm._process();
         *     var processedData = bufferedBlockAlgorithm._process(!!'flush');
         */
        _process: function (doFlush) {
            // Shortcuts
            var data = this._data;
            var dataWords = data.words;
            var dataSigBytes = data.sigBytes;
            var blockSize = this.blockSize;
            var blockSizeBytes = blockSize * 4;

            // Count blocks ready
            var nBlocksReady = dataSigBytes / blockSizeBytes;
            if (doFlush) {
                // Round up to include partial blocks
                nBlocksReady = Math.ceil(nBlocksReady);
            } else {
                // Round down to include only full blocks,
                // less the number of blocks that must remain in the buffer
                nBlocksReady = Math.max((nBlocksReady | 0) - this._minBufferSize, 0);
            }

            // Count words ready
            var nWordsReady = nBlocksReady * blockSize;

            // Count bytes ready
            var nBytesReady = Math.min(nWordsReady * 4, dataSigBytes);

            // Process blocks
            if (nWordsReady) {
                for (var offset = 0; offset < nWordsReady; offset += blockSize) {
                    // Perform concrete-algorithm logic
                    this._doProcessBlock(dataWords, offset);
                }

                // Remove processed words
                var processedWords = dataWords.splice(0, nWordsReady);
                data.sigBytes -= nBytesReady;
            }

            // Return processed words
            return new WordArray.init(processedWords, nBytesReady);
        },

        /**
         * Creates a copy of this object.
         *
         * @return {Object} The clone.
         *
         * @example
         *
         *     var clone = bufferedBlockAlgorithm.clone();
         */
        clone: function () {
            var clone = Base.clone.call(this);
            clone._data = this._data.clone();

            return clone;
        },

        _minBufferSize: 0
    });

    /**
     * Abstract hasher template.
     *
     * @property {number} blockSize The number of 32-bit words this hasher operates on. Default: 16 (512 bits)
     */
    var Hasher = C_lib.Hasher = BufferedBlockAlgorithm.extend({
        /**
         * Configuration options.
         */
        cfg: Base.extend(),

        /**
         * Initializes a newly created hasher.
         *
         * @param {Object} cfg (Optional) The configuration options to use for this hash computation.
         *
         * @example
         *
         *     var hasher = CryptoJS.algo.SHA256.create();
         */
        init: function (cfg) {
            // Apply config defaults
            this.cfg = this.cfg.extend(cfg);

            // Set initial values
            this.reset();
        },

        /**
         * Resets this hasher to its initial state.
         *
         * @example
         *
         *     hasher.reset();
         */
        reset: function () {
            // Reset data buffer
            BufferedBlockAlgorithm.reset.call(this);

            // Perform concrete-hasher logic
            this._doReset();
        },

        /**
         * Updates this hasher with a message.
         *
         * @param {WordArray|string} messageUpdate The message to append.
         *
         * @return {Hasher} This hasher.
         *
         * @example
         *
         *     hasher.update('message');
         *     hasher.update(wordArray);
         */
        update: function (messageUpdate) {
            // Append
            this._append(messageUpdate);

            // Update the hash
            this._process();

            // Chainable
            return this;
        },

        /**
         * Finalizes the hash computation.
         * Note that the finalize operation is effectively a destructive, read-once operation.
         *
         * @param {WordArray|string} messageUpdate (Optional) A final message update.
         *
         * @return {WordArray} The hash.
         *
         * @example
         *
         *     var hash = hasher.finalize();
         *     var hash = hasher.finalize('message');
         *     var hash = hasher.finalize(wordArray);
         */
        finalize: function (messageUpdate) {
            // Final message update
            if (messageUpdate) {
                this._append(messageUpdate);
            }

            // Perform concrete-hasher logic
            var hash = this._doFinalize();

            return hash;
        },

        blockSize: 512/32,

        /**
         * Creates a shortcut function to a hasher's object interface.
         *
         * @param {Hasher} hasher The hasher to create a helper for.
         *
         * @return {Function} The shortcut function.
         *
         * @static
         *
         * @example
         *
         *     var SHA256 = CryptoJS.lib.Hasher._createHelper(CryptoJS.algo.SHA256);
         */
        _createHelper: function (hasher) {
            return function (message, cfg) {
                return new hasher.init(cfg).finalize(message);
            };
        },

        /**
         * Creates a shortcut function to the HMAC's object interface.
         *
         * @param {Hasher} hasher The hasher to use in this HMAC helper.
         *
         * @return {Function} The shortcut function.
         *
         * @static
         *
         * @example
         *
         *     var HmacSHA256 = CryptoJS.lib.Hasher._createHmacHelper(CryptoJS.algo.SHA256);
         */
        _createHmacHelper: function (hasher) {
            return function (message, key) {
                return new C_algo.HMAC.init(hasher, key).finalize(message);
            };
        }
    });

    /**
     * Algorithm namespace.
     */
    var C_algo = C.algo = {};

    return C;
}(Math));

/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
(function (Math) {
    // Shortcuts
    var C = CryptoJS;
    var C_lib = C.lib;
    var WordArray = C_lib.WordArray;
    var Hasher = C_lib.Hasher;
    var C_algo = C.algo;

    // Initialization and round constants tables
    var H = [];
    var K = [];

    // Compute constants
    (function () {
        function isPrime(n) {
            var sqrtN = Math.sqrt(n);
            for (var factor = 2; factor <= sqrtN; factor++) {
                if (!(n % factor)) {
                    return false;
                }
            }

            return true;
        }

        function getFractionalBits(n) {
            return ((n - (n | 0)) * 0x100000000) | 0;
        }

        var n = 2;
        var nPrime = 0;
        while (nPrime < 64) {
            if (isPrime(n)) {
                if (nPrime < 8) {
                    H[nPrime] = getFractionalBits(Math.pow(n, 1 / 2));
                }
                K[nPrime] = getFractionalBits(Math.pow(n, 1 / 3));

                nPrime++;
            }

            n++;
        }
    }());

    // Reusable object
    var W = [];

    /**
     * SHA-256 hash algorithm.
     */
    var SHA256 = C_algo.SHA256 = Hasher.extend({
        _doReset: function () {
            this._hash = new WordArray.init(H.slice(0));
        },

        _doProcessBlock: function (M, offset) {
            // Shortcut
            var H = this._hash.words;

            // Working variables
            var a = H[0];
            var b = H[1];
            var c = H[2];
            var d = H[3];
            var e = H[4];
            var f = H[5];
            var g = H[6];
            var h = H[7];

            // Computation
            for (var i = 0; i < 64; i++) {
                if (i < 16) {
                    W[i] = M[offset + i] | 0;
                } else {
                    var gamma0x = W[i - 15];
                    var gamma0  = ((gamma0x << 25) | (gamma0x >>> 7))  ^
                                  ((gamma0x << 14) | (gamma0x >>> 18)) ^
                                   (gamma0x >>> 3);

                    var gamma1x = W[i - 2];
                    var gamma1  = ((gamma1x << 15) | (gamma1x >>> 17)) ^
                                  ((gamma1x << 13) | (gamma1x >>> 19)) ^
                                   (gamma1x >>> 10);

                    W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16];
                }

                var ch  = (e & f) ^ (~e & g);
                var maj = (a & b) ^ (a & c) ^ (b & c);

                var sigma0 = ((a << 30) | (a >>> 2)) ^ ((a << 19) | (a >>> 13)) ^ ((a << 10) | (a >>> 22));
                var sigma1 = ((e << 26) | (e >>> 6)) ^ ((e << 21) | (e >>> 11)) ^ ((e << 7)  | (e >>> 25));

                var t1 = h + sigma1 + ch + K[i] + W[i];
                var t2 = sigma0 + maj;

                h = g;
                g = f;
                f = e;
                e = (d + t1) | 0;
                d = c;
                c = b;
                b = a;
                a = (t1 + t2) | 0;
            }

            // Intermediate hash value
            H[0] = (H[0] + a) | 0;
            H[1] = (H[1] + b) | 0;
            H[2] = (H[2] + c) | 0;
            H[3] = (H[3] + d) | 0;
            H[4] = (H[4] + e) | 0;
            H[5] = (H[5] + f) | 0;
            H[6] = (H[6] + g) | 0;
            H[7] = (H[7] + h) | 0;
        },

        _doFinalize: function () {
            // Shortcuts
            var data = this._data;
            var dataWords = data.words;

            var nBitsTotal = this._nDataBytes * 8;
            var nBitsLeft = data.sigBytes * 8;

            // Add padding
            dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = Math.floor(nBitsTotal / 0x100000000);
            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 15] = nBitsTotal;
            data.sigBytes = dataWords.length * 4;

            // Hash final blocks
            this._process();

            // Return final computed hash
            return this._hash;
        },

        clone: function () {
            var clone = Hasher.clone.call(this);
            clone._hash = this._hash.clone();

            return clone;
        }
    });

    /**
     * Shortcut function to the hasher's object interface.
     *
     * @param {WordArray|string} message The message to hash.
     *
     * @return {WordArray} The hash.
     *
     * @static
     *
     * @example
     *
     *     var hash = CryptoJS.SHA256('message');
     *     var hash = CryptoJS.SHA256(wordArray);
     */
    C.SHA256 = Hasher._createHelper(SHA256);

    /**
     * Shortcut function to the HMAC's object interface.
     *
     * @param {WordArray|string} message The message to hash.
     * @param {WordArray|string} key The secret key.
     *
     * @return {WordArray} The HMAC.
     *
     * @static
     *
     * @example
     *
     *     var hmac = CryptoJS.HmacSHA256(message, key);
     */
    C.HmacSHA256 = Hasher._createHmacHelper(SHA256);
}(Math));

/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
(function () {
    // Shortcuts
    var C = CryptoJS;
    var C_lib = C.lib;
    var Base = C_lib.Base;
    var C_enc = C.enc;
    var Utf8 = C_enc.Utf8;
    var C_algo = C.algo;

    /**
     * HMAC algorithm.
     */
    var HMAC = C_algo.HMAC = Base.extend({
        /**
         * Initializes a newly created HMAC.
         *
         * @param {Hasher} hasher The hash algorithm to use.
         * @param {WordArray|string} key The secret key.
         *
         * @example
         *
         *     var hmacHasher = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, key);
         */
        init: function (hasher, key) {
            // Init hasher
            hasher = this._hasher = new hasher.init();

            // Convert string to WordArray, else assume WordArray already
            if (typeof key == 'string') {
                key = Utf8.parse(key);
            }

            // Shortcuts
            var hasherBlockSize = hasher.blockSize;
            var hasherBlockSizeBytes = hasherBlockSize * 4;

            // Allow arbitrary length keys
            if (key.sigBytes > hasherBlockSizeBytes) {
                key = hasher.finalize(key);
            }

            // Clamp excess bits
            key.clamp();

            // Clone key for inner and outer pads
            var oKey = this._oKey = key.clone();
            var iKey = this._iKey = key.clone();

            // Shortcuts
            var oKeyWords = oKey.words;
            var iKeyWords = iKey.words;

            // XOR keys with pad constants
            for (var i = 0; i < hasherBlockSize; i++) {
                oKeyWords[i] ^= 0x5c5c5c5c;
                iKeyWords[i] ^= 0x36363636;
            }
            oKey.sigBytes = iKey.sigBytes = hasherBlockSizeBytes;

            // Set initial values
            this.reset();
        },

        /**
         * Resets this HMAC to its initial state.
         *
         * @example
         *
         *     hmacHasher.reset();
         */
        reset: function () {
            // Shortcut
            var hasher = this._hasher;

            // Reset
            hasher.reset();
            hasher.update(this._iKey);
        },

        /**
         * Updates this HMAC with a message.
         *
         * @param {WordArray|string} messageUpdate The message to append.
         *
         * @return {HMAC} This HMAC instance.
         *
         * @example
         *
         *     hmacHasher.update('message');
         *     hmacHasher.update(wordArray);
         */
        update: function (messageUpdate) {
            this._hasher.update(messageUpdate);

            // Chainable
            return this;
        },

        /**
         * Finalizes the HMAC computation.
         * Note that the finalize operation is effectively a destructive, read-once operation.
         *
         * @param {WordArray|string} messageUpdate (Optional) A final message update.
         *
         * @return {WordArray} The HMAC.
         *
         * @example
         *
         *     var hmac = hmacHasher.finalize();
         *     var hmac = hmacHasher.finalize('message');
         *     var hmac = hmacHasher.finalize(wordArray);
         */
        finalize: function (messageUpdate) {
            // Shortcut
            var hasher = this._hasher;

            // Compute HMAC
            var innerHash = hasher.finalize(messageUpdate);
            hasher.reset();
            var hmac = hasher.finalize(this._oKey.clone().concat(innerHash));

            return hmac;
        }
    });
}());

/*
 * Akamai mPulse JavaScript API
 * http://mpulse.soasta.com/
 * http://docs.soasta.com/mpulse.js/
 */
(function(window) {
    "use strict";

    //
    // Constants
    //

    // Refresh config.json every 5 minutes
    var REFRESH_CRUMB_INTERVAL = 5 * 1000 * 60;

    // 5 seconds
    var PROCESS_QUEUE_WAIT = 5 * 1000;

    // Current version
    var MPULSE_VERSION = "1.3.5";

    // App public function names
    var APP_FUNCTIONS = [
        "startTimer",
        "stopTimer",
        "sendTimer",
        "sendMetric",
        "setPageGroup",
        "getPageGroup",
        "resetPageGroup",
        "setABTest",
        "getABTest",
        "resetABTest",
        "setDimension",
        "resetDimension",
        "setSessionID",
        "getSessionID",
        "startSession",
        "incrementSessionLength",
        "setSessionLength",
        "getSessionLength",
        "setSessionStart",
        "getSessionStart",
        "transferBoomerangSession",
        "subscribe",
        "sendBeacon",
        "isInitialized"
    ];

    var EVENTS = [
        "before_beacon",
        "beacon"
    ];

    //
    // Members
    //
    var i = 0;

    // XHR function to use
    var xhrFn;

    // For the XHR function, to use onload vs onreadystatechange
    var xhrFnOnload = false;

    // now() implementation
    var now = false;

    // now() offset for environments w/out native support
    var nowOffset = +(new Date());

    /**
     * setImmediate() function to use for browser and NodeJS
     *
     * @param {function} fn Function to run
     */
    var setImm;

    //
    // Helper Functions
    //

    /**
     * Fetches the specified URL via a XHR.
     *
     * @param {string|object} urlOpts URL Options or URL
     * @param {string} urlOpts.url URL
     * @param {string} urlOpts.ua User-Agent
     * @param {function(data)} [callback] Callback w/ data
     */
    function fetchUrl(urlOpts, callback) {
        var url = typeof urlOpts === "string" ? urlOpts : urlOpts.url;
        var ua = urlOpts && urlOpts.ua;

        // determine which environment we're using to create the XHR
        if (!xhrFn) {
            if (typeof XDomainRequest === "function" ||
                typeof XDomainRequest === "object") {
                xhrFnOnload = true;
                xhrFn = function() {
                    return new XDomainRequest();
                };
            } else if (typeof XMLHttpRequest === "function" ||
                typeof XMLHttpRequest === "object") {
                xhrFn = function() {
                    return new XMLHttpRequest();
                };
            } else if (typeof Ti !== "undefined" && Ti.Network && typeof Ti.Network.createHTTPClient === "function") {
                xhrFn = Ti.Network.createHTTPClient;
            } else if (typeof require === "function") {
                xhrFn = function() {
                    var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
                    return new XMLHttpRequest();
                };
            } else if (window && typeof window.ActiveXObject !== "undefined") {
                xhrFn = function() {
                    return new window.ActiveXObject("Microsoft.XMLHTTP");
                };
            }
        }

        // create an XHR object to work with
        var xhr = xhrFn();

        // listen for state changes
        if (typeof callback === "function") {
            if (xhrFnOnload) {
                xhr.onload = function() {
                    callback(xhr.responseText);
                };
            } else {
                xhr.onreadystatechange = function() {
                    // response is ready
                    if (xhr.readyState === 4) {
                        callback(xhr.responseText);
                    }
                };
            }
        }

        xhr.open("GET", url, true);

        if (ua) {
            xhr.setRequestHeader("User-Agent", ua);
        }

        xhr.send();
    }

    //
    // Cross-platform setImmediate() support
    //
    if (typeof process !== "undefined" &&
        typeof process.nextTick === "function") {
        // NodeJS
        setImm = process.nextTick.bind(process);
    } else if (typeof window !== "undefined") {
        // Browser, check for native support
        if (window.setImmediate) {
            setImm = window.setImmediate.bind(window);
        } else if (window.msSetImmediate) {
            setImm = window.msSetImmediate.bind(window);
        } else if (window.webkitSetImmediate) {
            setImm = window.webkitSetImmediate.bind(window);
        } else if (window.mozSetImmediate) {
            setImm = window.mozSetImmediate.bind(window);
        } else {
            // No native suppot, run in 10ms
            setImm = function(fn) {
                setTimeout(fn, 10);
            };
        }
    } else {
        // Unknown, run in 10ms
        setImm = function(fn) {
            setTimeout(fn, 10);
        };
    }

    //
    // Cross-platform now() support
    //
    if (typeof window !== "undefined") {
        // Browser environment
        if (typeof window.performance !== "undefined" &&
            typeof window.performance.now === "function") {
            // native support
            now = window.performance.now.bind(window.performance);
        } else if (typeof window.performance !== "undefined") {
            // check for prefixed versions
            var methods = ["webkitNow", "msNow", "mozNow"];

            for (i = 0; i < methods.length; i++) {
                if (typeof window.performance[methods[i]] === "function") {
                    now = window.performance[methods[i]];
                    break;
                }
            }
        }
    }

    // NavigationTiming support for a more accurate offset
    if (typeof window !== "undefined" &&
        "performance" in window &&
        window.performance &&
        window.performance.timing &&
        window.performance.timing.navigationStart) {
        nowOffset = window.performance.timing.navigationStart;
    }

    if (!now) {
        // No browser support, fall back to Date.now
        if (typeof Date !== "undefined" && Date.now) {
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

    /**
     * Logs a console.warn (if console exists)
     *
     * @param {string} message Message
     */
    function warn(message) {
        if (typeof console === "object" && typeof console.warn === "function") {
            console.warn("mPulse: " + message);
        }
    }

    /**
     * Generates a pseudo-random session ID in RFC 4122 (UDID Version 4) format
     *
     * @returns {string} Pseudo-random session ID
     */
    function generateSessionID() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0;
            var v = c === "x" ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * Generates a HMAC signature for a config.json request
     *
     * @param {string} apiKey API key
     * @param {string} secretKey REST API Secret Key
     * @param {number} t Timestamp
     *
     * @returns {string} HMAC signature
     */
    function signConfig(apiKey, secretKey, t) {
        var hmacSha256 = typeof CryptoJS !== "undefined" && CryptoJS.HmacSHA256;

        if (typeof hmacSha256 !== "function" && typeof require === "function") {
            hmacSha256 = require("crypto-js/hmac-sha256");
        }

        if (typeof hmacSha256 !== "function") {
            warn("CryptoJS libraries not found!  mpulse.js will not work.");
            return "";
        }

        var message = "key=" + apiKey + "&t=" + t;

        return hmacSha256(message, secretKey).toString();
    }

    //
    // mPulse JavaScript App
    //

    /**
     * Creates a new mPulse JavaScript App to work with
     *
     * @param {string} key API key
     * @param {string} skey REST API Secret Key
     * @param {object} [options] Options
     *
     * @returns {object} App
     */
    function createApp(key, skey, options) {
        options = options || {};

        //
        // Private members
        //

        // API key
        var apiKey = key;

        // REST API Secret key
        var secretKey = skey;

        // configuration URL (default)
        var configUrl = "//c.go-mpulse.net/api/v2/config.json";

        // User-Agent to use for config.json fetch
        var ua = options.ua || "mpulse.js";

        // whether or not to force SSL
        var forceSSL = false;

        // config.json data
        var configJson = {};

        // whether or not the next config.json request should be for a refresh
        // of the crumb only
        var configJsonRefresh = false;

        // whether or not we're fully initialized
        var initialized = false;

        // beacon queue
        var beaconQueue = [];

        // whether or not we're already waiting to processQueue()
        var processQueueWaiting = false;

        // page group
        var group = false;

        // a/b
        var ab = false;

        // dimensions the user has set
        var dimensions = {};

        // dimension definitions from config.json
        var dimensionDefs = {};

        // whether or not the session ID was overridden
        var sessionID = false;

        // metric definitions from config.json
        var metricDefs = {};

        // timers
        var timers = {};

        // timer definitions from config.json
        var timerDefs = {};

        // current timer ID
        var latestTimerId = -1;

        // session start
        var sessionStart = now();

        // session length
        var sessionLength = 0;

        var subscribers = {};
        for (i = 0; i < EVENTS.length; i++) {
            subscribers[EVENTS[i]] = [];
        }

        //
        // Initialization
        //

        // parse input options
        if (typeof options.configUrl !== "undefined") {
            configUrl = options.configUrl;
        }

        if (options.forceSSL) {
            forceSSL = true;
        }

        //
        // Private Functions
        //

        /**
         * Ensures the URL has a protocol
         *
         * @param {string} url URL
         *
         * @returns {string} URL with protocol
         */
        function ensureUrlPrefix(url) {
            if (url.indexOf("http://") !== -1 ||
                url.indexOf("https://") !== -1) {
                // URL already has a protocol
                return url;
            }

            if (forceSSL) {
                // forced SSL connections
                url = "https:" + url;
            } else if (typeof window === "undefined") {
                // NodeJS
                if (url.indexOf("http:") === -1) {
                    url = "http:" + url;
                }
            } else if (typeof window !== "undefined" && window.location.protocol === "file:") {
                // Browser
                if (url.indexOf("http:") === -1) {
                    url = "http:" + url;
                }
            }

            return url;
        }

        /**
         * Gets the config.json URL
         *
         * @returns {string} config.json URL
         */
        function getConfigUrl() {
            var url = configUrl;

            var ts = +(new Date());

            if (url.indexOf("?") !== -1) {
                url += "&";
            } else {
                url += "?";
            }

            // add API key
            url += "key=" + apiKey;

            // timestamp
            url += "&t=" + ts;

            // HMAC sign request
            url += "&s=" + signConfig(apiKey, secretKey, ts);

            return ensureUrlPrefix(url);
        }

        /**
         * Gets the beacon URL
         *
         * @returns {string} Beacon URL
         */
        function getBeaconUrl() {
            var url = configJson.beacon_url;
            if (!url) {
                warn("No URL from config: " + JSON.stringify(configJson));
            }

            return ensureUrlPrefix(url);
        }

        /**
         * Parses config.json data
         *
         * @param {string} data XHR data
         */
        function parseConfig(data) {
            try {
                // parse the new JSON data
                var newConfigJson = JSON.parse(data);

                // clear any previous rate limit
                delete configJson.rate_limited;

                // merge in updates
                for (var configkey in newConfigJson) {
                    if (newConfigJson.hasOwnProperty(configkey)) {
                        configJson[configkey] = newConfigJson[configkey];
                    }
                }
            } catch (e) {
                warn("config.json could not be parsed!");

                initialized = false;
                return;
            }

            if (!configJson.beacon_url || configJson.rate_limited) {
                warn("config.json shows rate limiting, no beacons will be sent!");

                initialized = false;
                return;
            }

            // start the session if we haven't already
            if (!sessionID) {
                startSession(configJson["session_id"]);
            }

            // reset definitions
            metricDefs = {};
            timerDefs = {};
            dimensionDefs = {};

            // look at PageParams definitions
            if (configJson.PageParams) {
                // parse custom metrics
                var cms = configJson.PageParams.customMetrics;
                var cts = configJson.PageParams.customTimers;
                var cds = configJson.PageParams.customDimensions;

                if (cms) {
                    for (i = 0; i < cms.length; i++) {
                        var m = cms[i];
                        metricDefs[m.name] = m.label;
                    }
                }

                // timers
                if (cts) {
                    for (i = 0; i < cts.length; i++) {
                        var t = cts[i];
                        timerDefs[t.name] = t.label;
                    }
                }

                // dimensions
                if (cds) {
                    for (i = 0; i < cds.length; i++) {
                        var d = cds[i];
                        dimensionDefs[d.name] = d.label;
                    }
                }
            }

            // we're ready to send beacons
            initialized = true;

            // refresh the config after 5 minutes
            configJsonRefresh = true;
            setTimeout(fetchConfig, REFRESH_CRUMB_INTERVAL);

            // process the beacon queue
            setImm(processQueue);
        }

        /**
         * Fetch the config.json
         */
        function fetchConfig() {
            if (configUrl === "") {
                warn("No config.json URL specified!");
                return;
            }

            var url = getConfigUrl();

            // if we've already fetched it once, add an empty refresh crumb parameter
            if (configJsonRefresh) {
                // we know that the config.json URL always has at lease one param (API key)
                url += "&r=";
            }

            fetchUrl({
                url: url,
                ua: ua
            }, parseConfig);
        }

        /**
         * Gets a copy of all current dimensions
         *
         * @returns {object} Dimensions
         */
        function getCurrentDimensions() {
            var copy = {};

            for (var dimName in dimensions) {
                if (dimensions.hasOwnProperty(dimName)) {
                    copy[dimName] = dimensions[dimName];
                }
            }

            return copy;
        }

        /**
         * Adds a timer or metric to the queue
         *
         * @param {string} type "metric" or "timer"
         * @param {string} name Variable name
         * @param {string} value Variable value
         */
        function addToQueue(type, name, value) {
            // add the current group and dimensions to this variable
            beaconQueue.push({
                type: type,
                name: name,
                value: value,
                group: group,
                ab: ab,
                dimensions: getCurrentDimensions(),
                when: +(new Date())
            });
        }

        /**
         * Processes the beacons queue
         *
         * @param {boolean} calledFromTimer Whether or not we were called from a timer
         */
        function processQueue(calledFromTimer) {
            if (beaconQueue.length === 0) {
                // no work
                return;
            }

            if (!initialized) {
                warn("processQueue: Not yet initialized for " + apiKey + ", waiting " + PROCESS_QUEUE_WAIT);

                // only have a single timer re-triggering processQueue
                if (!processQueueWaiting || calledFromTimer) {
                    processQueueWaiting = true;

                    // no config.json yet, try again in 5 seconds
                    setTimeout(function() {
                        processQueue(true);
                    }, PROCESS_QUEUE_WAIT);
                }

                return;
            }

            // get and remove the top thing of the queue
            var q = beaconQueue.shift();

            var type = q.type;
            var name = q.name;
            var val = q.value;

            // beacon data
            var data = {};

            // page group
            if (typeof q.group !== "boolean") {
                data["h.pg"] = q.group;
            }

            if (typeof q.ab !== "boolean") {
                data["h.ab"] = q.ab;
            }

            // when this beacon fired
            data["rt.tstart"] = data["rt.end"] = q.when;

            // dimensions
            for (var dimName in q.dimensions) {
                if (q.dimensions.hasOwnProperty(dimName)) {
                    if (typeof dimensionDefs[dimName] !== "undefined") {
                        data[dimensionDefs[dimName]] = q.dimensions[dimName];
                    } else {
                        warn("Custom Dimension '" + dimName + "' is not defined");
                    }
                }
            }

            // determine how to add this beacon type to the URL
            if (type === "metric") {
                if (typeof metricDefs[name] !== "undefined") {
                    data[metricDefs[name]] = val;
                    sendBeacon(data);
                } else {
                    warn("Custom Metric '" + name + "' is not defined");
                }
            } else if (type === "timer") {
                if (typeof timerDefs[name] !== "undefined") {
                    data["t_other"] = timerDefs[name] + "|" + val;
                    sendBeacon(data);
                } else {
                    warn("Custom Timer '" + name + "' is not defined");
                }
            }

            // and run again soon until it's empty
            setImm(processQueue);
        }

        //
        // Public functions
        //

        /**
         * Sends a beacon
         *
         * @param {object} params Parameters array
         *
         * @returns {undefined}
         */
        function sendBeacon(params) {
            var ua;

            if (!initialized) {
                warn("sendBeacon: Not yet initialized for " + apiKey + ", waiting 1000");

                return setTimeout(function() {
                    sendBeacon(params);
                }, 1000);
            }

            // user-agent was specified
            if (params.ua) {
                ua = params.ua;
                delete params.ua;
            }

            params["d"] = configJson["site_domain"];
            params["h.key"] = configJson["h.key"];
            params["h.d"] = configJson["h.d"];
            params["h.cr"] = configJson["h.cr"];
            params["h.t"] = configJson["h.t"];
            params["http.initiator"] = "api";
            params["rt.start"] = "api";

            if (sessionID !== false) {
                params["rt.si"] = sessionID;
                params["rt.ss"] = sessionStart;
                params["rt.sl"] = sessionLength;
            }

            params["api"] = 1;
            params["api.v"] = 2;
            params["api.l"] = "js";
            params["api.lv"] = MPULSE_VERSION;

            // let others add data to the beacon
            fireEvent("before_beacon", params);

            // build our parameters array
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

            // get the base beacon URL
            var baseUrl = getBeaconUrl();

            // add our parameters array
            var url = baseUrl + ((baseUrl.indexOf("?") > -1) ? "&" : "?") + paramsArray.join("&");

            // notify listeners
            fireEvent("beacon", params);

            // initiate the XHR
            fetchUrl({
                url: url,
                ua: ua
            });
        }

        /**
         * Determines whether the app is initialized or not
         *
         * @returns {boolean} True if the app is initialized and can send beacons
         */
        function isInitialized() {
            return initialized;
        }

        /**
         * Starts a timer
         *
         * @param {string} name Timer name
         *
         * @returns {number} Timer ID
         */
        function startTimer(name) {
            if (typeof name !== "string") {
                return -1;
            }

            // increment the latest timer ID
            latestTimerId++;

            timers[latestTimerId] = {
                time: now(),
                name: name
            };

            return latestTimerId;
        }

        /**
         * Stops and sends a timer
         *
         * @param {number} id Timer ID
         *
         * @returns {number} Number of milliseconds since the timer started,
         *  or -1 if there was an error
         */
        function stopTimer(id) {
            if (typeof id !== "number" || id < 0) {
                return -1;
            }

            var timer = timers[id];
            var deltaMs = 0;

            if (timer) {
                deltaMs = Math.round(now() - timer.time);
                sendTimer(timer.name, deltaMs);

                // remove old timer
                delete timers[id];
            } else {
                return -1;
            }

            return deltaMs;
        }

        /**
         * Sends the specified timer
         *
         * @param {string} name Timer name
         * @param {number} value Timer value (ms)
         *
         * @returns {number} Number of milliseconds for the timer, or -1 if there was an error
         */
        function sendTimer(name, value) {
            if (typeof name !== "string") {
                return -1;
            }

            if (typeof value !== "number" || value < 0) {
                return -1;
            }

            value = Math.round(value);
            addToQueue("timer", name, value);
            setImm(processQueue);

            return value;
        }

        /**
         * Sends the specified metric
         *
         * @param {string} name Metric name
         * @param {number} [value] Metric value (1 if not specified)
         */
        function sendMetric(name, value) {
            if (typeof name !== "string") {
                return;
            }

            if (typeof value !== "undefined" &&
                typeof value !== "number") {
                return;
            }

            if (typeof value === "undefined") {
                value = 1;
            }

            addToQueue("metric", name, value);
            setImm(processQueue);
        }

        /**
         * Sets the Page Group
         *
         * @param {string} name Page Group name
         */
        function setPageGroup(name) {
            if (typeof name !== "string") {
                return;
            }

            group = name;
        }

        /**
         * Gets the Page Group
         *
         * @returns {string} Page Group, or false if no group was set
         */
        function getPageGroup() {
            return group;
        }

        /**
         * Resets (clears) the Page Group
         */
        function resetPageGroup() {
            group = false;
        }

        /**
         * Sets the A/B bucket.
         *
         * Bucket name can only contain alphanumeric characters, dashes, underscores and spaces.
         *
         * Bucket name is limited to 25 characters.
         *
         * @param {string} bucket A/B bucket name
         *
         * @returns {boolean} True if the A/B bucket was set successfully, or false if it does not
         *  satisfy the bucket naming requirements.
         */
        function setABTest(bucket) {
            if (typeof bucket !== "string") {
                return false;
            }

            if (/^[a-zA-Z0-9_ -]{1,25}$/.test(bucket) === false) {
                return false;
            }

            ab = bucket;

            return true;
        }

        /**
         * Gets the A/B bucket
         *
         * @returns {string} A/B bucket name, or false if no bucket was set
         */
        function getABTest() {
            return ab;
        }

        /**
         * Resets (clears) the A/B bucket name
         */
        function resetABTest() {
            ab = false;
        }

        /**
         * Sets a dimension
         *
         * @param {string} name Dimension name
         * @param {number} [value] Dimension value
         */
        function setDimension(name, value) {
            if (typeof name === "undefined") {
                return;
            }

            if (typeof value === "undefined") {
                // if the value isn't set, call reset dimension instead
                resetDimension(name);
                return;
            }

            dimensions[name] = value;
        }

        /**
         * Resets (clears) the Dimension
         *
         * @param {string} name Dimension name
         */
        function resetDimension(name) {
            if (typeof name !== "undefined" &&
                typeof dimensions[name] !== "undefined") {
                delete dimensions[name];
            }
        }

        /**
         * Sets the Session ID
         *
         * @param {string} id Session ID
         */
        function setSessionID(id) {
            if (typeof id !== "string" &&
                typeof id !== "number") {
                return;
            }

            // convert any numbers into string session IDs
            if (typeof id === "number") {
                id = "" + id;
            }

            sessionID = id;
        }

        /**
         * Gets the Session ID
         *
         * @returns {string} Session ID
         */
        function getSessionID() {
            return sessionID;
        }

        /**
         * Starts a new session, changing the session ID and
         * resetting the session length to zero.
         *
         * @param {string} [id] Session ID (optional)
         *
         * @returns {string} Session ID
         */
        function startSession(id) {
            // use the specifie ID or create our own
            setSessionID(id || generateSessionID());

            // reset session length to 0
            setSessionLength(0);

            // session start
            setSessionStart(now());

            return getSessionID();
        }

        /**
         * Increments the session length
         */
        function incrementSessionLength() {
            sessionLength++;
        }

        /**
         * Sets the session length
         *
         * @param {number} length Length
         */
        function setSessionLength(length) {
            if (typeof length !== "number" ||
                length < 0) {
                return;
            }

            sessionLength = length;
        }

        /**
         * Gets the session length
         *
         * @returns {number} Session Length
         */
        function getSessionLength() {
            return sessionLength;
        }

        /**
         * Sets the session start
         *
         * @param {number} start Start
         */
        function setSessionStart(start) {
            if (typeof start !== "number" ||
                start < 0) {
                return;
            }

            sessionStart = start;
        }

        /**
         * Gets the session start
         *
         * @returns {number} Session start
         */
        function getSessionStart() {
            return sessionStart;
        }

        /**
         * Transfers a Boomerang Session
         *
         * @param {Window} [frame] Root frame
         *
         * @returns {boolean} True on success
         */
        function transferBoomerangSession(frame) {
            if (typeof frame === "undefined" &&
                typeof window !== "undefined") {
                frame = window;
            }

            if (typeof frame !== "undefined" &&
                frame.BOOMR &&
                frame.BOOMR.session &&
                frame.BOOMR.session.ID &&
                frame.BOOMR.session.start &&
                frame.BOOMR.session.length) {
                // Boomerang is on the page
                setSessionID(frame.BOOMR.session.ID + "-" + Math.round(frame.BOOMR.session.start / 1000).toString(36));
                setSessionLength(frame.BOOMR.session.length);
                setSessionStart(frame.BOOMR.session.start);

                return true;
            }

            return false;
        }

        /**
         * Subscribes to an event
         *
         * @param {string} eventName Event name
         * @param {function} callback Callback
         */
        function subscribe(eventName, callback) {
            if (!subscribers.hasOwnProperty(eventName)) {
                return;
            }

            if (typeof callback !== "function") {
                return;
            }

            subscribers[eventName].push(callback);
        }

        /**
         * Fires an event
         *
         * @param {string} eventName Event name
         * @param {object} payload Event payload
         */
        function fireEvent(eventName, payload) {
            for (var i = 0; i < subscribers[eventName].length; i++) {
                // run callback
                subscribers[eventName][i](payload);
            }
        }

        // fetch the config
        fetchConfig();

        //
        // Exports
        //
        var exports = {
            startTimer: startTimer,
            stopTimer: stopTimer,
            sendTimer: sendTimer,
            sendMetric: sendMetric,
            setPageGroup: setPageGroup,
            getPageGroup: getPageGroup,
            resetPageGroup: resetPageGroup,
            setABTest: setABTest,
            getABTest: getABTest,
            resetABTest: resetABTest,
            setDimension: setDimension,
            resetDimension: resetDimension,
            setSessionID: setSessionID,
            getSessionID: getSessionID,
            startSession: startSession,
            incrementSessionLength: incrementSessionLength,
            setSessionLength: setSessionLength,
            getSessionLength: getSessionLength,
            setSessionStart: setSessionStart,
            getSessionStart: getSessionStart,
            transferBoomerangSession: transferBoomerangSession,
            subscribe: subscribe,
            sendBeacon: sendBeacon,
            isInitialized: isInitialized,

            // test hooks
            parseConfig: parseConfig
        };

        return exports;
    }

    //
    // Static private members
    //

    // Exported object
    var mPulse;

    // default app to use (the latest created one)
    var defaultApp = false;

    // list of apps
    var apps = {};

    //
    // Initialization
    //

    // save old mPulse object for noConflict()
    var root;
    var previousObj;
    if (typeof window !== "undefined") {
        root = window;
        previousObj = root.mPulse;
    }

    //
    // Public functions
    //

    /**
     * Changes mPulse back to its original value
     *
     * @returns {object} mPulse object
     */
    function noConflict() {
        root.mPulse = previousObj;
        return mPulse;
    }

    /**
     * Initializes the mPulse library.
     *
     * @param {string} apiKey API key
     * @param {string} secretKey REST API Secret Key
     * @param {object} options Options
     *
     * @returns {object} New mPulse app
     */
    function init(apiKey, secretKey, options) {
        options = options || {};

        if (typeof apiKey === "undefined") {
            warn("init(): You need to specify an apiKey");
            return;
        }

        if (typeof secretKey === "undefined") {
            warn("init(): You need to specify a secretKey");
            return;
        }

        // if the app already exists, return it
        if (typeof options.name !== "undefined" &&
            typeof apps[options.name] !== "undefined") {
            return apps[options.name];
        }

        var app = createApp(apiKey, secretKey, options);

        // set the default app if not already
        if (defaultApp === false) {
            defaultApp = app;

            // copy the correct functions for this default app
            for (var i = 0; i < APP_FUNCTIONS.length; i++) {
                var fnName = APP_FUNCTIONS[i];
                mPulse[fnName] = defaultApp[fnName];
            }
        }

        // save in our list of apps if named
        if (typeof options.name !== "undefined") {
            apps[options.name] = app;
        }

        return app;
    }

    /**
     * Gets the specified app.
     *
     * @param {string} name mPulse App name
     *
     * @returns {mPulseApp} mPulse App
     */
    function getApp(name) {
        return apps[name];
    }

    /**
     * NO-OP placeholder function for default app until
     * it is initialized.
     */
    function nop() {
        return;
    }

    /**
     * Stops the specified app
     *
     * @param {string} name mPulse App name
     */
    function stop(name) {
        if (typeof apps[name] !== "undefined") {
            delete apps[name];
        }
    }

    //
    // Exports
    //
    mPulse = {
        // export the version
        version: MPULSE_VERSION,

        /**
         * Changes the value of mPulse back to its original value, returning
         * a reference to the mPulse object.
         */
        noConflict: noConflict,
        init: init,
        getApp: getApp,
        stop: stop,
        now: now
    };

    // add a placeholder function for all public app functions until the
    // default one is defined
    for (i = 0; i < APP_FUNCTIONS.length; i++) {
        mPulse[APP_FUNCTIONS[i]] = nop;
    }

    //
    // Export to the appropriate location
    //
    if (typeof define === "function" && define.amd) {
        //
        // AMD / RequireJS
        //
        define([], function() {
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
