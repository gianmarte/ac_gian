var gulp = require('gulp');

// gulp connect implements both http server for static files and livereload in the browser
gulp.task('connect', function()
{
	var nconf = require('nconf')
	,	fs = require('fs')
	,	PluginError = require('plugin-error')
	,	https = require('https')
	,	cors = require('cors')
	,	express = require('express')
	,	livereload = require('livereload')
	,	path = require('path')
	;

	var db_config = nconf.get('dbConfig');

	var app = express();
	app.use(cors({origin: true}));
	app.use('/', express.static(nconf.get('folders:local')));

	//setup secure server for scis
	if(nconf.get('credentials:is_scis'))
	{
		db_config.https = true;

		var keyfile = process.env[db_config.key] || db_config.key;
		var certfile = process.env[db_config.cert] || db_config.cert;

		if(!keyfile || !certfile)
		{
			throw new PluginError('Https Certificate and/or Certificate Key Not Found.',
				'Please check the paths or environment variables as registered in: gulp/config/config.json file.\n' +
				'\tConfiguration variables: dbConfig->key and dbConfig->cert. Thank you.');
		}

		db_config.key = fs.readFileSync(keyfile, 'utf8')
		db_config.cert = fs.readFileSync(certfile, 'utf8')

		var server = https.createServer(db_config, app);
		server.listen(db_config.port);

	} else {
		//setup http server for sca/scs
		app.listen(db_config.port);
	}

	//setup livereload
	var lrserver = livereload.createServer();
	lrserver.watch(path.join(process.gulp_init_cwd, nconf.get('folders:local')));
});
