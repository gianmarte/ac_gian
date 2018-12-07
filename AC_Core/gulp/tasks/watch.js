var gulp = require('gulp')
,	package_manager = require('../package-manager');

var watch_deps = [
	'frontend'
,	'watch-javascript'
,	'watch-languages'
];

watch_deps = !process.is_SCA_devTools ? watch_deps.concat(['watch-sass', 'watch-fonts', 'watch-images']) : watch_deps;

gulp.task('watch', watch_deps);