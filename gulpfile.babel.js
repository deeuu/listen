import deploy from 'gulp-gh-pages'
import gulp from 'gulp'
import sass from 'gulp-sass'
import concat from 'gulp-concat'
import babelify from 'babelify'
import browserify from 'browserify'
import source from 'vinyl-source-stream'
import buffer from 'vinyl-buffer'
import child from 'child_process'
import gutil from 'gulp-util'
import del from 'del'
import minify from 'gulp-babel-minify'
import runSequence from 'run-sequence'

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

/*
 * Jekyll
 */
const jekyllLogger = (buffer) => {
  buffer.toString()
    .split(/\n/)
    .forEach((message) => gutil.log('Jekyll: ' + message))
}

// bundle exec jekyll serve
gulp.task('jekyll', () => {
  const jekyll = child.spawn('bundle', ['exec', 'jekyll', 'serve',
    '--watch',
    '--incremental',
    '--drafts'
  ])

  jekyll.stdout.on('data', jekyllLogger)
  jekyll.stderr.on('data', jekyllLogger)

  return jekyll
})

gulp.task('jekyll-build', () => {
  const jekyll = child.spawn('bundle', ['exec', 'jekyll', 'build'])
  jekyll.stdout.on('data', jekyllLogger)
  jekyll.stderr.on('data', jekyllLogger)

  return jekyll
})

gulp.task('clean', () => {
  return del([
    './assets',
    './.publish'
  ])
})

gulp.task('build', (cb) => {
  runSequence(['js', 'sass'], 'jekyll-build', cb)
})

gulp.task('gh-pages', () => {
  return gulp.src('./_site/**/*')
  .pipe(deploy())
})

gulp.task('deploy', () => {
  runSequence('build', 'gh-pages')
})

gulp.task('default', ['js', 'sass', 'jekyll', 'watch']) // fix this
