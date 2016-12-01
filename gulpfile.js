var gulp = require('gulp');
var less = require('gulp-less'),
    plumber = require('gulp-plumber'),
    minifycss = require('gulp-minify-css'),
    autoprefix = require('gulp-autoprefixer'),
    runSequence = require('run-sequence'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename')


// path
var path = {
    css: 'assets/css/',
    less: 'assets/less/',
    js: 'assets/js/',
    minjs: 'assets/minjs/'
};


gulp.task('css', function() {
    return gulp.src([ path.less + '*.less', '!' +  path.less + '**/_*.less'])
        .pipe(less())
        .pipe(plumber())
        .pipe(autoprefix())
        .pipe(minifycss())
        .pipe(gulp.dest( path.css))
});

gulp.task('js', function() {
    return gulp.src([path.js + '*.js', '!' + path.js + '**/_*.js'])
        .pipe(uglify())
        .pipe(rename({suffix:'.min'}))
        .pipe(gulp.dest(path.minjs));
});

// watch
gulp.task('watch', function() {
    // css
    gulp.watch(path.less + '**/*.less', ['css']);
    gulp.watch(path.js + '**/*.js',['js'])
});

// 本地监控
gulp.task('dev', function(done) {
    runSequence(
        ['watch'], done);
});


// 线上不监控
gulp.task('default', function(done) {

    runSequence(
        ['css','js'], done);
});