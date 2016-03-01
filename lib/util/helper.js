'use strict';

const lodash  = require('lodash');
const jsonic  = require('jsonic');
const AMap    = require('./amap');
const ASet    = require('./aset');

const reJSON  = /\s*?\[pg\-structure]((.|[\s])+?)\[\/pg\-structure]\s*?/mi; // [JSON]{"key": "value"}[/PGEN]

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

/**
 * Strips given string from start of the source string.
 * @param   {string}            source  - Source string to be cleaned.
 * @param   {string}            strip   - String to delete from beginning of source string.
 * @returns {string}                    - Cleaned string.
 */
module.exports.stripPrefix = function stripPrefix(source, strip) {
    let rx = new RegExp('^' + strip + '[_\\s-]*');
    return source.replace(rx, '');
};

/**
 * Converts foreign key name to be used in a relationship. If string ends with '_id' or 'id', strips it (case insensitive).
 * Otherwise adds given prefix at the beginning of the string. company_id -> company, account -> related_account
 * @param   {string}    str              - Foreign key name.
 * @returns {string}                     - Name for the belongsTo relationship.
 */
module.exports.fkToRelationName = function fkToRelationName(str) {
    let prefix = 'related';

    // Transform ? company_id -> company : company -> related_company
    return (str.match(/_?id$/i)) ? str.replace(/_?id$/i, '') : `${prefix}_${str}`;
};

/**
 * Extracts JSON between `[JSON]` and `[/JSON]` tags, converts it to object and returns created object.
 * @param   {string} str    - String to extract JSON from.
 * @returns {Object}        - Object created from JSON.
 * @example
 * let meta = 'Description of table.[JSON]{"key": "value"}[/PGEN]'; // meta = { key: 'value' }
 */
module.exports.extractJSON = function extractJSON(str) {
    var json = reJSON.exec(str);
    return json ? jsonic(json[1]) : null;
};

/**
 * Replaces JSON between `[JSON]` and `[/JSON]` tags including tags.
 * @param   {string} str    - String to replace JSON part.
 * @returns {string}        - New string.
 */
module.exports.replaceJSON = function replaceJSON(str) {
    return typeof str === 'string' ? str.replace(reJSON, '') : str;
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

/**
 * Copies given attributes of an pg-structure object to another object and returns it.
 * @param   {Object}            data    - Data to serialize.
 * @param   {Array.<string>}    keys    - Keys to be serialized.
 * @returns {Object}                    - Serialized object.
 */
module.exports.serialize = function serialize(data, keys) {
    let result = {};

    for (let key of keys) {
        if (key === 'parent' || key === 'table') { continue; }

        result[key] = data[key];
    }

    return result;
};
