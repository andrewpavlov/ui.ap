(function () {
    'use strict';

    const gulp = require('gulp');
    const concat = require('gulp-concat');
    const htmlmin = require('gulp-htmlmin');
    const ngHtml2Js = require('gulp-ng-html2js');
    const rename = require('gulp-rename');
    const browserSync = require('browser-sync').create();

    const tmpDir = './tmp';
    const htmSources = './src/**/*.html';
    const jsSources = [
        './src/**/*.module.js',
        './src/**/*.js'
    ];
    const jsFile = 'components.js';
    const partialsFile = 'partials.js';
    const buildDir = './build';

    gulp.task('js', function (done) {
        return gulp
            .src(jsSources)
            .pipe(concat(jsFile))
            .pipe(gulp.dest(tmpDir));
    });

    gulp.task('html', function (done) {
        return gulp
            .src(htmSources)
            .pipe(rename({
                dirname: ''
            }))
            .pipe(htmlmin({
                collapseWhitespace: true
            }))
            .pipe(ngHtml2Js({
                moduleName: 'ui.ap',
                prefix: 'view/'
            }))
            .pipe(concat(partialsFile))
            .pipe(gulp.dest(tmpDir));
    });

    gulp.task('build', ['js', 'html'], function (done) {
        return gulp
            .src([
                tmpDir + '/' + jsFile,
                tmpDir + '/' + partialsFile
            ])
            .pipe(concat('ui.ap.js'))
            .pipe(gulp.dest(buildDir));
    });

    gulp.task('app', function (done) {
        // const appSources = './app/**/*';
        // const cssSources = ['./src/**/*.{sass,scss,css}'];
        done();
    });

    gulp.task('server', ['build', 'app'], function (done) {
        var opts = {
            interval: 250
        };

        browserSync.init({
            port: 8180,
            server: {
                baseDir: buildDir
            }
        });

        gulp.watch(htmSources, opts, ['html', reload]);
        gulp.watch(jsSources, opts, ['js', reload]);
        gulp.watch(appSources, opts, ['app', reload]);

        function reload() {
            browserSync.reload();
        }
    });

    gulp.task('default', [
        'server'
    ]);
}());
