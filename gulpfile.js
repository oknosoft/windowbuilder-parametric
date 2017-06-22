/**
 * gulpfile.js for windowbuilder.js
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2017
 */

const gulp = require('gulp'),
	base64 = require('gulp-base64'),
	concat = require('gulp-concat'),
  strip = require('gulp-strip-comments'),
	rename = require('gulp-rename'),
	umd = require('gulp-umd'),
  wrap = require("gulp-wrap");

module.exports = gulp;


// Cборка модификаторов для report_server
gulp.task('modifiers', function(){
  return gulp.src([
    './src/modifiers/enums/*.js',
    './src/modifiers/catalogs/*.js',
    './src/modifiers/charts_characteristics/*.js',
    './src/modifiers/dataprocessors/*.js',
    './src/modifiers/documents/*.js',
    './src/modifiers/common/*.js',
  ])
    .pipe(concat('modifiers.js'))
    .pipe(wrap({ src: './src/metadata/modifiers.txt'}))
    .pipe(gulp.dest('./src/metadata'))

});

