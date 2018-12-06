/* jshint node: true */

/*
@module gulp.ssp-files

The task 'gulp ssp-files' will copy the .ssp files declared in property "ssp-files" of module's ns.package.json.

It supports handlebars templates which context contains the timestamp property - a timestamp generated at build time
that can be used to timstamp references to .js and .css files. It also supports a {{js}} Handlebars template to minify
embedded JavaScript Code.
*/

'use strict';

var gulp = require('gulp')

,	map = require('map-stream')
,	glob = require('glob')
,	path = require('path')
,	Handlebars = require('handlebars')
,	package_manager = require('../package-manager')
,	helpers = require('./helpers')
,	esprima = require('esprima')
,	escodegen = require('escodegen')
,	args   = require('yargs').argv;

gulp.task('ssp-files', [], function()
{
	var files_map = package_manager.getFilesMapFor('ssp-files');

	installHandlebarsHelpers();

	return gulp.src(Object.keys(files_map))
		.pipe(package_manager.handleOverrides())
		.pipe(helpers.map_renamer(files_map))
		.pipe(ssp_template())
		.pipe(gulp.dest(process.gulp_dest, { mode: '0777' }));
});

var lastFile;

function ssp_template(files_map)
{
	return map(function(file, cb)
	{
		lastFile = file;
		var template = Handlebars.compile(file.contents.toString())
		,	template_context = buildTemplateContextFor(file)
		,	result = template(template_context);

		file.contents = new Buffer(result);

		cb(null, file);
	});
}

function buildTemplateContextFor(file)
{
	return {
		timestamp: new Date().getTime() + ''
	,	distro: package_manager.distro
	,	arguments: args
	};
}

function installHandlebarsHelpers()
{
	Handlebars.registerHelper('js', function(options)
	{
		var s = options.fn(this);
		return doUglify(s);
	});
}

function doUglify(s)
{
	try
	{
		var ast = esprima.parse(s);
		s = escodegen.generate(ast, {format: escodegen.FORMAT_MINIFY}) || s;
	}
	catch(ex)
	{
		console.log('WARNING: Error trying to uglify JavaScript code in ssp-file ' + lastFile.path + '. Not uglified. ');
		console.log('Reason:', ex)
	}
    return s;
}
