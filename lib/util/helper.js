/**
 * @module
 * @private
 * @author Özüm Eldoğan
 */
/*jslint node: true */

"use strict";

var lodash      = require('lodash');
var joi         = require('joi');
var util        = require('util');
var logger      = require('./logger.js');
var inflection  = require('inflection');

/**
 * @type {object.<object, object>}
 * @private
 */
var objectInternal = new (require('weakmap'))();    // Shim.    Use objects as key of hash without strong reference.
//var objectInternal = new WeakMap;                   // Native.  Use objects as key of hash without strong reference.

/**
 * Gets/sets internal properties of an object by storing each object's internal values to private variable.
 * This private variable uses object itself as key. (Similar to Perl).
 * @private
 * @param object - Used as key of the storage array.
 * @returns {objectInternal}
 */
function internal(object) {
    if (!objectInternal.has(object)) { objectInternal.set(object, {}); }
    return objectInternal.get(object);
}

module.exports  = {};

/**
 * @callback objectCallback
 * @param {Object} object - Object
 * @private
 */

/**
 * @callback filterCallback
 * @param {*} value - Value to filter
 * @private
 */


/**
 * Fabricates standard accessor methods of object.name, object.type etc...
 * @private
 * @param attribute
 * @returns {Function}
 */
module.exports.accessor = function accessor(attribute) {
    if (joi.validate(attribute, joi.string().required()).error) { throw new Error('attribute is required and expected as string, but got: ' + attribute); }
    /**
     * Gets and sets value of an attribute.
     * If new value is given it sets the attribute's value to new value and return it.
     * If no value is given it gets old value of the attribute and returns it.
     * @function
     * @private
     * @param {*} [value] - Value to set attributes' new value.
     * @returns {*} - New value of the attribute
     */
    return function (value) {
        if (arguments.length > 0) {
            internal(this).attributes[attribute] = value;
            return value;
        }
        return internal(this).attributes[attribute];
    };
};

/**
 * Fabricates and returns iterator function.
 * @private
 * @param {string} attribute - Name of the internal attribute to iterate
 * @returns {Function}
 */
module.exports.objectsByName = function objectsByName(attribute) {
    if (joi.validate(attribute, joi.string().required()).error) { throw new Error('attribute is required and expected as string, but got: ' + attribute); }
    /**
     * Iterates given object collection. If callback is provided, it is executed for each object
     * and passed error and object as parameter. If no callback is provided, returns a plain Object.
     * Plain object keys are names of objects and values are requested objects.
     * @private
     * @param {array.<Object> | Object.<string, Object>} collection - Column collection as array or plain Object.  Keys are names, values are {@link Column} objects.
     * @param {objectCallback} [callback] - Callback to be executed for each column.
     * @returns {Object.<string, Object>}
     */
    return function (callback) {
        var objects = {},
            collection = internal(this).attributes[attribute];

        if (lodash.isFunction(callback)) {
            lodash.forOwn(collection, callback);
        } else {
            lodash.forOwn(collection, function (obj) {
                objects[obj.name()] = obj;
            });
            return objects;
        }
    };
};

/**
 * Fabricates and returns iterator function.
 * @private
 * @param {string} attribute - Name of the internal attribute to iterate
 * @param {filterCallback} [filterCallback] - Callback to filter results. If returns true, object will be added to returned, if false object will be discarded
 * @returns {Function}
 */
module.exports.objectsByOrder = function objectsByOrder(attribute, filterCallback) {
    if (joi.validate(attribute, joi.string().required()).error) { throw new Error('attribute is required and expected as string, but got: ' + attribute); }
    /**
     * Iterates given collection. If callback is provided, it is executed for each object
     * and passed object as parameter. If no callback is provided, returns an array of objects.
     * @function
     * @private
     * @param {array.<Object> | Object.<string, Object>} collection - Object collection as array or plain Object. Keys are names, values are objects.
     * @param {objectCallback} [callback] - Callback to be executed for each object.
     * @returns {Array.<Object>}
     */
    return function (callback) {
        var objects = [],
            collection = lodash.isFunction(filterCallback) ? internal(this).attributes[attribute].filter(filterCallback, this) : internal(this).attributes[attribute];
            //collection = internal(this).attributes[attribute];

        if (lodash.isFunction(callback)) {
            lodash.forOwn(collection, callback);
        } else {
            lodash.forOwn(collection, function (obj) {
                objects.push(obj);
            });
            return objects;
        }
    };
};


/**
 * Fabricates and returns a function which adds object to other object's collection and returns newly created one.
 * @private
 * @param {string|undefined} attributeByName - Attribute name which contains collection for name based lookups.
 * @param {string|undefined} attributeByOrder - Attribute name which contains collection for order number based lookups (if exists).
 * @param {function} constructor - Constructor function reference to create class object from plain object.
 * @param {string} parentKey - Attribute name to access parent object. For example: 'column's parent key is 'table'
 * @returns {Function}
 */
