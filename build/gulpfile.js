'use strict';

/*
 * **
 * ****
 * **********************************************************************************************************
 * JSON Config Options */ var /* 
 * ********************************************************************************************************** 
 * ****
 * **
 */

    pkg = require('./package.json');

/*
 * **
 * ****
 * **********************************************************************************************************
 * Requirements */ var /* 
 * ********************************************************************************************************** 
 * ****
 * **
 */

    autoprefixer = require('autoprefixer'),         // https://www.npmjs.org/package/autoprefixer
    bower        = require('gulp-bower'),           // https://www.npmjs.org/package/gulp-bower
    bowerFiles   = require('main-bower-files'),     // https://www.npmjs.org/package/main-bower-files
    bump         = require('gulp-bump'),            // https://www.npmjs.com/package/gulp-bump
    cache        = require('gulp-cached'),          // https://www.npmjs.org/package/gulp-cached
    cleanCSS     = require('gulp-clean-css'),       // https://www.npmjs.org/package/gulp-clean-css
    concat       = require('gulp-concat'),          // https://www.npmjs.org/package/gulp-concat
    debug        = require('gulp-debug'),           // https://www.npmjs.org/package/gulp-debug
    del          = require('del'),                  // https://www.npmjs.org/package/del
    filter       = require('gulp-filter'),          // https://www.npmjs.org/package/gulp-filter
    git          = require('gulp-git'),             // https://www.npmjs.org/package/gulp-git
    gulp         = require('gulp'),                 // https://www.npmjs.org/package/gulp
    header       = require('gulp-header'),          // https://www.npmjs.org/package/gulp-header
    gulpif       = require('gulp-if'),              // https://www.npmjs.org/package/gulp-if
    jshint       = require('gulp-jshint'),          // https://www.npmjs.org/package/gulp-jshint
    less         = require('gulp-less'),            // https://www.npmjs.org/package/gulp-less
    notify       = require('gulp-notify'),          // https://www.npmjs.org/package/gulp-notify
    plumber      = require('gulp-plumber'),         // https://www.npmjs.org/package/gulp-plumber
    postcss      = require('gulp-postcss'),         // https://www.npmjs.org/package/gulp-postcss
    rename       = require('gulp-rename'),          // https://www.npmjs.org/package/gulp-rename
    semver       = require('semver'),               // https://www.npmjs.com/package/semver
    uglify       = require('gulp-uglify'),          // https://www.npmjs.org/package/gulp-uglify
    watch        = require('gulp-watch'),           // https://www.npmjs.org/package/gulp-watch
    processors   = [autoprefixer()];

/*
 * **
 * ****
 * **********************************************************************************************************
 * Bower Tasks */ gulp.task('bower:build', ['bower:process:dependencies']); /*
 * ********************************************************************************************************** 
 * ****
 * **
 */

    // Bower | Nuke & rebuild libraries
    // ---------------------------------------------------------

    gulp.task('bower:nuke', function()
    {
        del(['../libs/*/', '!../libs/_*/'], { force: true }, function()
            {
               gulp.start('bower:build');
            }
        );
    });

    // Bower | Install/Update packages
    // ---------------------------------------------------------

    gulp.task('bower:install', function(cb)
    {
        bower({cmd: 'update'}).on('end', cb);
    });

    // Bower | Process & distribute dependencies
    // ---------------------------------------------------------

    gulp.task('bower:process:dependencies', function()
    {
        console.log('Processing dependencies');

        var sieve = { js: filter('**/*.js'), css: filter('**/*.css') };

        var files = bowerFiles(); if (!files.length) return;           

        return gulp.src(files)

        // JS
        .pipe(plumber())
        .pipe(sieve.js)
        .pipe(uglify())
        .pipe(header('/*! <%= file.relative %> */'))
        .pipe(concat(pkg.prefix + 'vendors.min.js'))
        // .pipe(cache('bower:scripts'))
        .pipe(gulp.dest('../docs/assets/js/'))
        .pipe(sieve.js.restore())

        // CSS
        .pipe(sieve.css)
        .pipe(header('/*! <%= file.relative %> */'))
        .pipe(concat(pkg.prefix + 'vendors.min.css'))
        // .pipe(cache('bower:styles'))
        .pipe(gulp.dest('../docs/assets/css/'))
        .pipe(sieve.css.restore())

        // Notify
        .pipe(notify(
            {
                title   : 'Success',
                subtitle: 'Bower dependencies processed:',
                message : '"<%= file.relative %>"',
                icon    : null
            })
        );
    });

