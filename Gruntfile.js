'use strict';
var _ = require('lodash');
var webpackDevConfig = require('./webpack.config.js');
var webpackBuildConfig = require('./webpack.config.build.js');
var fs = require('fs');

var nodeModules = {};
fs.readdirSync('node_modules')
    .filter(function(x) { return ['.bin'].indexOf(x) === -1; })
    .forEach(function(mod) { nodeModules[mod] = 'commonjs ' + mod; });

//console.log(nodeModules);

module.exports = function(grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    var config = {
        src: 'src'
    };

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        config: config,

        // clean out old files from build folders
        clean: {
            build: {
                files: [{
                    dot: true,
                    src: [
                        'build/*', '!build/.git*',
                        'lib/*', '!lib/.git*'
                    ]
                }]
            }
        },

        // transpile JSX/ES6 to normal JS
        // (this is the standard build in lib)
        babel: {
            build: {
                files: [{
                    expand: true,
                    cwd: 'src',
                    src: ['*.js', '*.jsx'],
                    dest: 'lib',
                    ext: '.js'
                }]
            }
        },

        // also create a self-contained bundle version
        webpack: {
            build: {
                entry: './lib/index.js',
                output: {
                    path: 'build/',
                    filename: 'react-datascope.js'
                }
            }
        },

        // minify bundle
        uglify: {
            build: {
                files: {'build/react-datascope.min.js': 'build/react-datascope.js'}
            }
        },

        // watch files for changes and run appropriate tasks to rebuild build/dev
        watch2: {
            grunt: {
                files: 'Gruntfile.js',
                tasks: ['buildDev', 'shell:sayBuiltJs']
            },
            less: {
                files: '<%= config.src %>/styles/**/*.*',
                tasks: ['less:dev', 'shell:sayBuiltLess']
            },
            browserify: {
                files: '<%= config.src %>/scripts/**/*.*',
                tasks: ['browserify:dev', 'shell:sayBuiltJs']
            },
            copy: {
                files: [
                    '<%= config.src %>/{,*/}*.{gif,jpeg,jpg,png,webp,gif,ico}',
                    '<%= config.src %>/fonts/{,*/}*.*'
                ],
                tasks: ['copy:dev', 'shell:sayCopied']
            },
            html: {
                files: '<%= config.src %>/**/*.html',
                tasks: ['buildDev', 'shell:sayBuiltJs']
            }
        },

        watch: {
            build: {
                files: '<%= config.src %>/*.*',
                tasks: ['build']
            }
        },

        shell: {
            sayBuiltJs: { command: 'say "built js" -v Cellos' }
        },

        'webpack-dev-server': {
            options: {
                hot: true,
                port: 5709,
                webpack: webpackDevConfig,
                publicPath: webpackDevConfig.output.publicPath,
                historyApiFallback: true
            },
            start: {
                keepAlive: true,
                webpack: {
                    devtool: "eval",
                    debug: true
                }
            }
        }

    });


    grunt.registerTask('serve', function(target) {
        return grunt.task.run(['webpack-dev-server']);
    });

    grunt.registerTask('examples', function(target) {
        return grunt.task.run(['webpack-dev-server']);
    });

    grunt.registerTask('build', ['clean', 'babel', 'webpack', 'uglify']);

    // Dev tasks
    //grunt.registerTask('buildDev', [
    //    'clean:dev',      // clean old files out of build/dev
    //    'copy:dev',       // copy static asset files from app/ to build/dev
    //    'browserify:dev', // bundle JS with browserify
    //    'less:dev',       // compile LESS to CSS
    //]);
    //grunt.registerTask('serveDev', [
    //    'buildDev',
    //    'connect:dev',     // web server for serving files from build/dev
    //    'watch'            // watch src files for changes and rebuild when necessary
    //]);


    // Task aliases
    //grunt.registerTask('dev', ['serveDev']);
    //grunt.registerTask('serve', ['serveDev']);
};
