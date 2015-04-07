/*eslint-env node*/
module.exports = function(grunt) {
    "use strict";

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        clean: {
            options: {},
            build: ["test/*.tap", "test/coverage"]
        },
        uglify: {
            options: {
                banner: "/*! <%= pkg.name %> v<%= pkg.version %> */\n",
                mangle: true,
                sourceMap: true
            },
            build: {
                src: "src/<%= pkg.name %>.js",
                dest: "dist/<%= pkg.name %>.min.js"
            }
        },
        eslint: {
            console: {
                src: [
                    "Gruntfile.js",
                    "src/**/*.js",
                    "test/*.js"
                ]
            },
            build: {
                options: {
                    "output-file": "eslint.xml",
                    "format": "jslint-xml",
                    "silent": true
                },
                src: [
                    "Gruntfile.js",
                    "src/**/*.js",
                    "test/*.js"
                ]
            }
        },
        mochaTest: {
            test: {
                options: {
                    reporter: "tap",
                    captureFile: "test/mocha.tap"
                },
                src: [
                    "src/mpulse.js",
                    "test/test*.js"
                ]
            }
        },
        karma: {
            options: {
                singleRun: true,
                colors: true,
                configFile: "./karma.config.js",
                preprocessors: {
                    "./src/*.js": ["coverage"]
                },
                basePath: "./",
                files: [
                    "test/vendor/mocha/mocha.css",
                    "test/vendor/mocha/mocha.js",
                    "test/vendor/expect/index.js",
                    "src/mpulse.js",
                    "test/test*.js"
                ]
            },
            console: {
                browsers: ["PhantomJS"],
                frameworks: ["mocha"]
            }
        }
    });

    //
    // Plugins
    //
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-karma");
    grunt.loadNpmTasks("grunt-mocha-test");
    grunt.loadNpmTasks("gruntify-eslint");

    //
    // Tasks
    //
    grunt.registerTask("test", ["mochaTest", "karma:console"]);

    grunt.registerTask("lint", ["eslint:console"]);
    grunt.registerTask("lint:build", ["eslint:build"]);

    grunt.registerTask("build", ["uglify"]);

    //
    // Task Groups
    //
    grunt.registerTask("default", ["lint", "build"]);
    grunt.registerTask("travis", ["lint", "test"]);
    grunt.registerTask("all", ["clean", "lint:build", "test", "build"]);
};
