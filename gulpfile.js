var babel = require( 'gulp-babel' );
var babelify = require( 'babelify' );
var browserify = require( 'browserify' );
var concat = require( 'gulp-concat' );
var derequire = require( 'gulp-derequire' );
var gulp = require( 'gulp' );
var lint = require( 'gulp-eslint' );
var mocha = require( 'gulp-mocha' );
var source = require( 'vinyl-source-stream' );

gulp.task( 'lint', function () {
  return gulp.src([
    './gulpfile.js',
    './lib/**/*.js',
    './test/lib/**/*.js',
  ])
    .pipe( lint())
    .pipe( lint.format());
});

gulp.task( 'compileCore', [ 'lint' ], function () {
  return browserify({
    'entries': './lib/browser.js',
    'standalone': 'havana-browser',
  })
    .transform( babelify )
    .bundle()
    .pipe( source( 'browser.js' ))
    .pipe( derequire())
    .pipe( gulp.dest( './dist' ));
});

gulp.task( 'compileTests', [ 'lint' ], function () {
  return gulp.src([ './test/lib/**/*.js' ])
    .pipe( babel())
    .pipe( gulp.dest( './test/dist' ));
});

gulp.task( 'compile', [ 'compileCore', 'compileTests' ]);

gulp.task( 'polyfill', [ 'compile' ], function () {
  return gulp.src([
    './node_modules/gulp-babel/node_modules/babel-core/browser-polyfill.js',
    './dist/browser.js',
  ])
  .pipe( concat( 'browser.with-polyfill.js' ))
  .pipe( gulp.dest( './dist' ));
});

gulp.task( 'test', function () {
  return gulp.src( './test/dist/**/*.js' )
    .pipe( mocha());
});

gulp.task( 'default', [ 'compile', 'polyfill' ]);
