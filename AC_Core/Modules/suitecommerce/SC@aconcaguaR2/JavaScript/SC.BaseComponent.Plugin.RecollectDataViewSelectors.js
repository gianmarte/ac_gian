/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/*
	@module SC
	@class SC.BaseComponent.Plugin.RecollectDataViewSelectors

	Loads the recollectDataViewSelectors plugin that iterates through all the tags that contains data-cms in the
	template string.
*/
define('SC.BaseComponent.Plugin.RecollectDataViewSelectors'
,	[
		'underscore'
	,	'SC.BaseComponent.ChildViewsComponent'
	]
,	function (
		_
	,	SCBaseComponentChildViewsComponent
	)
{
	'use strict';

	return function SCBaseComponentPluginRecollectDataViewSelectors ()
	{
		return {
			name: 'recollectDataViewSelectors'
		,	priority: 10
		,	execute: function (tmpl_str, view)
			{
				var regex = /<[^>]*(data-view)=\"([^"\s]+)\"[^>]*>/g
				,	regexCMS = /<[^>]*(data-cms-area)=\"([^"\s]+)\"[^>]*>/g
				,	match = regex.exec(tmpl_str)
				,	matchCMS = regexCMS.exec(tmpl_str)
				,	selectors_on_ui = []
				,	root_component_id = view.attributes && view.attributes['data-root-component-id'] || ''
				,	component_id = view.constructor.componentId;

				while (match !== null)
				{
					selectors_on_ui.push(match[2]);
					match = regex.exec(tmpl_str);
				}

				while (matchCMS !== null)
				{
					selectors_on_ui.push('cms:' + matchCMS[2]);
					matchCMS = regexCMS.exec(tmpl_str);
				}

				var components = ['Backbone.View', root_component_id, component_id];

				if (selectors_on_ui.length > 0)
				{
					_.each(components, function(component)
					{
						if (component)
						{
							var modifiedChildViews = SCBaseComponentChildViewsComponent.getModifiedChildViews(component, selectors_on_ui);

							view.addChildViewInstances(modifiedChildViews.addChildViews, false);

							_.each(modifiedChildViews.setChildViewsIndex, function(child_views, data_view)
							{
								_.each(child_views, function(child_view_index, child_view_id)
								{
									view.setChildViewIndex(data_view, child_view_id, child_view_index, false);
								});
							});

							_.each(modifiedChildViews.removeChildViews, function(child_views, data_view)
							{
								_.each(child_views, function(value, child_view_id)
								{
									view.removeChildViewInstance(data_view, child_view_id, true);
								});
							});
						}
					});
				}

				return tmpl_str;
			}
		};
	};
});
