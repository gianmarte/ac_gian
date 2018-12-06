var path = require('path')
,	fs = require('fs')
,	log = require('fancy-log')
,	c = require('ansi-colors')
,	nconf = require('nconf')
,	_ = require('underscore')
;

var manifest_manager = require('./manifest-manager');

'use strict';

function registerExtrasExtensions()
{
	var extensions_path = nconf.get('folders:source:extras_path')
	,	ext_path
	,	manifest_path
	;

	_.each(fs.readdirSync(extensions_path), function(vendor_folder)
	{
		vendor_folder = path.join(extensions_path, vendor_folder);

		_.each(fs.readdirSync(vendor_folder), function(ext_folder)
		{
			ext_path = path.join(vendor_folder, ext_folder);

			if(fs.statSync(ext_path).isDirectory())
			{
				try
				{
					_registerManifest(ext_path);
				}
				catch(error)
				{
					log(c.yellow(ext_path + '/manifest.json does not exist. Ignoring ' + ext_path));
				}
			}
		});
	});
}

function registerWorkspaceExtensions()
{
	var new_extensions_path = []
	,	extensions_path = nconf.get('folders:source:source_path')
	,	ext_path
	,	manifest_path
	;

	_.each(fs.readdirSync(extensions_path), function(ext_folder)
	{
		var is_theme_extra_dir = nconf.get('folders:source:extras_path') &&
									nconf.get('folders:source:extras_path').includes(ext_folder);

		ext_path = path.join(extensions_path, ext_folder);

		if(!is_theme_extra_dir && fs.statSync(ext_path).isDirectory())
		{
			try
			{
				_registerManifest(ext_path);
				new_extensions_path.push(ext_path);
			}
			catch(error)
			{
				log(c.yellow(ext_path + '/manifest.json does not exist. Ignoring ' + ext_path));
			}
		}
	});

	return new_extensions_path;
}

function _registerManifest(manifest_path)
{
	manifest_manager.addManifest(path.join(manifest_path, 'manifest.json'));
}

function _isSkipCompilation()
{
	return (process.argv && (process.argv.indexOf('--skip-compilation') !== -1 || process.argv.indexOf('--source')));
}

module.exports = function()
{
	var app_manifest_path = path.join(nconf.get('folders:application_manifest'), 'application_manifest.json')
	,	is_scis = nconf.get('credentials:is_scis');

	if(fs.existsSync(app_manifest_path))
	{
		nconf.set('application:application_manifest', JSON.parse(fs.readFileSync(app_manifest_path).toString()));
	}

	
	//set up the manifest manager
	if(!nconf.get('credentials')) {

		//no skip compilation option, or you are in theme and is required to do a fetch
		if(!_isSkipCompilation() || !nconf.get('extensionMode')) {
			var task_name = nconf.get('extensionMode') ? 'extension' : 'theme';
			log(c.red('You need to run gulp ' + task_name + ':fetch before to get the initial setup files. Aborting. '));
			process.exit(1);
		}
	}

	_.each(nconf.get('folders:source'), function(src_folder)
	{
		if(!fs.existsSync(src_folder))
		{
			var message = 'The source path "' + src_folder + '" does not exist. You need to execute ';

			if(!_isSkipCompilation())
			{
				if(nconf.get('extensionMode'))
				{					
					log(c.red(message + ' "gulp extension:fetch" first.'));
					process.exit(1);					
				}
				else
				{
					log(c.red(message + ' "gulp theme:fetch" first.'));
					process.exit(1);
				}
			}
		}
	});

	//add all the manfiests
	if(!is_scis)
	{
		if(nconf.get('folders:theme_path'))
		{
			var theme_path = path.join(nconf.get('folders:theme_path'));
			if(fs.statSync(theme_path).isDirectory())
			{
				manifest_manager.addManifest(path.join(theme_path, 'manifest.json'));
			}	
		}
		
	}

	if(!nconf.get('extensionMode'))
	{
		registerExtrasExtensions()

		//run overrides task only in the theme tools
		var overrides = require('./overrides');
		overrides.updateOverrides();
	}
	else
	{
		var new_extensions_path = registerWorkspaceExtensions()

		//update extension paths
		new_extensions_path = new_extensions_path.map((path) => path.replace('\\', '/'));
		var config_content = JSON.parse(fs.readFileSync(nconf.get('config_path')).toString());
		nconf.set('folders:extensions_path', new_extensions_path);
		config_content.folders = nconf.get('folders');

		fs.writeFileSync(nconf.get('config_path'), JSON.stringify(config_content, null, 4));
	}

	return manifest_manager;
};