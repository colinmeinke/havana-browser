var babel = require( 'gulp-babel' );
var gulp = require( 'gulp' );
var lint = require( 'gulp-eslint' );
var mocha = require( 'gulp-mocha' );

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
  return gulp.src([ './lib/**/*.js' ])
    .pipe( babel())
    .pipe( gulp.dest( './dist' ));
});

gulp.task( 'compileTests', [ 'lint' ], function () {
  return gulp.src([ './test/lib/**/*.js' ])
    .pipe( babel())
    .pipe( gulp.dest( './test/dist' ));
});

gulp.task( 'compile', [ 'compileCore', 'compileTests' ]);

gulp.task( 'test', function () {
  return gulp.src( './test/dist/**/*.js' )
    .pipe( mocha());
});

gulp.task( 'default', [ 'lint', 'compile', 'test' ]);
