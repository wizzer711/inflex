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

    gulp.task('bower:nuke', function(){

        del(['./libs/*'], { dryRun: false }).then(paths => {

            console.log('Deleted:\n', paths.join('\n'));

            gulp.start('bower:build');
        });
    });

    // Bower | Install/Update packages
    // ---------------------------------------------------------

    gulp.task('bower:install', function(){

        return bower({ cmd: 'update' });
    });

    // Bower | Process & distribute dependencies
    // ---------------------------------------------------------

    gulp.task('bower:process:dependencies', function(){

        const iconFilter = filter(['**/MaterialIcons*.*'], { restore: true });

        var files = bowerFiles(); if (!files.length) return;

        return gulp.src(files)
         // ↓↓↓↓↓↓
        .pipe(plumber())
        .pipe(iconFilter)
        .pipe(gulp.dest('./dist/fonts/icons'))
        .pipe(iconFilter.restore)
        // ↑↑↑↑↑↑
        .pipe(notify({

            title   : 'Success',
            subtitle: 'Bower dependencies processed:',
            message : '"<%= file.relative %>"',
            icon    : null
        }));
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
        del(['./dist/css/', './dist/js/'], { force: true }, function()
            {
                gulp.start('inflex:build');
            }
        );
    });

    // Inflex | Process styles
    // ---------------------------------------------------------

    gulp.task('inflex:process:styles', function()
        {
            return gulp.src('./src/less/inflex.less')
            // ↓↓↓↓↓↓
            .pipe(plumber())
            .pipe(less({paths: ['./libs']}))
            .pipe(postcss(processors))
            // .pipe(cache('inflex:styles'))
            .pipe(gulp.dest('./dist/css/'))
            .pipe(cleanCSS())
            .pipe(rename({ suffix: '.min' }))
            .pipe(header(pkg.copyright.join('\n'), { pkg: pkg }))
            .pipe(gulp.dest('./dist/css/'))
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
        return gulp.src(['./src/js/!(*.min).js'])
        // ↓↓↓↓↓↓
        .pipe(plumber())
        .pipe(jshint('./src/js/.jshintrc'))
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(concat('inflex.js'))
        .pipe(cache('inflex:scripts'))
        .pipe(gulp.dest('./dist/js/'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(uglify())
        .pipe(header(pkg.copyright.join('\n'), { pkg: pkg }))
        .pipe(gulp.dest('./dist/js/'))
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
 * Bump Tasks */ gulp.task('bump', ['bump:rebuild']); /*
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

        return gulp.src(['./package.json', './bower.json'], { base: "./" })
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

/*
 * **
 * ****
 * **********************************************************************************************************
 * Git Tasks */ /*
 * ********************************************************************************************************** 
 * ****
 * **
 */

    gulp.task('git:add', function(){

        return gulp.src('.').pipe(git.add({args: '-u'}));
    });

    gulp.task('git:commit', function(){
     
        return gulp.src('.').pipe(git.commit('Version Bump (' + pkg.version + ')'));
    });

    gulp.task('git:tag', function(){
        
        git.tag(pkg.version, 'Version ' + pkg.version, function (err){
            
            if (err) throw err;
        });
    });

    gulp.task('git:push', function(){
     
        git.push('origin', 'master', {args: " --tags"}, function (err){

            if (err) throw err;
        });
    });

/*
 * **
 * ****
 * **********************************************************************************************************
 * Watch Tasks */ gulp.task('watch', ['inflex:watch']); /*
 * ********************************************************************************************************** 
 * ****
 * **
 */

    // Inflex | Watch files
    // ---------------------------------------------------------

    gulp.task('inflex:watch', function()
        {
            gulp.watch(['./src/less/**/*.less'], ['inflex:process:styles']);

            gulp.watch(['./src/js/!(*.min).js'], ['inflex:process:scripts']);
        }
    );

/*
 * **
 * ****
 * **********************************************************************************************************
 * Default Tasks */ gulp.task('default', ['bower:build', 'inflex:build']); /*
 * ********************************************************************************************************** 
 * ****
 * **
 */