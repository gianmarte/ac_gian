'use strict';

var gulp = require('gulp');


gulp.task('clean-js-tmp', [], function (cb)
{
	var javascript_task = require('../extension-mechanism/local-tasks/javascript')
	,   shell = require('shelljs')
	,	del = require('del')
	;

	if(shell.test('-d', javascript_task.js_destination))
	{
		del.sync(javascript_task.js_dest, {force: true});
		cb();
	}
	else
	{
		shell.mkdir('-p', javascript_task.js_destination);
		cb();
	}
});

gulp.task('javascript', ['clean-js-tmp'], function(cb){

	var javascript_task = require('../extension-mechanism/local-tasks/javascript');
	javascript_task.compileJavascript(cb);
});

gulp.task('watch-javascript', ['javascript']);