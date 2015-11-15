'use strict';

/**
 * The WeakMap object is a collection of key/value pairs in which the keys are weakly referenced. The keys must be
 * objects and the values can be arbitrary values. Keys of WeakMaps are of the type Object only. Primitive data types
 * as keys are not allowed (e.g. a Symbol can't be a WeakMap key). The key in a WeakMap is held weakly.
 * What this means is that, if there are no other strong references to the key, then the entire entry will be removed
 * from the WeakMap by the garbage collector.
 * @private
 */
var objectInternal = new WeakMap;

/**
 * Returns private entry for given key. If no value exists previously, creates an empty private object
 * and returns it.
 * @private
 * @param {Object} key          - Used as key of the storage.
 * @returns {*}                 - A private value.
 */
function get(key) {
    if (!objectInternal.has(key)) {
        objectInternal.set(key, { });
    }

    return objectInternal.get(key);
}

/**
 * Creates a private entry for given key, sets its value and returns it. If no value is provided throws an error.
 * @private
 * @param {Object} key          - Used as key of the storage.
 * @param {Object} value        - Value to store in private key.
 * @returns {objectInternal}    - private key.
 */
function set(key, value) {
    if (typeof value !== 'object') {
        throw new Error('Value is required.');
    }

    objectInternal.set(key, value);
    return objectInternal.get(key);
}

module.exports  = {
    get: get,
    set: set
};
