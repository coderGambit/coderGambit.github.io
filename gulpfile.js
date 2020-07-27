const gulp = require('gulp');
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const terser = require('gulp-terser');
const cssnano = require('gulp-cssnano');
const htmlmin = require('gulp-htmlmin');
const watch = require('gulp-watch');
const imagemin = require('gulp-imagemin');
const browserSync = require('browser-sync').create();

// file path variables
const filePath = {
    jsSrc: "src/javascript/**/*.js",
    cssSrc: "src/css/**/*.css",
    jsBuild: "build/javascript/",
    cssBuild: "build/css/",
    htmlIndexSrc: "src/index.html",
    htmlIndexBuild: "build/",
    imgSrc: "src/assets/img/**/*.*",
    imgBuild: "build/assets/img/",
    audioSrc: "src/assets/audio/**/*.*",
    audioBuild: "build/assets/audio/"
}

function html() {
    return gulp.src(filePath.htmlIndexSrc)
        .pipe(sourcemaps.init())
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(filePath.htmlIndexBuild))
        .pipe(browserSync.reload({
            stream: true
        }));
}

function img() {
    return gulp.src(filePath.imgSrc)
        .pipe(imagemin())
        .pipe(gulp.dest(filePath.imgBuild));
}

function audio() {
    return gulp.src(filePath.audioSrc)
        .pipe(gulp.dest(filePath.audioBuild));
}

function js() {
    return gulp.src(filePath.jsSrc)
        .pipe(sourcemaps.init())
        .pipe(terser())// to uglify es6
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(filePath.jsBuild))
        .pipe(browserSync.reload({
            stream: true
        }));
}

function css() {
    return gulp.src(filePath.cssSrc)
        .pipe(sourcemaps.init())
        .pipe(autoprefixer())
        .pipe(concat('styles.css'))
        .pipe(autoprefixer())
        .pipe(cssnano())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(filePath.cssBuild))
        .pipe(browserSync.reload({
            stream: true
        }));
}

function liveReload() {
    browserSync.init({
        server: {
            baseDir: 'build/'
        }
    });
}

// this function watches all working files for changes and reruns the taska above when it detects a change
function watcher() {
    watch([filePath.cssSrc, filePath.jsSrc, filePath.htmlIndexSrc, filePath.imgSrc, filePath.audioSrc], gulp.parallel(html, css, js, img, audio));
}

exports.default = gulp.series(gulp.parallel(html, js, css, img, audio), gulp.parallel(watcher, liveReload));