module.exports.addObject = function addObject(attributeByName, attributeByOrder, constructor, parentKey) {
    var validation = joi.validate(arguments, {
        0: joi.string().required().label('Attribute for name'),
        1: joi.string().allow(null).label('Attribute for position'),
        2: joi.func().allow(null).label('Constructor function'),
        3: joi.string().label('Parent Key')
    }, { abortEarly: false, allowUnknown: false });
    if (validation.error) { throw new Error('Error in function arguments. ' + validation.error + '. Arguments: ' + util.inspect(arguments, { depth: null })); }

    /**
     * Adds object to other object's collection and returns newly created one.
     * @function
     * @private
     * @param {Object} args - Plain object or className class' object to add.
     * @returns {Object}
     */
    return function (args) {
        if (typeof args !== 'object') { throw new Error('args is required and must be type of plain object or same type with the object to be added.'); }
        //noinspection JSPotentiallyInvalidUsageOfThis
        var name, defaults = {}, newObject;
        if (attributeByName) {                                                                                  // Return if object already present
            name = (args.constructor.name !== 'Object') ? args.name() : args.name;                              // Get name based on object type.
            if (internal(this).attributes[attributeByName][name]) {
                return internal(this).attributes[attributeByName][name];
            }
        }
        defaults[parentKey] = this;                                                                             // Provide link to parent i.e. schema: this
        newObject = (args.constructor.name !== 'Object') ? args : constructor(lodash.defaults(args, defaults)); // If args is already desired class object use it, or create new one.
        if (attributeByName) {
            internal(this).attributes[attributeByName][newObject.name()] = newObject;                           // Add named object
        }
        if (attributeByOrder) {
            internal(this).attributes[attributeByOrder].push(newObject);                                        // Add positioned object
        }
        logger.debug('Added %s (%s): "%s".', inflection.transform(attributeByName,  ['singularize', 'capitalize']), newObject.constructor.name, newObject.fullName());
        return newObject;
    };
};


/**
 * Fabricates and returns a function which retrieves and returns given attribute in object's internal attributes for name and/or position parameter.
 * @private
 * @param {string} attributeByName - Attribute to look for name based search.
 * @param {string} attributeByPosition - Attribute to look for number based search.
 * @param {object} options - Options to alter generated function
 * @param {function} options.before - Function to call before getObject function executes.
 * @returns {Function}
 */
module.exports.getObject = function getObject(attributeByName, attributeByPosition, options) {
    var validation = joi.validate(arguments, joi.object().keys({
        0: joi.string().required().label('attributeByName'),
        1: joi.string().allow(null).label('attributeByPosition'),
        2: joi.object().keys({ before: joi.func() }).allow(null)
    }));
    if (validation.error) { throw new Error('Error in function arguments. ' + validation.error + '. Arguments:' + util.inspect(arguments, { depth: null })); }

    options = options || {};
    /**
     * Checks and return result if an object with given name or order number exists.
     * @function
     * @private
     * @param {string | integer} nameOrPos - Name or order number of the object
     * @returns {boolean}
     */
    return function (nameOrPos) {
        var resultObj, ivalidation;
        if (lodash.isFunction(options.before)) { options.before.call(this, nameOrPos); }
        ivalidation = joi.validate(arguments, joi.object().keys({
            0: (attributeByName && attributeByPosition) ? joi.alternatives().try(joi.number(), joi.string()).required().label('nameOrPos') : joi.string().required().label('nameOrPos')
        }));
        if (ivalidation.error) { throw new Error('Error in function arguments. ' + ivalidation.error + '\n' + util.inspect(arguments, { depth: null })); }
        resultObj = (lodash.isNumber(nameOrPos) && nameOrPos % 1 === 0 && attributeByPosition) ? internal(this).attributes[attributeByPosition][nameOrPos] : internal(this).attributes[attributeByName][nameOrPos];
        if (!resultObj) { //noinspection JSPotentiallyInvalidUsageOfThis
            throw new Error(this.constructor.name + '\'s Child Object "' + this.fullName() + '.' + nameOrPos + '" cannot be found in ' + attributeByName + '.');
        }
        return resultObj;
    };
};

/**
 * Fabricates and returns a function which checks existence of given attribute in object's internal attributes for name and/or position parameter.
 * @private
 * @param {string} attributeByName - Attribute to look for name based search.
 * @param {string} attributeByPosition - Attribute to look for number based search.
 * @returns {Function}
 */
module.exports.objectExist = function objectExist(attributeByName, attributeByPosition) {
    var validation = joi.validate(arguments, joi.object().keys({
        0: joi.string().required().label('attributeByName'),
        1: joi.string().allow(null).label('attributeByPosition')
    }));
    if (validation.error) { throw new Error('Error in function arguments. ' + validation.error + '. Arguments:' + util.inspect(arguments, { depth: null })); }

    /**
     * Checks and return true if an object with given name or order number exists.
     * @function
     * @private
     * @param {string | integer} nameOrPos - Name or order number of the object
     * @returns {boolean}
     */
    return function (nameOrPos) {
        var resultObj, ivalidation;
        ivalidation = joi.validate(arguments, joi.object().keys({
            0: (attributeByName && attributeByPosition) ? joi.alternatives().try(joi.number(), joi.string()).required().label('nameOrPos') : joi.string().required().label('nameOrPos')
        }));
        if (ivalidation.error) { throw new Error('Error in function arguments. ' + ivalidation.error + '\n' + util.inspect(arguments, { depth: null })); }
        resultObj = (lodash.isNumber(nameOrPos) && nameOrPos % 1 === 0 && attributeByPosition) ? internal(this).attributes[attributeByPosition][nameOrPos] : internal(this).attributes[attributeByName][nameOrPos];
        return resultObj ? true : false;
    };
};

/**
 * Fabricates and returns a function which gives full name of the object in database . notation. i.e. public.account.name
 * @returns {Function}
 */
module.exports.objectFullName = function objectFullName() {
       /**
     * Gets full name of the object in database . notation.
     * @function
     * @private
     * @returns {string} - Full name of object
     */
    return function () {
        /*jshint validthis:true */
        if (this.parent) {
            //noinspection JSPotentiallyInvalidUsageOfThis
            return this.parent().fullName() + '.' + this.name();
        }
        //noinspection JSPotentiallyInvalidUsageOfThis
        return this.name();
    };
};


module.exports.internal = internal; // Because internal function is also udes in this module, function cannot be assigned directly to modeule.exports.internal.