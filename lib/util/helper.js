'use strict';

let AMap    = require('./amap');
let ASet    = require('./aset');
let lodash  = require('lodash');

module.exports.createAccessors = function createAccessors(weakMap, Constructor, attributes) {
    for (let attributeList of attributes) {
        if (!Array.isArray(attributeList)) { attributeList = [attributeList]; }

        for (let attribute of attributeList) {
            Object.defineProperty(Constructor.prototype, attribute, { enumerable: true, get: function() {
                return weakMap.get(this)[attributeList[0]];
            } });
        }
    }
};

module.exports.sortMapPairsByKey = function sortMapPairsByKey(a, b) {
    if (a[0] < b[0]) { return -1; }

    if (a[0] > b[0]) { return 1; }

    return 0;
};

/**
 * Returns a function which does following jobs:
 * * If cache is in use (default), calculates, caches and returns requested data.
 * * In subsequent requests returns cached data.
 * * Compares cached data's version against source data's version and if it is expired recalculates it.
 * * If cache is not in use, directly returns result.
 * @param {Object}      args                    - Configuration
 * @param {WeakMap}     args.data               - Variable which holds class private data as weakmap.
 * @param {String}      args.cacheKey           - Cache key to retrieve and store result.
 * @param {String}      args.calculatedFrom     - Source of data. This is used to determine if cache is expired by comparing it's version.
 * @param {Function}    args.calculator         - Actual function which calculates result. Called as method of it's class so `this` object is set.
 * @param {Object}      [args.collectionClass]  - Collection class to store result. i.e. CMap, CSet, ConstraintMap etc.
 * @returns {Function}                          - Function for retrieving data.
 * @private
 */
module.exports.cachedValue = function cachedValue(args) {
    let BaseCollectionClass = args.collectionClass ?
        (args.collectionClass.prototype instanceof Map ? AMap : ASet) : null;

    return function() {
        let _ = args.data.get(this);

        if (!this.db.options.cache) {
            let result = args.calculator.call(this);
            return BaseCollectionClass ? new BaseCollectionClass(result) : result;
        }

        let attribute       = _[args.cacheKey];
        let cacheVersion    = attribute === undefined ? -1 : attribute.cacheVersion || _[args.cacheKey + 'CacheVersion'];
        let calculatedFrom  = lodash.get(this, args.calculatedFrom);

        if (!attribute || calculatedFrom.version > cacheVersion) {
            let result  = args.calculator.call(this);

            if (args.collectionClass) {
                let opts    = { version: attribute ? attribute.version + 1 : 0, cacheVersion: calculatedFrom.version };
                _[args.cacheKey] = new args.collectionClass(result, opts);
            } else {
                _[args.cacheKey + 'CacheVersion'] = calculatedFrom.version;
                _[args.cacheKey] = result;
            }
        }

        return _[args.cacheKey];
    };
};

module.exports.serialize = function serialize(data, keys) {
    let result = {};

    for (let key of keys) {
        if (key === 'parent' || key === 'table') { continue; }

        result[key] = data[key];
    }

    return result;
};
