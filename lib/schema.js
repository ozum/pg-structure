'use strict';

let AMap        = require('./util/amap');
let helper      = require('./util/helper');
let _data       = new WeakMap();
let attributes  = [['name', 'fullName'], ['parent', 'db'], 'tables'];

/**
 * Class which represent a PostgreSQL schema. Provides attributes and methods for details of the database.
 */
class Schema {
    /**
     * @description Constructor function. You don't need to call constructor manually. pg-structure handles this.
     * @param   {Object}    args        - Attributes of the {@link Schema} instance to be created.
     * @param   {DB}        args.parent - Parent {@link DB} of the Schema.
     * @param   {string}    args.name   - Name of the Schema.
     * @returns {Schema}                - Created {@link Schema} instance.
     */
    constructor(args) {
        if (!args.name) { throw new Error('Schema name is required.'); }

        let _ = _data.set(this, {}).get(this);

        _.name                  = args.name;
        _.parent                = args.parent;

        _.tables                = new AMap();
    }

    serialize() {
        let _ = _data.get(this);

        let result = helper.serialize(_, ['name']);
        result.tables = Array.from(_.tables).map(i => i[1].serialize());
        return result;
    }
}

helper.createAccessors(_data, Schema, attributes);

function getFullCatalogName() {
    let _ = _data.get(this);
    return _.parent.name + '.' + _.name;
}

// ATTRIBUTES

/**
 * @name Schema#name
 * @type {string}
 * @readonly
 * @description Name of the schema.
 */

/**
 * @name Schema#fullName
 * @type {string}
 * @readonly
 * @description Full name of the {@link Schema}. For schema it is equal to schema name.
 * @example
 * var fullName = schema.fullName; // public
 */

/**
 * @name Schema#fullCatalogName
 * @type {string}
 * @readonly
 * @description Full name of the {@link Schema} with (.) notation including catalog name.
 * @example
 * var fullCatalogName = schema.fullCatalogName; // crm.public
 */
Object.defineProperty(Schema.prototype, 'fullCatalogName', { enumerable: true, get: getFullCatalogName });

/**
 * @name Schema#db
 * @type {DB}
 * @readonly
 * @description {@link DB} this schema belongs to.
 * @see Aliases {@link Schema#parent parent}
 * @example
 * var db = schema.db; // DB instance
 */

/**
 * @name Schema#parent
 * @type {DB}
 * @readonly
 * @description {@link DB} this schema belongs to.
 * @see Aliases {@link Schema#db db}
 * @example
 * var db = schema.parent; // DB instance
 */

/**
 * @name Schema#tables
 * @type {Map.<Table>}
 * @readonly
 * @description All {@link Table} instances of the schema as a {@link Map}. They are ordered by their name.
 * @see {@link Map}
 * @example
 * let isAvailable  = schema.tables.has('person');
 * let tableNames   = Array.from(schema.tables.keys());        // Use spread operator to get table names as an array.
 * let table        = schema.tables.get('account');
 * let name         = table.name;
 *
 * for (let table of schema.tables.values()) {
 *     console.log(table.name);
 * }
 *
 * for (let [name, table] of schema.tables) {
 *     console.log(name, table.name);
 * }
 */

// METHODS

/**
 * Returns {@link Table} or {@link Column} on given path relative to {@link Schema}. Path should be in dot (.) notation.
 * @method Schema#get
 * @param {string}                      path    - Path of the requested item in dot (.) notation such as 'public.contact'
 * @returns {Table|Column|undefined}            - Requested item.
 * @example
 * var table  = db.get('contact'),      // Returns contact table in public schema.
 *     column = db.get('contact.name'); // Returns name column of the contact table.
 */
Object.defineProperty(Schema.prototype, 'get', { value:
    function(path) {
        let parts   = path.split('.');
        let table   = parts.shift();
        return parts.length === 0 ? this.tables.get(table) : this.tables.get(table).get(parts.join('.'));
    }, enumerable: false });

module.exports = Schema;
