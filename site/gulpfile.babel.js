import gulp from 'gulp'
import sass from 'gulp-sass'
import concat from 'gulp-concat'
import babelify from 'babelify'
import browserify from 'browserify'
import source from 'vinyl-source-stream'
import buffer from 'vinyl-buffer'

// Sass to single css file
gulp.task('sass', () => {
  return (
    gulp.src('./_assets/sass/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(concat('main.css'))
    .pipe(gulp.dest('./assets/css'))
  )
})

gulp.task('scripts', () => {
  browserify(['./_assets/js/main.js'])
  .transform(babelify)
  .bundle()
  .pipe(source('main.js'))
  .pipe(gulp.dest('./assets/js'))
  .pipe(buffer())
})
