var gulp = require('gulp');
var browserify = require('browserify');
var watchify = require('watchify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var sourcemaps = require('gulp-sourcemaps');
var concatCss = require('gulp-concat-css');
var rename = require('gulp-rename');
var ghPages = require('gulp-gh-pages');
var browserifyCss = require('browserify-css');
var uglify = require('gulp-uglify');
var cleanCSS = require('gulp-clean-css');

var KarmaServer = require('karma').Server;

var TEST_BROWSERS = ((process.env.TEST_BROWSERS || '').replace(/^\s+|\s+$/, '') || 'PhantomJS').split(/\s*,\s*/g);

function Karma(singleRun) {
    new KarmaServer({
        configFile: __dirname + '/karma.conf.js',
        singleRun: singleRun,
        browsers: TEST_BROWSERS
    }).start();
}

gulp.task('test', function() {
    Karma(true);
})

gulp.task('test-auto', function() {
    Karma(false);
});

// DIST

var build = 'build/';
var dist = 'dist/';
var dest = build + 'marky/';

function bundle(name, options) {
  return browserify('marky.js', options)
    .bundle()
    .pipe(source(name))
    .pipe(buffer());
}

gulp.task('build:assets', function() {

  gulp.src('./node_modules/codemirror/theme/*.css')
    .pipe(concatCss('marky.editor.themes.css'))
    .pipe(cleanCSS())
    .pipe(gulp.dest(dist));

  gulp.src('./assets/css/main.css')
    .pipe(concatCss('marky.css'))
    .pipe(cleanCSS())
    .pipe(gulp.dest(dist));
});

gulp.task('build:js', function() {

  // minified umd
  bundle('marky.js', { standalone: 'Marky', debug: true })
    .pipe(sourcemaps.init( { loadMaps: true } ))
      .pipe(uglify({ output: { ascii_only: true } }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(dist));
});

gulp.task('build', [ 'build:assets', 'build:js' ]);

gulp.task('watch', [ 'build', 'example' ], function() {
  gulp.watch(['./assets/**/*', './example.html', './src/**/*.js'], [ 'build', 'example' ])
});

gulp.task('example', function(cb) {
  gulp.src('./example.html')
    .pipe(rename('index.html'))
    .pipe(gulp.dest(dist));
  cb(); // synchronously
})

gulp.task('gh-pages', [ 'example' ], function() {
  gulp.src(dist + '/**/*')
    .pipe(ghPages());
});

gulp.task('release', [ 'build', 'gh-pages' ]);

gulp.task('default', [ 'test' ]);
