'use strict';
var gulp = require('gulp');

gulp.task('pre-templates', [], function(cb){

	var templates_task = require('../extension-mechanism/local-tasks/templates');
	templates_task.generateLibraryFile(cb);
});

gulp.task('templates', ['pre-templates'], (cb)=>
{
	var templates_task = require('../extension-mechanism/local-tasks/templates');
	templates_task.runTemplates(cb);
});
