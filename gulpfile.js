const gulp = require('gulp'),
	nib = require('nib'),
	stylus = require('gulp-stylus'),
	autoprefixer = require('gulp-autoprefixer'),
	notify = require("gulp-notify"),
	plumber = require('gulp-plumber'),
	babel = require('gulp-babel'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	cssmin = require('gulp-cssmin');
const mPath = './';

gulp.task('stylus', ()=> {
	return gulp.src([mPath + 'src/index.styl'])
		.pipe(plumber({
			errorHandler: notify.onError()
		}))
		.pipe(stylus({
			use: nib(),
			compress: false,
		}))
		.pipe(autoprefixer({
			browsers: ['last 15 versions'],
		}))
		.pipe(cssmin())
		.pipe(gulp.dest(mPath + 'build'))
		.pipe(notify('Stylus SUCCESS'));
});
gulp.task('js', ()=> {
	return gulp.src([
			mPath + 'src/index.js'
		])
		.pipe(plumber({
			errorHandler: notify.onError()
		}))
		.pipe(concat('index.js'))
		.pipe(babel({
			presets: ['es2015']
		}))
		.pipe(uglify())
		.pipe(gulp.dest(mPath + 'build'))
		.pipe(notify('JS SUCCESS'));
});

gulp.task('watch', ()=> {
	gulp.watch([mPath + 'src/index.styl'], ['stylus']);
	gulp.watch([mPath + '/src/index.js'], ['js']);
});
