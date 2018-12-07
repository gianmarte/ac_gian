// @module Gian.TestExtension.TestExtensionModule
define('Gian.TestExtension.TestExtensionModule.View'
,	[
		'gian_testextension_testextensionmodule.tpl'
	,	'Utils'
	,	'Backbone'
	,	'jQuery'
	,	'underscore'
	]
,	function (
		gian_testextension_testextensionmodule_tpl
	,	Utils
	,	Backbone
	,	jQuery
	,	_
	)
{
	'use strict';

	// @class Gian.TestExtension.TestExtensionModule.View @extends Backbone.View
	return Backbone.View.extend({

		template: gian_testextension_testextensionmodule_tpl

	,	initialize: function (options) {

			/*  Uncomment to test backend communication with an example service 
				(you'll need to deploy and activate the extension first)
			*/
			this.message = '';
			// var service_url = Utils.getAbsoluteUrl(getExtensionAssetsPath('services/TestExtensionModule.Service.ss'));

			// jQuery.get(service_url)
			// .then((result) => {

			// 	this.message = result;
			// 	this.render();
			// });
		}

	,	events: {
		}

	,	bindings: {
		}

	, 	childViews: {
			
		}

		//@method getContext @return Gian.TestExtension.TestExtensionModule.View.Context
	,	getContext: function getContext()
		{
			//@class Gian.TestExtension.TestExtensionModule.View.Context
			this.message = this.message || 'Hello World!!'
			return {
				message: this.message
			};
		}
	});
});