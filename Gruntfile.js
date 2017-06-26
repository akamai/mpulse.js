/*eslint-env node*/
module.exports = function(grunt) {
    "use strict";

    var src = [
        "lib/cryptojslib/components/core.js",
        "lib/cryptojslib/components/sha256.js",
        "lib/cryptojslib/components/hmac.js",
        "src/mpulse.js"
    ];

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        clean: {
            options: {},
            build: [
                "dist/*",
                "test/*.tap",
                "test/coverage"
            ]
        },
        concat: {
            options: {
                stripBanners: false,
                seperator: ";"
            },
            release: {
                src: src,
                dest: "dist/<%= pkg.name %>.js"
            }
        },
        uglify: {
            options: {
                banner: "/*! <%= pkg.name %> v<%= pkg.version %> */\n",
                mangle: true,
                sourceMap: true
            },
            build: {
                src: src,
                dest: "dist/<%= pkg.name %>.min.js"
            }
        },
        compress: {
            main: {
                options: {
                    archive: "dist/<%= pkg.name %>-v<%= pkg.version %>.zip",
                    mode: "zip",
                    level: 9
                },
                files: [
                    {src: ["README.md"], dest: ""},
                    {src: ["src/*.js"], filter: "isFile"},
                    {src: ["dist/*.js*"], filter: "isFile"}
                ]
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
                    "lib/mocha/mocha.css",
                    "lib/mocha/mocha.js",
                    "lib/assertive-chai/dist/assertive-chai.js",
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
                    targetDir: "lib"
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
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-compress");
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

    grunt.registerTask("build", ["concat", "uglify"]);

    //
    // Task Groups
    //
    grunt.registerTask("default", ["lint", "build"]);
    grunt.registerTask("all", ["clean", "lint:build", "test", "build", "compress:main"]);
};
