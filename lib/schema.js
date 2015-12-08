'use strict';

var internal    = require('./util/internal');
var helper      = require('./util/helper');

/**
 * Class which represent a PostgreSQL schema. Provides attributes and methods for details of the database.
 */
class Schema {
    /**
     * @param {Object}          args                - Database arguments.
     * @param {Loki}            args.registry       - Loki.js object to get database details.
     * @param {Object}          args.attributes     - Attributes of the {@link Schema} instance.
     * @returns {Schema}                            - Schema object.
     */
    constructor(args) {
        if (!args) throw new Error('Arguments are required.');

        internal.set(this, {
            registry: args.registry,
            attributes: args.attributes
        });
    }
}

// ATTRIBUTES

/**
 * @name Schema#name
 * @type {string}
 * @readonly
 * @description Name of the schema.
 */
Object.defineProperty(Schema.prototype, 'name', { get: helper.createGetter('name'), enumerable: true });

/**
 * @name Schema#fullName
 * @type {string}
 * @readonly
 * @description Full name of the {@link Schema} with (.) notation.
 * @example
 * var fullName = schema.fullName; // crm.public
 */
Object.defineProperty(Schema.prototype, 'fullName', { get: helper.createGetter('fullName'), enumerable: true });

/**
 * @name Schema#fullCatalogName
 * @type {string}
 * @readonly
 * @description Full name of the {@link Schema} with (.) notation including catalog name.
 * @example
 * var fullCatalogName = schema.fullCatalogName; // crm.public
 */
Object.defineProperty(Schema.prototype, 'fullCatalogName', { get: helper.createGetter('fullCatalogName'), enumerable: true });

/**
 * @name Schema#db
 * @type {DB}
 * @readonly
 * @description {@link DB} this schema belongs to.
 * @see Aliases {@link Schema#parent parent}
 * @example
 * var db = schema.db; // DB instance
 */
Object.defineProperty(Schema.prototype, 'db', { get: helper.createReferencedObjectGetter('parent', 'db'), enumerable: true });

/**
 * @name Schema#parent
 * @type {DB}
 * @readonly
 * @description {@link DB} this schema belongs to.
 * @see Aliases {@link Schema#db db}
 * @example
 * var db = schema.parent; // DB instance
 */
Object.defineProperty(Schema.prototype, 'parent', { get: helper.createReferencedObjectGetter('parent', 'db'), enumerable: true });

/**
 * @name Schema#tables
 * @type {Array.<Table>}
 * @readonly
 * @description All {@link Table} instances in the database as an array. They are ordered by same order they are added.
 * @example
 * var tables = schema.tables;
 * var name   = tables[0].name;
 */
Object.defineProperty(Schema.prototype, 'tables', { get: helper.createObjectsGetter('table', {parent: '$this.fullCatalogName'}), enumerable: true });

/**
 * @name DB#schemasByName
 * @type {Object.<string,Schema>}
 * @readonly
 * @description All {@link Schema} instances in the database as a simple object. Keys are schema names, values are {@link Schema} instances.
 * @example
 * var schemas = db.schemasByName;
 * var public  = schemas.public;
 */
Object.defineProperty(Schema.prototype, 'tablesByName', { get: helper.createObjectsGetter('table', {parent: '$this.fullCatalogName'}, { nameKey: 'name' }), enumerable: true });

// METHODS
/**
 * Returns {@link Table} instance with given name or order.
 * @method Schema#getTable
 * @param {string|number} key   - Name or order number of the table.
 * @returns {Table|undefined}   - Requested {@link Table} instance.
 * @example
 * var table = schema.getTable('account');
 */
Object.defineProperty(Schema.prototype, 'getTable', { value: helper.createChildGetter('table'), enumerable: false });

/**
 * Returns true if {@link Table} instance with given name or order number exists.
 * @method Schema#tableExists
 * @param {string|number}   name    - Name or order number of the table.
 * @returns {boolean}               - `true` if table exists in schema, otherwise `false`
 * @example
 * var accountExists = db.TableExists('account'); // true
 * var cakeExists    = db.TableExists('cake');  // false
 */
Object.defineProperty(Schema.prototype, 'tableExists', { value: helper.createChildExistsMethod('table'), enumerable: false });

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
        return parts.length === 0 ? this.getTable(table) : this.getTable(table).get(parts.join('.'));
    }, enumerable: false });

module.exports = Schema;
