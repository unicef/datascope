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
        src: 'src',
        filesToCopy: [
            // for performance we only match one level down: 'test/spec/{,*/}*.js'
            // if you want to recursively match all subfolders: 'test/spec/**/*.js'
            '{,*/}*.{gif,jpeg,jpg,png,webp,gif,ico}',
            '{,*/}*.html',
            'fonts/{,*/}*.*',
        ]
    };

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        config: config,

        // clean out old files from build folders
        clean: {
            dev: {
                files: [{
                    dot: true,
                    src: [
                        'build/*', '!build/.git*',
                        'lib/*', '!lib/.git*'
                    ]
                }]
            }
        },

        // copy static asset files from src/ to build/[dev or dist]
        copy: {
            dev: {
                files: [
                    {
                        expand: true,
                        dot: true,
                        cwd: config.src,
                        dest: config.build,
                        src: config.filesToCopy
                    }
                ]
            }
        },

        // compile LESS to CSS
        less: {
            dev: {
                //options: { cleancss: true }, // uncomment to minify
                files: {'build/styles/main.css': ['src/styles/main.less']}
            }
        },

        // run uglify on JS to minify it
        uglify: {
            dev: {
                files: {'build/scripts/main.js': 'build/scripts/main.js'}
            }
        },

        babel: {
            dist: {
                files: [{
                    expand: true,
                    cwd: 'src',
                    src: ['*.js', '*.jsx'],
                    dest: 'lib',
                    ext: '.js'
                }]
            }
        },

        // watch files for changes and run appropriate tasks to rebuild build/dev
        watch: {
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

        shell: {
            sayBuiltJs: { command: 'say "built js" -v Cellos' },
            sayBuiltLess: { command: 'say "built less" -v Cellos' },
            sayCopied: { command: 'say "copied files" -v Cellos' }
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
        },

        webpack: {
            dist: {
                entry: './lib/index.js',
                output: {
                    path: 'build/',
                    filename: 'react-datascope.js'
                },
                externals: {
                    'react': 'commonjs react',
                    'react/addons': 'commonjs react/addons',
                    'lodash': 'commonjs lodash',
                    'fixed-data-table': 'commonjs fixed-data-table'
                }
                //options: {
                //    webpack: webpackBuildConfig
                //}
            }

        }
    });


    grunt.registerTask('serve', function(target) {
        return grunt.task.run(['webpack-dev-server']);
    });

    grunt.registerTask('build', ['clean', 'babel', 'webpack:dist']);

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
