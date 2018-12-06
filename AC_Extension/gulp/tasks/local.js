var gulp = require('gulp')
,	log = require('fancy-log')
,	c = require('ansi-colors')
,	nconf = require('nconf')
;


function localMessage()
{
	var run_https = nconf.get('dbConfig:https')
	,	folders_watching = nconf.get('extensionMode') ? nconf.get('folders:extensions_path').join(', ') : nconf.get('folders:theme_path');

	if(nconf.get('credentials:is_scis'))
	{
		run_https = true;
	}

	log('+- Local server available at ' + c.cyan((run_https ? 'https': 'http') + '://localhost:' + nconf.get('dbConfig:port')) + '.');
	log('+- Livereload at ' + c.cyan('http://localhost:35729') + '.');
	log('+- Watching current folder: '  + c.cyan(folders_watching) + '.');

	if(!nconf.get('credentials:is_scis')) {
		log('+- To generate the styleguide on localhost:3000 use: '  + c.cyan('gulp extension:local styleguide') + '.');
	}

	log('+- Type ' + c.cyan('gulp') + ' for help on how to use the commands.');
	log('+- Please check your local.ssp applications to start working locally.');
	log('+- To cancel Gulp Watch enter: ' + c.cyan('control + c') + '.');
}

if(nconf.get('extensionMode'))
{
	/**
	* Compiles the code locally -javascript, templates and sass- and watch for changes to work in -local.ssp urls.
	* Updates the manifest automatically before compiling.
	* It can receive the following arguments:
	* @task {extension:local}
	* @order {6}

	* @arg {preserve-manifest} Do not automatically update the manifest.json file.
	*/
	gulp.task('extension:local', ['update-validate', 'watch'], localMessage);
}
else
{
	/**
	* Compiles the code locally -templates and sass- and watch for changes to work in the -local.ssp urls.
	* It recognizes overrides made in the Overrides folder.
	* To add new override files execute theme:local again.
	* Updates the manifest automatically before compiling.
	* It can receive the following arguments:
	* @task {theme:local}
	* @order {6}

	* @arg {preserve-manifest} Do not automatically update the manifest.json file.
	*/
	gulp.task('theme:local', ['update-validate', 'watch'], localMessage);
}
