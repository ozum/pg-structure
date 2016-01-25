
/**
 * @class Map
 * @see {@link https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Map Mozilla Map Documentation}
 * @Classdesc The Map object is a simple key/value map. Any value (both objects and primitive values) may be used as either a key
 * or a value.
 * @example
 * // It may be more elegant to use destructuring with Babel or when available in node.js.
 * for (let pair of db.schemas.get('public').tables) {
 *     let tableName = pair[0];
 *     let table     = pair[1];
 * }
 */

/**
 * @name Map#size
 * @type {number}
 * @description The number of key/value pairs in the Map object.
 * @example
 * let size = db.get('public.account').columns.size;
 */

/**
 * Returns a new Iterator object that contains an array of [key, value] for each element in the Map object in insertion order.
 * @method Map#entries
 * @returns {Iterator}
 * @example
 * let column = db.get('public.account').columns.get('name');
 */

/**
 * Calls callbackFn once for each key-value pair present in the Map object, in insertion order.
 * If a thisArg parameter is provided to forEach, it will be used as the this value for each callback.
 * @method Map#forEach
 * @param   {Function}  callbackFn  - Function to call for each pair.
 * @param   {Object}    this        - Context.
 */

/**
 * Returns the value associated to the key, or undefined if there is none.
 * @method Map#get
 * @param   {string} name   - Name of the item to get.
 * @returns {*}             - Value associated to key.
 * @example
 * let column = db.get('public.account').columns.get('name');
 */

/**
 * Returns a boolean asserting whether a value has been associated to the key in the Map object or not.
 * @method Map#has
 * @param   {string} name   - Name of the item to test.
 * @returns {boolean}       - `true` if key exists.
 * @example
 * let exists = db.schemas.has('public'); // true
 */

/**
 * Returns a new Iterator object that contains the keys for each element in the Map object in insertion order.
 * @method Map#keys
 * @returns {Iterator}
 * @example
 * for (let tableName of db.schemas.get('public').tables.keys()) {
 *     console.log(tableName);
 * }
 *
 * let tableNames = [...db.schemas.get('public').tables.keys()]; // Table names as an array.
 */

/**
 * Returns a new Iterator object that contains the values for each element in the Map object in insertion order.
 * @method Map#values
 * @returns {Iterator}
 * @example
 * for (let table of db.schemas.get('public').tables.values()) {
 *     console.log(table.name);
 * }
 *
 * let tables = [...db.schemas.get('public').tables.values()]; // Table objects as an array.
 */