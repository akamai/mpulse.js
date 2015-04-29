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
                    "test/*.js"
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
                    "test/vendor/node-assert/assert.js",
                    "test/vendor/assertive-chai/dist/assertive-chai.js",
                    "src/mpulse.js",
                    "test/*.js"
                ]
            },
            console: {
                browsers: ["PhantomJS"],
                frameworks: ["mocha"]
            }
        },
        bower: {
            install: {
                options: {
                    targetDir: "test/vendor"
                }
                // runs install
            }
        }
    });

    //
    // Plugins
    //
    grunt.loadNpmTasks("grunt-bower-task");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-karma");
    grunt.loadNpmTasks("grunt-mocha-test");
    grunt.loadNpmTasks("gruntify-eslint");

    //
    // Tasks
    //
    grunt.registerTask("test", ["bower:install", "mochaTest", "karma:console"]);

    grunt.registerTask("lint", ["eslint:console"]);
    grunt.registerTask("lint:build", ["eslint:build"]);

    grunt.registerTask("build", ["uglify"]);

    //
    // Task Groups
    //
    grunt.registerTask("default", ["lint", "build"]);
    grunt.registerTask("all", ["clean", "lint:build", "test", "build"]);
};
