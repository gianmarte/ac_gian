/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/**
 * This component allows to interact with Site Management Tools. Right now it only allow CCT's implementers to register new CCT types when the application starts - see {@link CustomContentTypeBaseView} 
 * An instance of this component can obtained by calling `container.getComponent('CMS')`.
 * @extends BaseComponent
 * @hideconstructor
 * @global
 */
class CMSComponent extends BaseComponent {
    /**
     * Register a new CCT in the current application. CCTs implementer need to call this
     * @param {RegisterCustomContentType} cct Custom Content Type View constructor  TODO type?
     */
    registerCustomContentType (cct)
    {
        return null
    }
}

/**
 * @typedef {Object} RegisterCustomContentType
 * @property {String} id the id for the new CCT to register. Must be unique per account - domain. 
 * @property {typeof CustomContentTypeBaseView} the View class implementing this CCT. 
 */