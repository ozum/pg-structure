'use strict';

var helper  = require('./util/helper');
var CMap    = require('./util/cmap');

let _data   = new WeakMap();

let attributes = ['name', 'isUnique', 'isPrimaryKey', ['parent', 'table'], 'columns'];
let parameters = ['name', 'isUnique', 'isPrimaryKey', 'parent'];

/**
 * Class which represent a database index. Provides attributes and methods for details of the index.
 */
class Index {
    /**
     * @description Constructor function. You don't need to call constructor manually. pg-structure handles this.
     * @param   {Object} args               - Attributes of the {@link Index} instance to be created.
     * @param   {string} args.name          - Name of the Index.
     * @param   {string} args.isUnique      - Is it a unique index.
     * @param   {string} args.isPrimaryKey  - Is it a primary key index.
     * @param   {Table}  args.parent        - Parent {@link Table} of the Index.
     * @returns {Index}                     - Created {@link Index} object.
     */
    constructor(args) {
        if (!args.name) { throw new Error('Index name is required.'); }

        let _ = _data.set(this, {}).get(this);

        for (let argName of parameters) {
            _[argName] = args[argName] === undefined ? null : args[argName];
        }

        _.columns = new CMap();
    }

    serialize() {
        let _ = _data.get(this);
        let result = helper.serialize(_, parameters);
        result.columns = [..._.columns].map(i => i[1].name);
        return result;
    }
}

helper.createAccessors(_data, Index, attributes);

function getFullName() {
    let _ = _data.get(this);
    return _.parent.schema.name + '.' + _.name;
}

function getFullCatalogName() {
    let _       = _data.get(this);
    let schema  = _.parent.schema;
    return schema.db.name + '.' + schema.name + '.' + _.name;
}

function getDb() {
    let _ = _data.get(this);
    return _.parent.schema.db;
}

function getSchema() {
    let _ = _data.get(this);
    return _.parent.schema;  // For constraints, child is the table that constraint is defined in.
}

// ATTRIBUTES

/**
 * @name Index#name
 * @type {string}
 * @readonly
 * @description Name of the index.
 */

/**
 * @name Index#fullName
 * @type {string}
 * @readonly
 * @description Full name of the {@link Index index} with (.) notation.
 * @example
 * var fullName = index.fullName; // crm.public
 */
Object.defineProperty(Index.prototype, 'fullName', { get: getFullName, enumerable: true });

/**
 * @name Index#fullCatalogName
 * @type {string}
 * @readonly
 * @description Full name of the {@link Index index} with (.) notation including catalog name.
 * @example
 * var fullCatalogName = index.fullCatalogName; // crm.public
 */
Object.defineProperty(Index.prototype, 'fullCatalogName', { get: getFullCatalogName, enumerable: true });

/**
 * @name Index#isUnique
 * @type {boolean}
 * @readonly
 * @description If true, this is a unique index.
 */

/**
 * @name Index#isPrimaryKey
 * @type {boolean}
 * @readonly
 * @description If true, this index represents the primary key of the table ({@link Index#isUnique isUnique} is always true for primary keys.)
 */

/**
 * @name Index#table
 * @type {Table}
 * @readonly
 * @description {@link Table} which this {@link Index index} belongs to.
 */

/**
 * @name Index#parent
 * @type {Table}
 * @readonly
 * @description {@link Table} which this {@link Index index} belongs to.
 */

/**
 * @name Index#db
 * @type {DB}
 * @readonly
 * @description {@link DB} this {@link Index index} belongs to.
 */
Object.defineProperty(Index.prototype, 'db', { get: getDb, enumerable: true });

/**
 * @name Index#schema
 * @type {Schema}
 * @readonly
 * @description {@link Schema} this {@link Index index} belongs to.
 */
Object.defineProperty(Index.prototype, 'schema', { get: getSchema, enumerable: true });

/**
 * @name Index#columns
 * @type {Array.<Column>}
 * @readonly
 * @description List of {@link Column columns} restricted by {@link Index index}, in order their ordinal position
 * within the index key. If {@link Index index} does not have any {@link Column columns} this is `null`.
 */

/**
 * @name Index#columnsByName
 * @type {Object.<string,Column>}
 * @readonly
 * @description List of columns restricted by {@link Index index}, in order their ordinal position within the index key.
 * If {@link Index index} does not have any columns this is `null`.
 */

module.exports = Index;
