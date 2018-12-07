/* jshint node: true */
'use strict'

var gulp = require('gulp');
var path = require('path');
var nconf = require('nconf');

var outputPath = nconf.get('styleguideConfig:output');

gulp.task('styleguide:generate', ['sass-prepare'], function() {

  var styleguide = require('sc5-styleguide');
  var sassGlobs = path.join(nconf.get('folders:theme_path'), 'Modules', 'BaseSassStyles@*', '**/*.scss');

  return gulp.src(sassGlobs)
    .pipe(styleguide.generate({
        title: 'SuiteCommerce - Styleguide',
        server: true,
        port: nconf.get('styleguideConfig:port'),
        rootPath: outputPath,
        overviewPath: './gulp/library/sc5-styleguide/SUITECOMMERCE-STYLEGUIDE.md',
        readOnly: true,
        disableEncapsulation: true
      }))

    .pipe(gulp.dest(outputPath));
});

gulp.task('styleguide:applystyles', ['sass'], function() {

  var sass = require('gulp-sass');
  var styleguide = require('sc5-styleguide');
  
  return gulp.src(path.join(nconf.get('folders:output'), 'css', 'myaccount.css'))
    .pipe(sass({
      errLogToConsole: true
    }))
    .pipe(styleguide.applyStyles())
    .pipe(gulp.dest(outputPath));
});

if(nconf.get('extensionMode'))
{
  /**
  * Executed as "gulp extension:local styleguide".
  * Generates a styleguide page at localhost:3000.
  * @task {styleguide}
  * @order {7}
  */
  gulp.task('styleguide', ['styleguide:generate', 'styleguide:applystyles']);
}
else
{
  /**
  * Executed as "gulp theme:local styleguide".
  * Generates a styleguide page at localhost:3000.
  * @task {styleguide}
  * @order {7}
  */
  gulp.task('styleguide', ['styleguide:generate', 'styleguide:applystyles']);
}

