/**
 * @module helper
 * @private
 */
'use strict';
var internal    = require('./internal');
var lodash      = require('lodash');

/**
 * Fabricates and returns an accessor method for getting an object attribute.
 * Used to create standard accessor methods such as column.name, table.name etc...
 * @param {string} attribute    - Attribute name. Created accessor gets and returns this attribute of the object.
 * @returns {Function}          - Getter function for the given attribute.
 */
module.exports.createGetter = function createGetter(attribute) {
    /**
     * Gets and returns value of an attribute.
     * @function
     * @returns {*} - Value of the attribute
     */
    return function() {
        return internal.get(this).attributes[attribute];
    };
};

module.exports.createDBGetter = function createDBGetter() {
    return function DBGetter() {
        let _      = internal.get(this);
        let dbName = _.attributes.catalog;
        return _.registry.getCollection('db').by('fullCatalogName', dbName).object;
    };
};

module.exports.createSchemaGetter = function createSchemaGetter() {
    return function schemaGetter() {
        let _          = internal.get(this);
        let schemaName = _.attributes.catalog + '.' + _.attributes.schema;
        return _.registry.getCollection('schema').by('fullCatalogName', schemaName).object;
    };
};

/**
 * Returns a function. Returned function
 * * Retrieves the value of given attribute,
 * * Uses that value as a full catalog name reference,
 * * Returns object with that name from given collection.
 * @param {string} attributeName                - Attribute name to be used as a reference.
 * @param {string} collectionName               - Collection name to get target object.
 * @param {Object} [options]                    - Options
 * @param {string} [options.objectKey=object]   - Key name to get object.
 * @returns {Function}                          - Referenced object getter function.
 */
module.exports.createReferencedObjectGetter = function createReferencedObjectGetter(attributeName, collectionName, options) {
    options = options || {};
    let objectKey = options.objectKey || 'object';
    /**
     * Returns object from given collection with full catalog name equals to value stored in given attribute.
     * @returns {Object|null}   - Object from given collection with full catalog.
     * @example
     * let parent = createReferencedObjectGetter('parent', 'table');
     * let column = DB.get('public.account.surname');
     * let account = column.parent();   // Retrieves object from table collection of which fullCatalogName equals to this object's parent.
     */
    return function referencedObjectGetter() {
        let _ = internal.get(this);
        let fullCatalogName = _.attributes[attributeName];
        return _.registry.getCollection(collectionName).by('fullCatalogName', fullCatalogName)[objectKey] || null;
    };
};

/**
 * Searches a resultSet according to given filter and return results as an array. Filter object may contain `$this`
 * string which will converted to `this` object. See example below.
 * @param {string} collectionName                   - LokiJS resultSet name.
 * @param {Object} filter                           - Filter criteria.
 * @returns {array.<Object>}                        - Filtered objects.
 * @private
 * @example
 * var resultObjects = getFilteredObjects('column', { parent: '$this.fullCatalogName' }; // Converted to { parent: this.fullCatalogName }
 */
function getFilteredObjects(collectionName, filter) {
    let re = /\$this\.(.+)/;
    let resultSet = internal.get(this).registry.getCollection(collectionName).chain();

    for (let key in filter) {
        if (filter.hasOwnProperty(key)) {
            let condition = {};
            let thisAttribute = re.exec(filter[key]); // capture after '$this.'
            condition[key] = (thisAttribute) ? this[thisAttribute[1]] : filter[key]; // parent: '$this.name' => parent: this.name
            resultSet = resultSet.find(condition);
        }
    }

    return resultSet.simplesort('insertOrder').data();
}

/**
 * Returns a function which will search a collection according to given filter and return results as an array of objects.
 * @param {string} collectionName               - LokiJS collection name.
 * @param {Object} filter                       - Filter criteria.
 * @param {Object} [options]                    - Options
 * @param {string} [options.objectKey=object]   - Key name to get object.
 * @returns {Function}                          - Filtered object getter function.
 * @example
 * Object.defineProperty(Table.prototype, 'columns', { get: helper.createOrderedObjectsGetter('column', {parent: '$this.fullCatalogName'}), enumerable: false });
 */
