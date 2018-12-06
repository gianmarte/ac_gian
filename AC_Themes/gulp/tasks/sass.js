'use strict';
var gulp = require('gulp')
,	shell = require('shelljs');



gulp.task('sass-prepare', function (cb)
{
	var sass_helper = require('../extension-mechanism/local-tasks/sass');
	sass_helper.generateEntryPoints(cb);
});

gulp.task('clean-sass-tmp', ['compile-sass'], () => shell.rm('-rf', 'tmp'));

gulp.task('compile-sass', ['sass-prepare'], function (gulpDone)
{
	var watch_manager = require('../extension-mechanism/watch-manager')
	,	sass_helper = require('../extension-mechanism/local-tasks/sass')
	,	args = require('yargs').argv
	;

	sass_helper.compileEntryPoints(gulpDone);
	// register sass file watch
	var to_execute = ['compile-sass'];
	var styleguide = args._.indexOf('styleguide') !== -1;
	// If styleguide task was called, 'styleguide:generate' and 'styleguide:applystyles' tasks will be added to the 'watch' task.
	if (styleguide) {
		to_execute = to_execute.concat(['styleguide:generate', 'styleguide:applystyles']);
	}

	watch_manager.registerWatch(sass_helper.local_folders, to_execute);
});

gulp.task('sass', ['clean-sass-tmp']);
