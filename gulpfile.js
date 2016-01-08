'use strict';

const gulp = require('gulp');
const eslint = require('gulp-eslint');


// Tasks

gulp.task('lint', () => {

    gulp.src([
        './*.js',
        './api/**/*.js',
        './test/*.js'
    ])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});