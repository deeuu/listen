import deploy from 'gulp-gh-pages'
import gulp from 'gulp'
import sass from 'gulp-sass'
import concat from 'gulp-concat'
import babelify from 'babelify'
import browserify from 'browserify'
import source from 'vinyl-source-stream'
import buffer from 'vinyl-buffer'
import gutil from 'gulp-util'
import del from 'del'
import minify from 'gulp-babel-minify'
import runSequence from 'run-sequence'
import run from 'gulp-run'

// sass to single css file
gulp.task('sass', () => {
  return (
    gulp.src('./_assets/sass/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(concat('listen.css'))
    .pipe(gulp.dest('./assets/css'))
  )
})

// Javascript to single js file
gulp.task('js', () => {
  return (
    browserify(['./_assets/js/listen.js'])
    .transform(babelify)
    .bundle()
    .pipe(source('listen.js'))
    .pipe(buffer())
    .pipe(minify())
    .pipe(gulp.dest('./assets/js'))
  )
})

gulp.task('watch', () => {
  gulp.watch('_assets/sass/*', ['sass'])
  gulp.watch('_assets/js/*', ['js'])
})

gulp.task('jekyll-build', () => {
  let shellCommand = 'bundle exec jekyll build'
  return gulp.src('./')
  .pipe(run(shellCommand))
  .on('error', gutil.log)
})

gulp.task('jekyll-serve', (done) => {
  let shellCommand = 'bundle exec jekyll serve'
  return gulp.src('./')
  .pipe(run(shellCommand))
  .on('error', gutil.log)
  .on('close', done)
})

gulp.task('clean', () => {
  return del([
    './assets',
    './.publish'
  ])
})

gulp.task('build', (cb) => {
  runSequence(['js', 'sass'], 'jekyll-build', 'clean', cb)
})

gulp.task('gh-pages', () => {
  return gulp.src('./_site/**/*')
  .pipe(deploy())
})

gulp.task('deploy', (cb) => {
  runSequence(['js', 'sass'], 'jekyll-build', 'gh-pages', 'clean', cb)
})

gulp.task('default', (cb) => {
  runSequence(['js', 'sass', 'watch'], 'jekyll-serve', cb)
})
