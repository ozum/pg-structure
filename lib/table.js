'use strict';

var internal    = require('./util/internal');
var helper      = require('./util/helper');
var lodash      = require('lodash');

/**
 * Class which represent a table. Provides attributes and methods for details of the table. Tables have relationships
 * with other tables.
 *
 * <span id="exampleSchema"></span>Below is a database schema which is used in code examples.
 * ```
 * size -------------------
 * id (PK)                |  ---------------------------< line_item >------------ cart
 * name                   |  |                            product_id (PFK)        id (PK)
 *                        |  |                            cart_id    (PFK)        name
 *                        ^  |
 * color -------------< product >------------- vendor
 * id (PK)              id        (PK)         id (PK)
 * name                 name                   name
 *                      color_id  (FK)
 *                      size_id   (FK)
 *                      vendor_id (FK)
 * ```
 * Below is the same schema as image:
 * ![Database Schema](../../images/schema-through.png)
 */
class Table {
    /**
     * @param {Object}          args                - Database arguments.
     * @param {Loki}            args.registry       - Loki.js database object.
     * @param {Object}          args.attributes     - Attributes of the {@link Table} instance.
     * @returns {Table}                             - Table object.
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
 * @name Table#name
 * @type {string}
 * @readonly
 * @description Name of the table.
 */
Object.defineProperty(Table.prototype, 'name', { get: helper.createGetter('name'), enumerable: true });

/**
 * @name Table#fullName
 * @type {string}
 * @readonly
 * @description Full name of the {@link Table} with (.) notation.
 * @example
 * var fullName = table.fullName; // public.account
 */
Object.defineProperty(Table.prototype, 'fullName', { get: helper.createGetter('fullName'), enumerable: true });

/**
 * @name Table#fullCatalogName
 * @type {string}
 * @readonly
 * @description Full name of the {@link Table} with (.) notation including catalog name.
 * @example
 * var fullName = table.fullName; // crm.public.account
 */
Object.defineProperty(Table.prototype, 'fullCatalogName', { get: helper.createGetter('fullCatalogName'), enumerable: true });

/**
 * @name Table#schema
 * @type {Schema}
 * @readonly
 * @description {@link Schema} this table belongs to.
 * @see Aliases {@link Table#parent parent}
 * @example
 * var schema = table.schema; // Schema instance
 */
Object.defineProperty(Table.prototype, 'schema', { get: helper.createReferencedObjectGetter('parent', 'schema'), enumerable: true });

/**
 * @name Table#parent
 * @type {Schema}
 * @readonly
 * @description {@link Schema} this table belongs to.
 * @see Aliases {@link Table#schema schema}
 * @example
 * var schema = table.parent; // Schema instance
 */
Object.defineProperty(Table.prototype, 'parent', { get: helper.createReferencedObjectGetter('parent', 'schema'), enumerable: true });

/**
 * @name Table#comment
 * @type {string}
 * @readonly
 * @description Comment of the table.
 * @see Aliases {@link Table#description description}
 */
Object.defineProperty(Table.prototype, 'comment', { get: helper.createGetter('description'), enumerable: true });

/**
 * @name Table#description
 * @type {string}
 * @readonly
 * @description Comment of the table.
 * @see Aliases {@link Table#comment comment}
 */
Object.defineProperty(Table.prototype, 'description', { get: helper.createGetter('description'), enumerable: true });

/**
 * @name Table#columns
 * @type {Array.<Column>}
 * @readonly
 * @description All {@link Column} instances in the table as an array. They are ordered by same order they are added.
 * @example
 * var columns = table.columns;
 * var name    = columns[0].name;
 */
Object.defineProperty(Table.prototype, 'columns', { get: helper.createObjectsGetter('column', {parent: '$this.fullCatalogName'}), enumerable: true });

/**
 * @name Table#columnsByName
 * @type {Object.<string, Column>}
 * @readonly
 * @description All {@link Column} instances in the table as a simple object. Keys are column names, values are {@link Column} instances.
 * @example
 * var columns   = table.columnsByName;
 * var ageColumn = columns.age;
 */
Object.defineProperty(Table.prototype, 'columnsByName', { get: helper.createObjectsGetter('column', {parent: '$this.fullCatalogName'}, { nameKey: 'name' }), enumerable: true });

/**
 * @name Table#constraints
 * @type {Array.<Constraint>}
 * @readonly
 * @description All {@link Constraint} instances in the table as an array. They are ordered by same order they are added.
 */
Object.defineProperty(Table.prototype, 'constraints', { get: helper.createObjectsGetter('constraint', {parent: '$this.fullCatalogName'}), enumerable: true });

/**
 * @name Table#constraintsByName
 * @type {Object.<string, Constraint>}
 * @readonly
 * @description All {@link Constraint} instances in the table as a simple object. Keys are constraint names, values are {@link Constraint} instances.
 */
Object.defineProperty(Table.prototype, 'constraintsByName', { get: helper.createObjectsGetter('constraint', {parent: '$this.fullCatalogName'}, { nameKey: 'name' }), enumerable: true });

/**
 * @name Table#db
 * @type {DB}
 * @readonly
 * @description {@link DB} this table belongs to.
 */
Object.defineProperty(Table.prototype, 'db', { get: helper.createDBGetter(), enumerable: true });

/**
 * @name Table#foreignKeyConstraints
 * @type {Array.<Constraint>}
 * @readonly
 * @description All {@link Constraint} instances which are foreign key constraints in the table as an array.
 * They are ordered by same order they are defined in database.
 * @see {@link Table#o2mRelations o2mRelations}, {@link Table#m2oRelations m2oRelations}, {@link Table#m2mRelations m2mRelations} to get more details about {@link Relation relations}.
 */
Object.defineProperty(Table.prototype, 'foreignKeyConstraints', { get: helper.createObjectsGetter('constraint', {parent: '$this.fullCatalogName', constraintType: 'FOREIGN KEY'}), enumerable: true });

/**
 * @name Table#foreignKeyConstraintsByName
 * @type {Object.<string, Constraint>}
 * @readonly
 * @description All {@link Constraint} instances which are foreign key constraints in the table as a simple object.
 * Keys are constraint names, values are {@link Constraint} instances.
 * @see {@link Table#o2mRelations o2mRelations}, {@link Table#m2oRelations m2oRelations}, {@link Table#m2mRelations m2mRelations} to get more details about {@link Relation relations}.
 */
Object.defineProperty(Table.prototype, 'foreignKeyConstraintsByName', { get: helper.createObjectsGetter('constraint', {parent: '$this.fullCatalogName', constraintType: 'FOREIGN KEY'}, {nameKey: 'name'}), enumerable: true });

/**
 * Returns list of foreign key {@link Column columns} of the table.
 * @returns {Array.<Column>}        - Array of foreign key columns.
 * @private
 */
function getForeignKeyColumns() {
    let columns     = [];
    let constraints = this.foreignKeyConstraints;

    for (let constraint of constraints) {
        columns = columns.concat(constraint.columns);
    }

    return columns;
}

/**
 * @name Table#foreignKeyColumns
 * @type {Array.<Column>}
 * @readonly
 * @description All foreign key {@link Column columns} of all {@link Table#foreignKeyConstraints foreignKeyConstraints}.
 * Foreign key {@link Constraint constraints} may contain more than one column. To get foreign key columns of a specific foreign key constraint
 * use {@link Table#foreignKeyConstraints}.{@link Constraint#columns columns}
 */
Object.defineProperty(Table.prototype, 'foreignKeyColumns', { get: getForeignKeyColumns, enumerable: true });

/**
 * @name Table#foreignKeyColumnsByName
 * @type {Object.<string, Column>}
 * @readonly
 * @description Object containing foreign key {@link Column columns} of this table. Keys are column names, values are
 * {@link Column columns} instances.
 * Foreign key {@link Constraint constraints} may contain more than one column. To get foreign key columns of a specific foreign key constraint
 * use {@link Table#foreignKeyConstraints}.{@link Constraint#columns columns}
 * @example
 * let pkColumns  = table.foreignKeyColumnsByName;
 */
Object.defineProperty(Table.prototype, 'foreignKeyColumnsByName', {
    /**
     * @private
     * @returns {Object.<string, Column>}  - Primary key objects.
     */
    get: function() {
        return lodash.indexBy(getForeignKeyColumns.call(this), 'name');
    }, enumerable: true });

/**
 * @name Table#primaryKeyConstraint
 * @type {Constraint|undefined}
 * @readonly
 * @description Primary key {@link Constraint constraint} instance of this table.
 * @see {@link Table#primaryKeyColumns primaryKeyColumns} to get primary key columns directly.
 * @example
 * let pkConstraint = table.primaryKeyConstraint;
 * let pkColumns  = pkConstraint.columns;
 */
Object.defineProperty(Table.prototype, 'primaryKeyConstraint', {
    /**
     * @private
     * @returns {Constraint|undefined}  - Constraint object
     */
    get: function() {
        let _ = internal.get(this);
        return _.registry.getCollection('constraint').findObject(
            {parent: this.fullCatalogName, constraintType: 'PRIMARY KEY'}
        ).object;
    }, enumerable: true });

/**
 * Returns list of primary key {@link Column columns} of the table.
 * @returns {Array.<Column>}     - List of primary key columns.
 * @private
 */
function getPrimaryKeyColumns() {
    let _                = internal.get(this);
    let columnCollection = _.registry.getCollection('column');
    return _.registry.getCollection('constraintColumn')
        .findObjects(
            {tableFullCatalogName: this.fullCatalogName, constraintType: 'PRIMARY KEY'}
        )
        .map((value) => {
            return columnCollection.by('fullCatalogName', value.columnFullCatalogName).object;
        });
}

/**
 * @name Table#primaryKeyColumns
 * @type {Array.<Column>}
 * @readonly
 * @description Primary key {@link Column columns} of this table.
 * @see {@link Table#primaryKeyConstraint primaryKeyConstraint} to get primary key constraint.
 * @example
 * let pkColumns  = table.primaryKeyColumns;
 */
Object.defineProperty(Table.prototype, 'primaryKeyColumns', { get: getPrimaryKeyColumns, enumerable: true });

/**
 * @name Table#primaryKeyColumnsByName
 * @type {Object.<string, Column>}
 * @readonly
 * @description Object containing primary key {@link Column columns} of this table. Keys are column names, values are
 * {@link Column columns} instances.
 * @see {@link Table#primaryKeyConstraint primaryKeyConstraint} to get primary key constraint.
 * @example
 * let pkColumns  = table.primaryKeyColumnsByName;
 */
Object.defineProperty(Table.prototype, 'primaryKeyColumnsByName', {
    /**
     * @private
     * @returns {Object.<string, Column>}  - Primary key objects.
     */
    get: function() {
        return lodash.indexBy(getPrimaryKeyColumns.call(this), 'name');
    }, enumerable: true });

/**
 * Returns a function to get related tables for given type of relationship.
 * @param {string} type       - Type of relationship. One of 'hasMany', 'belongsTo', 'belongsToMany'.
 * @param {string} [nameKey]  - If result should be an object, key names are set by this of the result objects.
 * @returns {Function}        - Function which gets and returns related tables.
 * @private
 */
function relatedTableGetter(type, nameKey) {
    /**
     * Returns {@link Table tables} as an array of key/value object which this table has relationship of given type.
     * @returns {Array.<Table>}         - Array of tables.
     * @private
     */
    return function getRelatedTables() {
        let _                       = internal.get(this);
        let tableCollection         = _.registry.getCollection('table');
        let constraintCollection    = _.registry.getCollection('referentialConstraint');
        let tables;

        if (type === 'hasMany') {
            tables = constraintCollection
                .findObjects({ leftTableFullCatalogName: this.fullCatalogName })
                .map((constraint) => {
                    return tableCollection.by('fullCatalogName', constraint.joinTableFullCatalogName).object;
                });
        } else if (type === 'belongsTo') {
            tables = constraintCollection
                .findObjects({ joinTableFullCatalogName: this.fullCatalogName })
                .map((constraint) => {
                    return tableCollection.by('fullCatalogName', constraint.leftTableFullCatalogName).object;
                });
        } else if (type === 'belongsToMany') {
            tables = constraintCollection
                .findObjects({ rightTableFullCatalogName: this.fullCatalogName })
                .map((constraint) => {
                    return tableCollection.by('fullCatalogName', constraint.leftTableFullCatalogName).object;
                });
        }

        return nameKey ? lodash.indexBy(tables, nameKey) : tables; // Returns array or object;
    };
}

/**
 * @name Table#hasManyTables
 * @type {Array.<Table>}
 * @readonly
 * @description {@link Table Tables} which this table has relationship of type `one to many`.
 * @see [Example schema](#exampleSchema)
 * @example
 * // Vendor (id) has many products (vendor_id)
 * let productTable = vendorTable.hasManyTables[0];
 */
Object.defineProperty(Table.prototype, 'hasManyTables', { get: relatedTableGetter('hasMany'), enumerable: true });

/**
 * @name Table#hasManyTablesByName
 * @type {Object.<string, Table>}
 * @readonly
 * @description Object of {@link Table Tables} which this table has relationship of type `one to many`. Object keys
 * are table names, object values are {@link Table} instances.
 * ** CAVEAT: Two tables may have same name in different schemas**, such as `public.account` and `other_schema.account`.
 * This is not a problem if there is only one PostgreSQL schema i.e. public. Otherwise it is advised to be used
 * {@link Table#hasManyTablesByFullName hasManyTablesByFullName}.
 * @see [Example schema](#exampleSchema)
 * @see {@link Table#hasManyTablesByFullName hasManyTablesByFullName}
 * @example
 * // Vendor (id) has many products (vendor_id)
 * let productTable = vendorTable.hasManyTablesByName.product;
 */
Object.defineProperty(Table.prototype, 'hasManyTablesByName', { get: relatedTableGetter('hasMany', 'name'), enumerable: true });

/**
 * @name Table#hasManyTablesByFullName
 * @type {Object.<string, Table>}
 * @readonly
 * @description Object of {@link Table Tables} which this table has relationship of type `one to many`. Object keys
 * are table names including schema name (i.e. `public.account`), object values are {@link Table} instances.
 * ** CAVEAT: Full table name contains a dot (.). You should access them with bracket notation. See example below.**
 * {@link Table#hasManyTablesByName hasManyTablesByName}.
 * @see [Example schema](#exampleSchema)
 * @see {@link Table#hasManyTablesByName hasManyTablesByName}
 * @example
 * // Vendor (id) has many products (vendor_id)
 * let productTable = vendorTable.hasManyTablesByFullName['public.product'];
 */
Object.defineProperty(Table.prototype, 'hasManyTablesByFullName', { get: relatedTableGetter('hasMany', 'fullName'), enumerable: true });

/**
 * @name Table#belongsToTables
 * @type {Array.<Table>}
 * @readonly
 * @description {@link Table Tables} which this table has relationship of type `belongs to` which is reverse direction of `one to many`.
 * @see [Example schema](#exampleSchema)
 * @example
 * // Vendor (id) has many products (vendor_id)
 * let vendorTable = productTable.belongsToTables[0];
 */
Object.defineProperty(Table.prototype, 'belongsToTables', { get: relatedTableGetter('belongsTo'), enumerable: true });

/**
 * @name Table#belongsToTablesByName
 * @type {Object.<string, Table>}
 * @readonly
 * @description Object of {@link Table Tables} which this table has relationship of type `belongs to` which is reverse direction of `one to many`. Object keys
 * are table names, object values are {@link Table} instances.
 * ** CAVEAT: Two tables may have same name in different schemas**, such as `public.account` and `other_schema.account`.
 * This is not a problem if there is only one PostgreSQL schema i.e. public. Otherwise it is advised to be used
 * {@link Table#belongsToTablesByFullName belongsToTablesByFullName}.
 * @see [Example schema](#exampleSchema)
 * @see {@link Table#belongsToTablesByFullName belongsToTablesByFullName}
 * @example
 * // Vendor (id) has many products (vendor_id)
 * let vendorTable = productTable.belongsToTablesByName.product;
 */
Object.defineProperty(Table.prototype, 'belongsToTablesByName', { get: relatedTableGetter('belongsTo', 'name'), enumerable: true });

/**
 * @name Table#belongsToTablesByFullName
 * @type {Object.<string, Table>}
 * @readonly
 * @description Object of {@link Table Tables} which this table has relationship of type `belongs to` which is reverse direction of `one to many`. Object keys
 * are table names including schema name (i.e. `public.account`), object values are {@link Table} instances.
 * ** CAVEAT: Full table name contains a dot (.). You should access them with bracket notation. See example below.**
 * {@link Table#belongsToTablesByName belongsToTablesByName}.
 * @see [Example schema](#exampleSchema)
 * @see {@link Table#belongsToTablesByName belongsToTablesByName}
 * @example
 * // Vendor (id) has many products (vendor_id)
 * let vendorTable = productTable.belongsToTablesByFullName['public.product'];
 */
Object.defineProperty(Table.prototype, 'belongsToTablesByFullName', { get: relatedTableGetter('belongsTo', 'fullName'), enumerable: true });

/**
 * @name Table#belongsToManyTables
 * @type {Array.<Table>}
 * @readonly
 * @description {@link Table Tables} which this table has relationship of type `many to many`.
 * @see [Example schema](#exampleSchema)
 * @example
 * // Cart (id) has many products (id) through line_item join table.
 * let productTable = cartTable.belongsToManyTables[0];
 */
Object.defineProperty(Table.prototype, 'belongsToManyTables', { get: relatedTableGetter('belongsToMany'), enumerable: true });

/**
 * @name Table#belongsToManyTablesByName
 * @type {Object.<string, Table>}
 * @readonly
 * @description Object of {@link Table Tables} which this table has relationship of type `many to many`. Object keys
 * are table names, object values are {@link Table} instances.
 * ** CAVEAT: Two tables may have same name in different schemas**, such as `public.account` and `other_schema.account`.
 * This is not a problem if there is only one PostgreSQL schema i.e. public. Otherwise it is advised to be used
 * {@link Table#belongsToManyTablesByFullName belongsToManyTablesByFullName}.
 * @see [Example schema](#exampleSchema)
 * @see {@link Table#belongsToManyTablesByFullName belongsToManyTablesByFullName}
 * @example
 * // Cart (id) has many products (id) through line_item join table.
 * let productTable = cartTable.belongsToManyTablesByName.product;
 */
Object.defineProperty(Table.prototype, 'belongsToManyTablesByName', { get: relatedTableGetter('belongsToMany', 'name'), enumerable: true });

/**
 * @name Table#belongsToManyTablesByFullName
 * @type {Object.<string, Table>}
 * @readonly
 * @description Object of {@link Table Tables} which this table has relationship of type `many to many`. Object keys
 * are table names including schema name (i.e. `public.account`), object values are {@link Table} instances.
 * ** CAVEAT: Full table name contains a dot (.). You should access them with bracket notation. See example below.**
 * {@link Table#belongsToManyTablesByName belongsToManyTablesByName}.
 * @see [Example schema](#exampleSchema)
 * @see {@link Table#belongsToManyTablesByName belongsToManyTablesByName}
 * @example
 * // Cart (id) has many products (id) through line_item join table.
 * let productTable = cartTable.belongsToManyTablesByName['public.product'];
 */
Object.defineProperty(Table.prototype, 'belongsToManyTablesByFullName', { get:  relatedTableGetter('belongsToMany', 'fullName'), enumerable: true });

/**
 * @name Table#m2mRelations
 * @type {Array.<M2MRelation>}
 * @readonly
 * @description List of {@link M2MRelation many to many relationships} of the table. {@link M2MRelation} resembles
 * `has many through` and `belongs to many` relations in ORMs has some useful methods and information for generating ORM classes.
 */
Object.defineProperty(Table.prototype, 'm2mRelations', { get: helper.createObjectsGetter(
    'referentialConstraint', {leftTableFullCatalogName: '$this.fullCatalogName', rightTableFullCatalogName: { $ne: null } }, { objectKey: 'm2mObject' }
), enumerable: true });

/**
 * @name Table#o2mRelations
 * @type {Array.<O2MRelation>}
 * @readonly
 * @description List of {@link O2MRelation one to many relationships} of the table. {@link O2MRelation} resembles
 * `has many` relations in ORMs and has some useful methods and information for generating ORM classes.
 */
Object.defineProperty(Table.prototype, 'o2mRelations', { get: helper.createObjectsGetter(
    'referentialConstraint', {leftTableFullCatalogName: '$this.fullCatalogName', rightTableFullCatalogName: null}, { objectKey: 'o2mObject' }
), enumerable: true });

/**
 * @name Table#m2oRelations
 * @type {Array.<M2ORelation>}
 * @readonly
 * @description List of {@link M2ORelation many to one relationships} of the table. {@link M2ORelation} resembles
 * `belongs to` relations in ORMs and has some useful methods and information for generating ORM classes.
 */
Object.defineProperty(Table.prototype, 'm2oRelations', { get: helper.createObjectsGetter(
    'referentialConstraint', {joinTableFullCatalogName: '$this.fullCatalogName', rightTableFullCatalogName: null}, { objectKey: 'm2oObject' }
), enumerable: true });

/**
 * Returns all relations of table.
 * @private
 * @returns {Array.<Relation>|Object.<String, Relation>} - List of relations.
 */
function getAllRelations() {
    let result = [];
    let o2m = this.o2mRelations;
    let m2m = this.m2mRelations;
    let m2o = this.m2oRelations;

    if (o2m !== null) { result = result.concat(o2m); }
    if (m2o !== null) { result = result.concat(m2o); }
    if (m2m !== null) { result = result.concat(m2m); }

    return result;
}

/**
 * @name Table#relations
 * @type {Array.<O2MRelation|M2ORelation|M2MRelation>}
 * @readonly
 * @description List of all {@link Relation relationships} of the table.
 */
Object.defineProperty(Table.prototype, 'relations', { get: getAllRelations, enumerable: true });

/**
 * Returns a function which returns unique indexes of the column. Based on excludePK results includes Primary Keys or not.
 * @private
 * @param {object}      [filter]    - Filter object to use in Loki.js query.
 * @returns {Function}              - Getter function.
 */
function createIndexGetter(filter) {
    /**
     * Returns list of unique {@link Index indexes}, which column is part of. Results are ordered by index name. If excludePK is provided excludes primary key unique indexes from list.
     * @private
     * @returns {Array.<Index>} - Array of unique {@link Index indexes} column is part of.
     */
    return function indexGetter() {
        filter = filter || {};
        filter.tableFullCatalogName = this.fullCatalogName;

        let _ = internal.get(this);
        return _.registry.getCollection('index').findObjects(filter)
            .sort((a, b) => a.name.toLowerCase() <= b.name.toLowerCase() ? -1 : 1)
            .map((index) => index.object);
    };
}

/**
 * @name Table#indexes
 * @type {Array.<Index>}
 * @readonly
 * @description List of {@link Index indexes}, which this table has. Results are ordered by index name.
 */
Object.defineProperty(Table.prototype, 'indexes', { get: createIndexGetter(), enumerable: true });

// METHODS
/**
 * Returns {@link Column} instance with given name or order.
 * @method Table#getColumn
 * @param {string|number} key   - Name or order number of the column.
 * @returns {Column|undefined}  - Requested {@link Column} instance.
 * @example
 * var column = table.getColumn('surname');
 */
Object.defineProperty(Table.prototype, 'getColumn', { value: helper.createChildGetter('column'), enumerable: false });

/**
 * Returns true if {@link Column} instance with given name or order number exists.
 * @method Table#columnExists
 * @param {string|number}   name    - Name or order number of the column.
 * @returns {boolean}               - `true` if schema column in table, otherwise `false`.
 * @example
 * var ageColumn  = db.schemaExists('age');  // true
 * var jokeColumn = db.schemaExists('joke'); // false
 */
Object.defineProperty(Table.prototype, 'columnExists', { value: helper.createChildExistsMethod('column'), enumerable: false });

/**
 * Returns {@link Column} on given path relative to {@link Table}.
 * @method Table#get
 * @param {string}                  path    - Path of the requested item in dot (.) notation such as 'public.contact'
 * @returns {Column|undefined}              - Requested item.
 * @example
 * var column = table.get('contact'),      // Returns contact column in public table.
 */
Object.defineProperty(Table.prototype, 'get', { value: helper.createChildGetter('column'), enumerable: false });

module.exports = Table;
