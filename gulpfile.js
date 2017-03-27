(function () {
    'use strict';

    const gulp = require('gulp');
    const concat = require('gulp-concat');
    const htmlmin = require('gulp-htmlmin');
    const ngHtml2Js = require('gulp-ng-html2js');
    const rename = require('gulp-rename');
    const tmpDir = './tmp';
    const jsFile = 'components.js';
    const partialsFile = 'partials.js';

    gulp.task('js', function (done) {
        return gulp
            .src([
                './src/**/*.module.js',
                './src/**/*.js'
            ])
            .pipe(concat(jsFile))
            .pipe(gulp.dest(tmpDir));
    });

    gulp.task('html', function (done) {
        return gulp
            .src('./src/**/*.html')
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
            .pipe(gulp.dest('./build'))
    });

    gulp.task('default', [
        'build'
    ]);
}());