module.exports.createOrderedObjectsGetter = function createOrderedObjectsGetter(collectionName, filter, options) {
    options = options || {};
    let objectKey = options.objectKey || 'object';

    /**
     * @param {Function} callback               - Callback to execute for each element.
     * @returns {Array.<Object>|null|undefined} - If no callback is provided returns array of objects or null. Returns undefined if callback is provided.
     */
    return function orderedObjectsGetter(callback) {
        // Return objects instead of Loki DB documents.
        let result = getFilteredObjects.call(this, collectionName, filter).map((value) => { return value[objectKey]; });
        if (result.length === 0 && !callback) return null;
        if (!callback) return result;
        for (let i = 0; i < result.length; i++) {
            callback(result[i], i, result);
        }
    };
};

/**
 * Returns a function which will search a collection according to given filter and return results as a key, value object.
 * @param {string} collectionName               - LokiJS collection name.
 * @param {Object} filter                       - Filter criteria.
 * @param {Object} [options]                    - Options
 * @param {string} [options.objectKey=object]   - Key name to get object.
 * @param {string} [options.nameAttribute=name] - Which attribute is used for keys of resulting key, value object.
 * @returns {Function}                          - Filtered object getter function.
 * @example
 * Object.defineProperty(Table.prototype, 'columnsByName', { get: helper.createNamedObjectsGetter('column', {parent: '$this.fullCatalogName'}), enumerable: true });
 */
module.exports.createNamedObjectsGetter = function createNamedObjectsGetter(collectionName, filter, options) {
    options = options || {};
    let objectKey       = options.nameAttribute || 'object';
    let nameAttribute   = options.nameAttribute || 'name';

    return function createNamedObjectsGetter() {
        let result = {};
        let objects = getFilteredObjects.call(this, collectionName, filter);
        objects.forEach((value) => { result[value[nameAttribute]] = value[objectKey]; });
        if (objects.length === 0) return null;
        return result;
    };
};

/**
 * Returns object with given name or order number from given collection if it exists.
 * @param {string}          collectionName      - Collection name to get child from.
 * @param {string|number}   key                 - Name or order number of the child.
 * @returns {Object|undefined}                  - Requested child object.
 * @private;
 */
function getOrderedOrNamedObject(collectionName, key) {
    if (key === undefined || key === null) throw new Error('Key is required');
    let criteria = { parent: this.fullCatalogName };

    if (lodash.isNumber(key) && key % 1 === 0) criteria.insertOrder = key;
    else criteria.name = key;
    var result = internal.get(this).registry.getCollection(collectionName).findObject(criteria);
    return result ? result.object : undefined;
}

/**
 * Fabricates and returns a function which returns an object from given collection.
 * @param {string}      collectionName          - Base of collection names.
 * @returns {Function}                          - Object getter function.
 */
module.exports.createChildGetter = function createChildGetter(collectionName) {
    /**
     * Returns child object with given name or order number.
     * @function
     * @private
     * @param {string|number} key   - Name or order number of the child
     * @returns {Object|undefined}  - Child object. `undefined` if no child found.
     */
    return function childGetter(key) {
        return getOrderedOrNamedObject.call(this, collectionName, key);
    };
};

/**
 * Fabricates and returns a function which checks existence of given attribute in object's internal collections for name and/or position parameter.
 * @param {string}      collectionName          - Base of collection names.
 * @returns {Function}                          - Function to check if given object exists in collection.
 */
module.exports.createChildExistsMethod = function createChildExistsMethod(collectionName) {
    /**
     * Checks and return true if a child with given name or order number exists.
     * @function
     * @private
     * @param {string|number} key   - Name or order number of the child
     * @returns {boolean}           -
     */
    return function childExistsMethod(key) {
        return getOrderedOrNamedObject.call(this, collectionName, key) ? true : false;
    };
};
