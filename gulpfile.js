var gulp = require('gulp');
var plumber = require('gulp-plumber');
var gulputil = require('gulp-util');
var uglify = require('gulp-uglify');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var path = require('path');
var watchify = require('watchify');
var reactify = require('reactify');
var streamify = require('gulp-streamify');
var livereload = require('gulp-livereload');
var gulp = require('gulp');
var sass = require('gulp-sass');



var config = {
    path: {
        app: './assignexchg/',
        statics: './assignexchg/static/',
        css: './assignexchg/static/css/',
        js: './assignexchg/static/js/',
        jsx: './assignexchg/static/jsx/',
        jinja_templates: './assignexchg/templates/',

        // OLD STUFF
        OUT: '../js/tutor-dashboard.js',
        MINIFIED_OUT: 'tutor-dashboard.min.js',
        DEST: './assignexchg/static/',
        DEST_BUILD: './assignexchg/static/js',
        DEST_SRC: './assignexchg/static/jsx',
        ENTRY_POINT: './assignexchg/static/jsx/tutor-dashboard.jsx',
    }
}

gulp.task('sass', function () {
  gulp.src('./sass/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./css'));
});

gulp.task('sass:watch', function () {
  gulp.watch('./sass/**/*.scss', ['sass']);
});

gulp.task('watch', function() {
    var watcher  = watchify(browserify({
        entries: [config.path.ENTRY_POINT],
        transform: [reactify],
        debug: true,
        cache: {}, packageCache: {}, fullPaths: true
    }))

    return watcher.on('update', function () {
        watcher.bundle()
            .on('error', function(err){
                console.log(err.message);
                this.end();
            })
            .pipe(source(config.path.OUT))
            .pipe(gulp.dest(config.path.DEST_SRC))
            console.log('Updated');
        })

        .bundle()
        .on('error', function(err){
            console.log(err.message);
            this.end();
        })

        .pipe(source(config.path.OUT))
        .pipe(gulp.dest(config.path.DEST_SRC));
});

gulp.task('watch-livereload', function() {
    livereload.listen();

    gulp.watch([
        path.join(config.path.css, '**/*.css'),
        path.join(config.path.js, '**/*.js'),
        path.join(config.path.jinja_templates, '**/*.html')
                                                                                    ]).on('change', stackReload);

    // a timeout variable
    var timer = null;

    // actual reload function
    function stackReload() {
        var reload_args = arguments;

        // Stop timeout function to run livereload if this function is ran within the last 250ms
        if (timer) clearTimeout(timer);

        // Check if any gulp task is still running
        if (!gulp.isRunning) {
            timer = setTimeout(function() {
                console.log("livereload update");
                livereload.changed.apply(null, reload_args);
            }, 250);
        }
    }
});

gulp.task('default', ['watch', 'watch-livereload']);
