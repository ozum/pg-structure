'use strict';

let AMap        = require('./util/amap');
let helper      = require('./util/helper');
let _data       = new WeakMap();
let attributes  = [['name', 'fullName', 'fullCatalogName'], 'schemas', 'options'];

/**
 * Class which represent a database. Provides attributes and methods for details of the database.
 */
class Db {
    /**
     * @description Constructor function. You don't need to call constructor manually. pg-structure handles this.
     * @param   {Object}    args                    - Attributes of the {@link Database} instance to be created.
     * @param   {Object}    args.name               - Name of the {@link Db} instance.
     * @param   {Object}    options                 - Options to modify behaviour of classes.
     * @param   {boolean}   [options.cache=true]    - Use cache to memoize calculated results.
     * @returns {Db}                                - Created {@link Db} instance.
     */
    constructor(args, options) {
        if (!args.name) { throw new Error('Database name is required.'); }
        let _ = _data.set(this, {}).get(this);

        _.options   = options;
        _.name      = args.name;
        _.schemas   = new AMap();
    }

    serialize() {
        let _ = _data.get(this);

        let result = helper.serialize(_, ['options', 'name']);
        result.schemas = Array.from(_.schemas).map(i => i[1].serialize());
        return result;
    }

}

helper.createAccessors(_data, Db, attributes);


// ATTRIBUTES

/**
 * @name Db#name
 * @type {string}
 * @readonly
 * @description Name of the {@link Database}.
 */

/**
 * @name Db#fullName
 * @type {string}
 * @readonly
 * @description Full name of the {@link Database} with (.) notation. Since database does not have a parent this equals database name.
 */


/**
 * @name Db#fullCatalogName
 * @type {string}
 * @readonly
 * @description Full name of the {@link Database} with (.) notation including catalog name. Since database does not have a parent this equals database name.
 */

/**
 * @name Db#options
 * @type {Object}
 * @readonly
 * @description Options passed to during initialization.
 */

/**
 * @name Db#schemas
 * @type {Map.<Schema>}
 * @readonly
 * @description All {@link Schema} instances in the database as a {@link Map}. Schemas are ordered by their name.
 * @see {@link Map}
 * @example
 * let isAvailable  = db.schemas.has('another_schema');
 * let schemaNames  = Array.from(db.schemas.keys());           // Use spread operator to get schema names as an array.
 * let public       = db.schemas.get('public');
 * let name         = public.name;
 *
 * for (let schema of db.schemas.values()) {
 *     console.log(schema.name);
 * }
 *
 * for (let [name, schema] of db.schemas) {
 *     console.log(name, schema.name);
 * }
 */

// METHODS

/**
 * Returns {@link Schema}, {@link Table} or {@link Column} on given path relative to {@link Db}. Path should be in dot (.) notation.
 * @method Db#get
 * @param   {string}                        path    - Path of the requested item in dot (.) notation such as 'public.contact'
 * @returns {Schema|Table|Column|undefined}         - Requested item.
 * @example
 * var schema = db.get('public'),              // Returns public schema.
 *     table  = db.get('public.contact'),      // Returns contact table in public schema.
 *     column = db.get('public.contact.name'); // Returns name column of the contact table in public schema.
 */
Object.defineProperty(Db.prototype, 'get', { value:
    function(path) {
        let parts   = path.split('.');
        let schema  = parts.shift();
        return parts.length === 0 ? this.schemas.get(schema) : this.schemas.get(schema).get(parts.join('.'));
    }, enumerable: false });

module.exports = Db;
