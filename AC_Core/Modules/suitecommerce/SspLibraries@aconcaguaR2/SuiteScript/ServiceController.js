/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/* global badRequestError */
// @module ssp.libraries
define(
	'ServiceController'
,	[
		'SC.EventWrapper'
	,	'Application'
	,	'SC.Models.Init'
	,	'ServiceController.Validations'

	,	'underscore'
	]
,	function (
		SCEventWrapper
	,	Application
	,	ModelsInit
	,	ServiceControllerValidations

	,	_
	)
{
	'use strict';

	// @class ServiceController Defines the controller used by all autogenerated services
	// @extends Transaction.Model
	return SCEventWrapper.extend({

		// @property {String} name Mandatory for all ssp-libraries model
		name: 'ServiceController'

		// @method getMethod Returns which http method is used by the request
		// @return {String}
	,	getMethod: function ()
		{
			return this.request.getMethod().toLowerCase();
		}

		// @property {ServiceController.Options} options The needed permissions, validations, etc, that are exposed so they're easily extendible
	,	options: {}

		// @method _deepObjectExtend Makes a deep copy of the objects passed as parameters
		// @parameter {Service.ValidationOptions.common} target Object literal with required validation common to all methods
		// @parameter {Service.ValidationOptions.<Object>} source Object literal with required validation specific to the http method used
		// @return {Service.ValidationOptions.Extended} Object with all the validation required for the current service
	,	_deepObjectExtend: function _deepObjectExtend (target, source)
		{
			for (var prop in source)
			{
				if (prop in target)
				{
					this._deepObjectExtend(target[prop], source[prop]);
				}
				else
				{
					target[prop] = source[prop];
				}
			}
			return target;
		}

		// @method getOptions Get the validation options related to the current service
		// @parameter {String} method The HTTP method used in the request
		// @return {ServiceController.options} Object with all the validation options of the current service
	,	getOptions: function (method)
		{
			return this._deepObjectExtend(this.options.common || {}, this.options[method] || {});
		}

		// @method handle Executes the function associated with the HTTP method in the proper ServiceController
		// @parameter {Service.ValidationOptions.Extended} validation_options Object literal with the validation options
		// @return {Void} This method doesn't return anything, but the functions it calls can throw errors if validation fails
	,	validateRequest: function (validation_options)
		{
			_.each(validation_options, function (validation_option, validation_name)
			{
				if (validation_option && _.isFunction(ServiceControllerValidations[validation_name]))
				{
					ServiceControllerValidations[validation_name](validation_option);
				}
			});
		}

		// @method handle Executes the function associated with the HTTP method in the proper ServiceController
		// @parameter {nlobjRequest} request
		// @parameter {nlobjResponse} response
		// @return {Void} The methods invoked on return doesn't return anything (but they can throw errors)
	,	handle: function (request, response)
		{
			this.request = request;
			this.response = response;
			this.method = this.getMethod();
			this.data = JSON.parse(this.request.getBody() || '{}');

			try
			{
				this.validateRequest(this.getOptions(this.method));

				if (_.isFunction(this[this.method]))
				{
					var result = this[this.method]();
					if(result)
					{
						return this.sendContent(result);
					}
				}
				else
				{
					return this.sendError(methodNotAllowedError);
				}
			}
			catch (e)
			{
				return this.sendError(e);
			}
		}

		// @method sendContent Writes the given content in the request object using the right headers, and content type
		// @param {String} content
		// @param {Object} options
		// @?ref Application.sendContent The present method replaces its namesake in Application, which is outdated
	,	sendContent: function (content, options)
		{
			// Default options
			options = _.extend({status: 200, cache: false}, options || {});

			// Triggers an event for you to know that there is content being sent
			Application.trigger('before:ServiceController.sendContent', content, options);

			// We set a custom status
			this.response.setHeader('Custom-Header-Status', parseInt(options.status, 10).toString());

			// The content type will be here
			var content_type = false;

			// If its a complex object we transform it into an string
			if (_.isArray(content) || _.isObject(content))
			{
				content_type = 'JSON';
				content = JSON.stringify( content );
			}

			// If you set a jsonp callback this will honor it
			if (this.request.getParameter('jsonp_callback'))
			{
				content_type = 'JAVASCRIPT';
				content = request.getParameter('jsonp_callback') + '(' + content + ');';
			}

			//Set the response cache option
			if (options.cache)
			{
				this.response.setCDNCacheable(options.cache);
			}

			// Content type was set so we send it
			content_type && this.response.setContentType(content_type);

			this.response.write(content);

			Application.trigger('after:ServiceController.sendContent', content, options);
		}

		// @method processError Builds an error object suitable to be sent back in the http response.
		// @param {nlobjError || Application.Error}
		// @returns {errorStatusCode:Number, errorCode:String, errorMessage:String} An error object suitable to send back in the http response.
		// @?ref Application.processError The present method replaces its namesake in Application, which is outdated
	,	processError: function (e)
		{
			var status = 500
			,	code = 'ERR_UNEXPECTED'
			,	message = 'error';

			if (e instanceof nlobjError)
			{
				code = e.getCode();
				message = e.getDetails();
				status = badRequestError.status;
			}
			else if (_.isObject(e) && !_.isUndefined(e.status))
			{
				status = e.status;
				code = e.code;
				message = e.message;
			}
			else
			{
				var error = nlapiCreateError(e);
				code = error.getCode();
				message = (error.getDetails() !== '') ? error.getDetails() : error.getCode();
			}

			if (code === 'INSUFFICIENT_PERMISSION')
			{
				status = forbiddenError.status;
				code = forbiddenError.code;
				message = forbiddenError.message;
			}

			var content = {
				errorStatusCode: parseInt(status,10).toString()
			,	errorCode: code
			,	errorMessage: message
			};

			if (e.errorDetails)
			{
				content.errorDetails = e.errorDetails;
			}

			if (e.messageParams)
			{
				content.errorMessageParams = e.messageParams;
			}

			return content;
		}

		// @method sendError Process the error and then writes it in the http response
		// @param {nlobjError || Application.Error} e
		// @?ref Application.sendError The present method replaces its namesake in Application, which is outdated
	,	sendError: function (e)
		{
			_.extend(e, {'serviceControllerName': this.name});

			console.log(this.name, e);

			// @event before:ServiceController.sendError
			Application.trigger('before:ServiceController.sendError', e);

			var content = this.processError(e)
			,	content_type = 'JSON';

			this.response.setHeader('Custom-Header-Status', content.errorStatusCode);

			if (this.request.getParameter('jsonp_callback'))
			{
				content_type = 'JAVASCRIPT';
				content = this.request.getParameter('jsonp_callback') + '(' + JSON.stringify(content) + ');';
			}
			else
			{
				content = JSON.stringify(content);
			}

			this.response.setContentType(content_type);

			this.response.write(content);

			// @event after:ServiceController.sendError
			Application.trigger('after:ServiceController.sendError', e);
		}
	});
});