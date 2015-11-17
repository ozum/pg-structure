'use strict';

var internal    = require('./util/internal');
var helper      = require('./util/helper');

/**
 * Class which represent a database index. Provides attributes and methods for details of the index.
 */
class Index {
    /**
     * @param {Object}          args                - Index arguments.
     * @param {Loki}            args.registry       - Loki.js database object.
     * @param {Object}          args.attributes     - Attributes of the {@link Index} instance.
     * @returns {Index}                             - Index object.
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
 * @name Index#name
 * @type {string}
 * @readonly
 * @description Name of the index.
 */
Object.defineProperty(Index.prototype, 'name', { get: helper.createGetter('name'), enumerable: true });

/**
 * @name Index#fullName
 * @type {string}
 * @readonly
 * @description Full name of the {@link Index index} with (.) notation.
 * @example
 * var fullName = index.fullName; // crm.public
 */
Object.defineProperty(Index.prototype, 'fullName', { get: helper.createGetter('fullName'), enumerable: true });

/**
 * @name Index#fullCatalogName
 * @type {string}
 * @readonly
 * @description Full name of the {@link Index index} with (.) notation including catalog name.
 * @example
 * var fullCatalogName = index.fullCatalogName; // crm.public
 */
Object.defineProperty(Index.prototype, 'fullCatalogName', { get: helper.createGetter('fullCatalogName'), enumerable: true });

/**
 * @name Index#isUnique
 * @type {boolean}
 * @readonly
 * @description If true, this is a unique index.
 */
Object.defineProperty(Index.prototype, 'isUnique', { get: helper.createGetter('isUnique'), enumerable: true });

/**
 * @name Index#isPrimaryKey
 * @type {boolean}
 * @readonly
 * @description If true, this index represents the primary key of the table ({@link Index#isUnique isUnique} should always be true when this is true.)
 */
Object.defineProperty(Index.prototype, 'isPrimaryKey', { get: helper.createGetter('isPrimaryKey'), enumerable: true });

/**
 * @name Index#table
 * @type {Table}
 * @readonly
 * @description {@link Table} which this {@link Index index} belongs to.
 */
Object.defineProperty(Index.prototype, 'table', { get: helper.createReferencedObjectGetter('tableFullCatalogName', 'table'), enumerable: true });

/**
 * @name Index#parent
 * @type {Table}
 * @readonly
 * @description {@link Table} which this {@link Index index} belongs to.
 */
Object.defineProperty(Index.prototype, 'parent', { get: helper.createReferencedObjectGetter('tableFullCatalogName', 'table'), enumerable: true });

/**
 * @name Index#db
 * @type {DB}
 * @readonly
 * @description {@link DB} this {@link Index index} belongs to.
 */
Object.defineProperty(Index.prototype, 'db', { get: helper.createDBGetter(), enumerable: true });

/**
 * @name Index#schema
 * @type {Schema}
 * @readonly
 * @description {@link Schema} this {@link Index index} belongs to.
 */
Object.defineProperty(Index.prototype, 'schema', { get: helper.createSchemaGetter(), enumerable: true });

/**
 * If callback is defined executes it for each {@link Column} and returns undefined.
 * Otherwise, returns array of {@link Column columns} belonging to this {@link Index index}.
 * If there aren't any related {@link Column columns}, returns `null`.
 * @param {Function} [callback]             - Callback function to call for each column.
 * @returns {Array.<Column>|null|undefined} - Array of columns belonging to this index. Null if no
 * @private
 */
function getColumns(callback) {
    let _       = internal.get(this);
    let result  =  _.registry.getCollection('indexColumn').chain()
        .find({indexFullCatalogName: this.fullCatalogName})
        .simplesort('position')
        .data()
        .map((row) => {
            return _.registry.getCollection('column').by('fullCatalogName', row.columnFullCatalogName).object;
        });

    return helper.getCollection(result, callback, {objectKey: null});
}

/**
 * @name Index#columns
 * @type {Array.<Column>|null}
 * @readonly
 * @description List of {@link Column columns} restricted by {@link Index index}, in order their ordinal position
 * within the index key. If {@link Index index} does not have any {@link Column columns} this is `null`.
 */
Object.defineProperty(Index.prototype, 'columns', { get: getColumns, enumerable: true });

/**
 * @name Index#columnsByName
 * @type {Object.<string,Column>|null}
 * @readonly
 * @description List of columns restricted by {@link Index index}, in order their ordinal position within the index key.
 * If {@link Index index} does not have any columns this is `null`.
 */
Object.defineProperty(Index.prototype, 'columnsByName', {
    /**
     * @private
     * @returns {Object.<string,Column>|null}   - Columns as key/value object.
     */
    get: function() {
        return helper.getCollection(getColumns.call(this), null, {nameKey: 'name', objectKey: null});
    }, enumerable: true });

module.exports = Index;
