/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module SC
define('SC.BaseComponent.ChildViewsComponent'
,	[
		'underscore'
	]
,	function (
		_
	)
{
	'use strict';

	var root_component_add_map = {};
	var root_component_set_map = {};
	var root_component_remove_map = {};

	// window.component = { add: root_component_add_map, set: root_component_set_map, rem: root_component_remove_map };

	return {

		_normalizeChildViews: function _normalizeChildViews(child_views)
		{
			_.each(child_views, function(view_name, container_name)
			{
				if (_.isFunction(view_name))
				{
					var childViewConstructor = view_name;

					child_views[container_name] = {};

					child_views[container_name][container_name] =	{
						childViewIndex: 10
					,	childViewIsExternal: true
					,	childViewConstructor: childViewConstructor
				   };
				}
				else
				{
					_.each(view_name, function(child_view)
					{
						child_view.childViewIsExternal = true;
					});
				}
			});

			return child_views;
		}

	,	addChildViews: function addChildViews (component_id, child_views)
		{
			child_views = this._normalizeChildViews(child_views || {});

			if (!root_component_add_map[component_id])
			{
				root_component_add_map[component_id] = {};
			}

			_.each(child_views, function(views, data_view)
			{
				if (!root_component_add_map[component_id][data_view])
				{
					root_component_add_map[component_id][data_view] = {};
				}

				_.each(views, function(generator, view_id)
				{
					root_component_add_map[component_id][data_view][view_id] = generator;
				});
			});
		}

	,	removeChildView: function removeChildView (component_id, container_name, view_name)
		{
			root_component_remove_map[component_id] = root_component_remove_map[component_id] || {};
			root_component_remove_map[component_id][container_name] = root_component_remove_map[component_id][container_name] || {};
			root_component_remove_map[component_id][container_name][view_name] = true;
		}

	,	setChildViewIndex: function setChildViewIndex(component_id, container_name, view_name, index)
		{
			if (!root_component_set_map[component_id])
			{
				root_component_set_map[component_id] = {};
			}

			if (!root_component_set_map[component_id][container_name])
			{
				root_component_set_map[component_id][container_name] = {};
			}

			root_component_set_map[component_id][container_name][view_name] = index;
		}

	,	_getChildViews: function _getChildViews(map_structure, component_id, data_views)
		{
			if (map_structure[component_id])
			{
				return _.pick(map_structure[component_id], data_views);
			}

			return {};
		}

	,	getModifiedChildViews: function getModifiedChildViews (component_id, data_views)
		{
			return {
				'addChildViews': this._getChildViews(root_component_add_map, component_id, data_views)
			,	'setChildViewsIndex': this._getChildViews(root_component_set_map, component_id, data_views)
			,	'removeChildViews': this._getChildViews(root_component_remove_map, component_id, data_views)
			};
		}
	};
});