/*
 * **
 * ****
 * **********************************************************************************************************
 * Inflex Tasks */ gulp.task('inflex:build', ['inflex:process:styles','inflex:process:scripts']); /*
 * ********************************************************************************************************** 
 * ****
 * **
 */

    // Inflex | Nuke & reprocess build
    // ---------------------------------------------------------

    gulp.task('inflex:nuke', function()
    {
        del(['../dist/css/', '../dist/js/'], { force: true }, function()
            {
                gulp.start('inflex:build');
            }
        );
    });

    // Inflex | Process styles
    // ---------------------------------------------------------

    gulp.task('inflex:process:styles', function()
        {
            return gulp.src('../src/less/inflex.less')
            // ↓↓↓↓↓↓
            .pipe(plumber())
            .pipe(less({paths: ['../libs']}))
            .pipe(postcss(processors))
            // .pipe(cache('inflex:styles'))
            .pipe(gulp.dest('../dist/css/'))
            .pipe(gulp.dest('../docs/assets/css/'))
            .pipe(cleanCSS())
            .pipe(rename({ suffix: '.min' }))
            .pipe(header(pkg.copyright.join('\n'), { pkg: pkg }))
            .pipe(gulp.dest('../dist/css/'))
            .pipe(gulp.dest('../docs/assets/css/'))
            // ↑↑↑↑↑↑
            .pipe(notify
            ({
                title   : 'Success',
                subtitle: 'Inflex build complete:',
                message : '"<%= file.relative %>"',
                icon    : null
            }))
        }
    );

    // Inflex | Process scripts
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    gulp.task('inflex:process:scripts', function()
    {
        return gulp.src(['../src/js/!(*.min).js'])
        // ↓↓↓↓↓↓
        .pipe(plumber())
        .pipe(jshint('../src/js/.jshintrc'))
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(concat('inflex.js'))
        .pipe(cache('inflex:scripts'))
        .pipe(gulp.dest('../dist/js/'))
        .pipe(gulp.dest('../docs/assets/js/'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(uglify())
        .pipe(gulp.dest('../dist/js/'))
        .pipe(gulp.dest('../docs/assets/js/'))
        // ↑↑↑↑↑↑
        .pipe(notify(
            {
                title   : 'Success',
                subtitle: 'Inflex build complete:',
                message : '"<%= file.relative %>"',
                icon    : null
            })
        );
    });

/*
 * **
 * ****
 * **********************************************************************************************************
 * Documentation Tasks */ gulp.task('docs:build', ['docs:process:styles','docs:process:scripts']); /*
 * ********************************************************************************************************** 
 * ****
 * **
 */

    // Documentation | Process styles
    // ---------------------------------------------------------

    gulp.task('docs:process:styles', function()
    {
        return gulp.src(['../docs/assets/css/*.less'])
        // ↓↓↓↓↓↓
        .pipe(plumber())
        .pipe(less({paths: ['../src/less/']})) // Finds @imports relative to itself first - beware duplicates
        .pipe(postcss(processors))
        .pipe(gulp.dest('../docs/assets/css/'))
        .pipe(cleanCSS())
        .pipe(rename({suffix: '.min'}))
        .pipe(header(pkg.copyright.join('\n'), { pkg: pkg }))
        .pipe(gulp.dest('../docs/assets/css/'))
        // ↑↑↑↑↑↑
        .pipe(notify(
            {
                title   : 'Success',
                subtitle: 'Documentation style(s) processed:',
                message : '"<%= file.relative %>"',
                icon    : null
            })
        );
    });

    // Documentation | Process scripts
    // ---------------------------------------------------------

    gulp.task('docs:process:scripts', function()
    {
        return gulp.src(['../docs/assets/js/!(*.min).js'])
        // ↓↓↓↓↓↓
        .pipe(plumber())
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(gulp.dest('../docs/assets/js/'))
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(header(pkg.copyright.join('\n'), { pkg: pkg }))
        .pipe(gulp.dest('../docs/assets/js/'))
        // ↑↑↑↑↑↑
        .pipe(notify(
            {
                title   : 'Success',
                subtitle: 'Documentation script(s) processed:',
                message : '"<%= file.relative %>"',
                icon    : null
            })
        );
    });

/*
 * **
 * ****
 * **********************************************************************************************************
 * Bump Tasks */ gulp.task('bump', ['bump:version', 'bump:rebuild']); /*
 * ********************************************************************************************************** 
 * ****
 * **
 */

    gulp.task('bump:version', function()
    {
        var params = { version: process.argv.indexOf("--version"), type: process.argv.indexOf("--type") }; // Get passed params (eg. gulp bump --type major)

        var type = (params.type >- 1)? process.argv[params.type + 1] : 'patch'; // Set bump type: patch (x.x.1), minor (x.1.x), major (1.x.x)

        var options = { version: semver.inc(pkg.version, type), type: type }; // Set bump options

        if (params.version >- 1){ options = { version: process.argv[params.version + 1] }}; // Override version number, if specified

        pkg.version = options.version; // Update global package version for pending rebuild

        return gulp.src(['./package.json', '../bower.json'], { base: "./" })
        // ↓↓↓↓↓↓
        .pipe(bump(options))
        .pipe(gulp.dest('./'))
        // ↑↑↑↑↑↑
        .pipe(notify(
            {
                title   : 'Success',
                subtitle: 'Version bumped (v' + pkg.version + '):',
                message : '"<%= file.relative %>"',
                icon    : null
            })
        );
    });

    gulp.task('bump:rebuild', ['bump:version'], function()
        {
            gulp.start('default')
        }
    );

    gulp.task('tag', function()
        {
            git.tag(pkg.version, 'Version ' + pkg.version, function (err)
                {
                    if (err) throw err;
                }
            );
        }
    );

/*
 * **
 * ****
 * **********************************************************************************************************
 * Watch Tasks */ gulp.task('watch', ['inflex:watch', 'docs:watch']); /*
 * ********************************************************************************************************** 
 * ****
 * **
 */

    // Inflex | Watch files
    // ---------------------------------------------------------

    gulp.task('inflex:watch', function()
        {
            gulp.watch(['../src/less/**/*.less'], ['inflex:process:styles']);

            gulp.watch(['../src/js/!(*.min).js'], ['inflex:process:scripts']);
        }
    );

    // Docs | Watch files
    // ---------------------------------------------------------

    gulp.task('docs:watch', function() 
        {
            gulp.watch(['../docs/assets/css/**/*.less'], ['docs:process:styles']);

            gulp.watch(['../docs/assets/js/!(*.min).js'], ['docs:process:scripts']);
        }
    );

/*
 * **
 * ****
 * **********************************************************************************************************
 * Default Tasks */ gulp.task('default', ['bower:build', 'inflex:build', 'docs:build']); /*
 * ********************************************************************************************************** 
 * ****
 * **
 */