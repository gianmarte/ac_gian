/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @ts-check

/**
 * Manager of components. Extensions can get components implementations and register new component 
 * classes. A component is referenced always by its name. 
 * @class
 * @hideconstructor
 * @global
 */
class BackendComponentContainer {
	constructor() {}

	/**
	 * Allows to register a new component into the running application it also seals the component, so 
	 * as to not add new properties or messing up with the available components APIs.
	 * @param {BackendBaseComponent} component Component to be registered
	 * @return {void}
	 */
	registerComponent(component) {}

	/**
	 * Returns the requested component based on its name if there is no component with that name registered in this container
	 * @param {String} component_name
	 * @return {BackendBaseComponent}
	 */
	getComponent(component_name) {
		return null
	}
}
