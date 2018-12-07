var gulp = require('gulp')
,	nconf = require('nconf')
;

nconf.argv(
	{
		'preserveManifest': {
			alias: 'preserve-manifest'
		,	describe: '--prserve-manifest Do not automatically update the manifest.json file.'
		,	demand: false
		}
	}
);

function validate(cb)
{
	var validate_helper = require('../extension-mechanism/local-tasks/validate-manifest');

	return validate_helper.validateManifests(cb);
}

var validate_dep = nconf.get('preserveManifest') ? [] : ['update-manifest'];
/**
* Validates the manifest file.
* @task {validate}
* @group {Utility tasks}
*/
gulp.task('validate', [], validate);
gulp.task('update-validate', validate_dep, validate);

module.exports = {
	validate: validate
};
