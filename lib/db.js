'use strict';

var internal    = require('./util/internal');
var helper      = require('./util/helper');

/**
 * Class which represent a database. Provides attributes and methods for details of the database.
 */
class DB {
    /**
     * @param {Object}          args                - Database arguments.
     * @param {Loki}            args.registry       - Loki.js database object.
     * @param {Object}          args.attributes     - Attributes of the {@link DB} instance.
     * @returns {DB}                                - DB Object.
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
 * @name DB#name
 * @type {string}
 * @readonly
 * @description Name of the {@link Database}.
 */
Object.defineProperty(DB.prototype, 'name', { get: helper.createGetter('name'), enumerable: true });

/**
 * @name DB#fullName
 * @type {string}
 * @readonly
 * @description Full name of the {@link Database} with (.) notation. Since database does not have a parent this equals database name.
 */
Object.defineProperty(DB.prototype, 'fullName', { get: helper.createGetter('fullName'), enumerable: true });

/**
 * @name DB#fullCatalogName
 * @type {string}
 * @readonly
 * @description Full name of the {@link Database} with (.) notation including catalog name. Since database does not have a parent this equals database name.
 */
Object.defineProperty(DB.prototype, 'fullCatalogName', { get: helper.createGetter('fullCatalogName'), enumerable: true });

/**
 * @name DB#schemas
 * @type {Array.<Schema>|null}
 * @readonly
 * @description All {@link Schema} instances in the database as an array. They are ordered by schema name.
 * @example
 * var schemas = db.schemas;
 * var name    = schemas[0].name;
 */
Object.defineProperty(DB.prototype, 'schemas', { get: helper.createOrderedObjectsGetter('schema', {parent: '$this.fullCatalogName'}), enumerable: true });

/**
 * @name DB#schemasByName
 * @type {Object.<string,Schema>|null}
 * @readonly
 * @description All {@link Schema} instances in the database as a simple object. Keys are schema names, values are {@link Schema} instances.
 * @example
 * var schemas = db.schemasByName;
 * var public  = schemas.public;
 */
Object.defineProperty(DB.prototype, 'schemasByName', { get: helper.createNamedObjectsGetter('schema', {parent: '$this.fullCatalogName'}), enumerable: true });

// METHODS

/**
 * Returns {@link Schema} instance with given name or order.
 * @method DB#getSchema
 * @param {string|number} key   - Name or order number of the schema.
 * @returns {Schema|undefined}  - Requested {@link Schema} instance.
 * @example
 * var schema = db.getSchema('public');
 */
Object.defineProperty(DB.prototype, 'getSchema', { value: helper.createChildGetter('schema'), enumerable: false });

/**
 * Returns true if {@link Schema} instance with given name or order number exists.
 * @method DB#schemaExists
 * @param {string|number}   name    - Name or order number of the schema.
 * @returns {boolean}               - `true` if schema exists in database, otherwise `false`.
 * @example
 * var publicExists = db.schemaExists('public'); // true
 * var otherExists  = db.schemaExists('other');  // false
 */
Object.defineProperty(DB.prototype, 'schemaExists', { value: helper.createChildExistsMethod('schema'), enumerable: false });

/**
 * Returns {@link Schema}, {@link Table} or {@link Column} on given path relative to {@link DB}. Path should be in dot (.) notation.
 * @method DB#get
 * @param {string}                  path    - Path of the requested item in dot (.) notation such as 'public.contact'
 * @returns {Schema|Table|Column|undefined} - Requested item.
 * @example
 * var schema = db.get('public'),              // Returns public schema.
 *     table  = db.get('public.contact'),      // Returns contact table in public schema.
 *     column = db.get('public.contact.name'); // Returns name column of the contact table in public schema.
 */
Object.defineProperty(DB.prototype, 'get', { value:
    function(path) {
        let parts   = path.split('.');
        let schema  = parts.shift();
        return parts.length === 0 ? this.getSchema(schema) : this.getSchema(schema).get(parts.join('.'));
    }, enumerable: false });

/**
 * Retrieves all schemas in the database and executes given callback (sync), if provided. Callback has a signature of
 * ({@link Schema}, index, collection). If no callback is provided, returns an array of all [schemas]{@link Schema}.
 * @method DB#getSchemas
 * @param {orderedSchemaCallback} [callback] - Callback to be executed for each schema.
 * @returns {Array.<Schema>|undefined|null}
 * @example
 * db.getSchemas(function(schema, i, collection) {
 *     var name = schema.name;
 *     var ord  = i;
 * );
 */
Object.defineProperty(DB.prototype, 'getSchemas', { value: helper.createOrderedObjectsGetter('schema', {parent: '$this.fullCatalogName'}), enumerable: false });

module.exports = DB;
