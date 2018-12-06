/* jshint node: true */

/*
@module gulp.ssp-libraries

This gulp task will compile the project's backend's JavaScript output file. In the distro.json the ssp-libraries section contains
a reference a list of all back-end models used to generate the back-end entry point

#Usage

	gulp ssp-libraries

##Declaring ssp-libraries in ns.package.json

The javascript files that are able to be compiled are those referenced by the property gulp.ssp-libraries
in module's ns.package.json file. Example:

	{
		"gulp": {
			...
		,	"ssp-libraries": [
				"SuiteScript/*.js"
			]
		}
	}
*/

'use strict';

var fs = require('fs')
,	gulp = require('gulp')
,	_ = require('underscore')
,	add = require('gulp-add')
,	map = require('map-stream')
,	async = require('async')
,	concat = require('gulp-concat')
,	amdOptimize = require('amd-optimize')
,	shell = require('shelljs')
,	path = require('path')

,	package_manager = require('../package-manager');

var isSCIS = !package_manager.distro.isSCA && !package_manager.distro.isSCLite;

//@function addRequireToFile Adds require.js (almond) configuration and release metadata into the final file
//@param {File} file
//@param {Object} config
//@param {Function<Error, File>} cb
//@return {Void}
function addRequireToFile (file, config, cb)
{
	package_manager.getReleaseMetadata(function (err, metadata)
	{
		var require_file_path = package_manager.getGlobsForModule('almond', 'ssp-libraries')[0]
		,	result = '';

		result += '__sc_ssplibraries_t0 = new Date().getTime(); \n';

		// output metadata as a global variable
		if(metadata)
		{
			result += 'release_metadata = ' + JSON.stringify(metadata) + '\n';
		}

		result += fs.readFileSync(require_file_path, {encoding: 'utf8'}).toString() + '\n';
		result += file.contents.toString() + '\n';

		result += 'require.config(' + JSON.stringify(config.amdConfig) + ');\n';
		
		if(isSCIS)
		{
			result += 'require(\''+config.entryPoint+'\');\n';
		}

		file.contents = new Buffer(result);
		cb(null, file);
	});
}

//@function generateLibrariesForConfig Generate a combined output with all require backend files for a particular configuration
//@param {Object} config
//@param {Function<Error, File>} cb
//@return {Void}
function generateLibrariesForConfig (config, cb)
{
	var dependencies = _.reduce(config.dependencies, function (acc, dependency, index)
		{
			return acc + (index ? ',' : '') + '\'' + dependency + '\'';
		}, '')
	,	start_point = 'define(\''+config.entryPoint+ '\', ['+dependencies+'], function (){});';

	var configurationManifestDefaultsPath = path.join(process.gulp_dest, 'configurationManifestDefaults.json');
	var stream = gulp.src(package_manager.getGlobsFor('ssp-libraries'))
		.pipe(package_manager.handleOverrides())
		.pipe(add(config.entryPoint+ '.js', start_point, true))
		.pipe(amdOptimize(config.entryPoint, config.amdConfig))
		.pipe(concat(config.exportFile))
		.pipe(map(function (file, cb)
		{
			file.contents = new Buffer(file.contents.toString()+ '\n' +
				'ConfigurationManifestDefaults = ' + shell.cat(configurationManifestDefaultsPath) + ';\n'+
				'BuildTimeInf={isSCLite: '+ package_manager.distro.isSCLite +'}\n'
				);
			cb(null, file);
		}))
		.pipe(map(function (file, cb)
		{
			addRequireToFile(file, config, cb);
		}))
		.pipe(gulp.dest(process.gulp_dest, { mode: '0777' }));

	stream.on('end', function(err)
	{
		shell.rm('-f', configurationManifestDefaultsPath);
		cb(err);
	});
}

function addRequireToSspLibrariesExt(cb)
{
	if(!isSCIS)
	{
		var config = package_manager.getTaskConfig('ssp-libraries', []);

		gulp.src(package_manager.getGlobsFor('ssp-libraries-ext'))
		.pipe(map(function(file, cb)
		{
			var require_string = 'require(\''+ config.entryPoint + '\');\n';
			file.contents = new Buffer( require_string + file.contents.toString() + addIeCssFiles());
			cb(null, file);
		}))
		.pipe(gulp.dest(process.gulp_dest, { mode: '0777' }))
		.on('end', function(err)
		{
			cb(err);
		});
	}
	else
	{
		cb(null);
	}
}

// Calculates how many css files did bless generate for each of the relevant ssps
// And then injects that amount in the ssp template using cssnumbers parameter
function cssNumbersForFile(file)
{
	var glob = require('glob')
	,	files = [];

	if(file === 'shopping')
	{
		files = glob.sync(path.join(package_manager.getNonManageResourcesPath(),'css_ie/shopping*.css'));
	}
	else if(file === 'my_account')
	{
		files = glob.sync(path.join(package_manager.getNonManageResourcesPath(),'css_ie/myaccount*.css'));
	}
	else if(file === 'checkout')
	{
		files = glob.sync(path.join(package_manager.getNonManageResourcesPath(),'css_ie/checkout*.css'));
	}

	return files.length;
}

function addIeCssFiles()
{
	if(process.is_SCA_devTools)
	{
		return '';
	}
	
	var app_includes = '\n'
	,	ie_css = {
			'shopping': cssNumbersForFile('shopping')
		,	'myaccount': cssNumbersForFile('my_account')
		,	'checkout': cssNumbersForFile('checkout')
		};
	
	_.each(ie_css, function(css_count, app)
	{
		app_includes += 'app_includes.' + app + '.ie = ';
		
		var ie_files = [];
		for(var i = 0; i < css_count; i++)
		{
			var ie_file = 'css_ie/' + app + (i ? '_' + i : '') + '.css';
			
			ie_files.push(ie_file);
		}
		
		app_includes += JSON.stringify(ie_files) + ';\n';
	});
	
	app_includes += '\n_.each(app_includes, function(app){\n';
	
	app_includes += '\tapp.ie = _.map(app.ie, function(file){\n';
	app_includes += '\t\treturn Application.getNonManageResourcesPathPrefix() + file;\n';
	app_includes += '\t});\n';
	
	app_includes += '});\n';
	
	return app_includes;
};

var deps = !process.is_SCA_devTools ? ['sass'] : [];

gulp.task('ssp-libraries-ext', deps, addRequireToSspLibrariesExt);

gulp.task('ssp-libraries', ['configuration', 'ssp-libraries-ext'], function (cb)
{
	var configs = package_manager.getTaskConfig('ssp-libraries', []);

	configs = _.isArray(configs) ? configs : [configs];

	async.each(
		configs
	,	generateLibrariesForConfig
	,	cb
	);
});
