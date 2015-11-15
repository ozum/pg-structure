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
 * @name Table#columns
 * @type {Array.<Column>|null}
 * @readonly
 * @description All {@link Column} instances in the table as an array. They are ordered by same order they are added.
 * @example
 * var columns = table.columns;
 * var name    = columns[0].name;
 */
Object.defineProperty(Table.prototype, 'columns', { get: helper.createOrderedObjectsGetter('column', {parent: '$this.fullCatalogName'}), enumerable: true });

/**
 * @name Table#columnsByName
 * @type {Object.<string, Column>|null}
 * @readonly
 * @description All {@link Column} instances in the table as a simple object. Keys are column names, values are {@link Column} instances.
 * @example
 * var columns   = table.columnsByName;
 * var ageColumn = columns.age;
 */
Object.defineProperty(Table.prototype, 'columnsByName', { get: helper.createNamedObjectsGetter('column', {parent: '$this.fullCatalogName'}), enumerable: true });

/**
 * @name Table#constraints
 * @type {Array.<Constraint>|null}
 * @readonly
 * @description All {@link Constraint} instances in the table as an array. They are ordered by same order they are added.
 */
Object.defineProperty(Table.prototype, 'constraints', { get: helper.createOrderedObjectsGetter('constraint', {parent: '$this.fullCatalogName'}), enumerable: true });

/**
 * @name Table#constraintsByName
 * @type {Object.<string, Constraint>|null}
 * @readonly
 * @description All {@link Constraint} instances in the table as a simple object. Keys are constraint names, values are {@link Constraint} instances.
 */
Object.defineProperty(Table.prototype, 'constraintsByName', { get: helper.createNamedObjectsGetter('constraint', {parent: '$this.fullCatalogName'}), enumerable: true });

/**
 * @name Table#db
 * @type {DB}
 * @readonly
 * @description {@link DB} this table belongs to.
 */
Object.defineProperty(Table.prototype, 'db', { get: helper.createDBGetter(), enumerable: true });

/**
 * @name Table#foreignKeyConstraints
 * @type {Array.<Constraint>|null}
 * @readonly
 * @description All {@link Constraint} instances which are foreign key constraints in the table as an array.
 * They are ordered by same order they are defined in database.
 * @see {@link Table#o2mRelations o2mRelations}, {@link Table#m2oRelations m2oRelations}, {@link Table#m2mRelations m2mRelations} to get more details about {@link Relation relations}.
 */
Object.defineProperty(Table.prototype, 'foreignKeyConstraints', { get: helper.createOrderedObjectsGetter('constraint', {parent: '$this.fullCatalogName', constraintType: 'FOREIGN KEY'}), enumerable: true });

/**
 * @name Table#foreignKeyConstraintsByName
 * @type {Object.<string, Constraint>|null}
 * @readonly
 * @description All {@link Constraint} instances which are foreign key constraints in the table as a simple object.
 * Keys are constraint names, values are {@link Constraint} instances.
 * @see {@link Table#o2mRelations o2mRelations}, {@link Table#m2oRelations m2oRelations}, {@link Table#m2mRelations m2mRelations} to get more details about {@link Relation relations}.
 */
Object.defineProperty(Table.prototype, 'foreignKeyConstraintsByName', { get: helper.createNamedObjectsGetter('constraint', {parent: '$this.fullCatalogName', constraintType: 'FOREIGN KEY'}), enumerable: true });

/**
 * Returns list of foreign key {@link Column columns} of the table.
 * @param {orderedColumnCallback} [callback]    - Callback to call for each primary key column.
 * @returns {Array.<Column>|undefined|null}     - Foreign key columns. `null` if no column found. `undefined` if callback is provided.
 * @private
 */
function getForeignKeyColumns(callback) {
    let columns          = [];

    this.getForeignKeyConstraints((constraint) => {
        Array.prototype.push.apply(columns, constraint.columns);
    });

    if (columns.length === 0) return null;
    if (!callback) return columns;

    for (let i = 0; i < columns.length; i++) {
        callback(columns[i], i, columns);
    }
}

/**
 * @name Table#foreignKeyColumns
 * @type {Array.<Column>|null}
 * @readonly
 * @description All foreign key {@link Column columns} of all {@link Table#foreignKeyConstraints foreignKeyConstraints}.
 * Foreign key {@link Constraint constraints} may contain more than one column. To get foreign key columns of a specific foreign key constraint
 * use {@link Table#foreignKeyConstraints}.{@link Constraint#columns columns}
 */
Object.defineProperty(Table.prototype, 'foreignKeyColumns', { get: getForeignKeyColumns, enumerable: true });

/**
 * @name Table#foreignKeyColumnsByName
 * @type {Object.<string, Column>|null}
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
     * @returns {Object.<string, Column>|null}  - Primary key objects.
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
 * @param {orderedColumnCallback} [callback]    - Callback to call for each primary key column.
 * @returns {Array.<Column>|undefined|null}     - Primary key columns. `null` if no column found. `undefined` if callback is provided.
 * @private
 */
function getPrimaryKeyColumns(callback) {
    let _                = internal.get(this);
    let columnCollection = _.registry.getCollection('column');
    let columns          = _.registry.getCollection('constraintColumn')
        .findObjects(
            {tableFullCatalogName: this.fullCatalogName, constraintType: 'PRIMARY KEY'}
        )
        .map((value) => {
            return columnCollection.by('fullCatalogName', value.columnFullCatalogName).object;
        });

    if (columns.length === 0) return null;
    if (!callback) return columns;

    for (let i = 0; i < columns.length; i++) {
        callback(columns[i], i, columns);
    }
}

/**
 * @name Table#primaryKeyColumns
 * @type {Array.<Column>|null}
 * @readonly
 * @description Primary key {@link Column columns} of this table.
 * @see {@link Table#primaryKeyConstraint primaryKeyConstraint} to get primary key constraint.
 * @example
 * let pkColumns  = table.primaryKeyColumns;
 */
Object.defineProperty(Table.prototype, 'primaryKeyColumns', { get: getPrimaryKeyColumns, enumerable: true });

/**
 * @name Table#primaryKeyColumnsByName
 * @type {Object.<string, Column>|null}
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
     * @returns {Object.<string, Column>|null}  - Primary key objects.
     */
    get: function() {
        return lodash.indexBy(getPrimaryKeyColumns.call(this), 'name');
    }, enumerable: true });

/**
 * Returns a function to get related tables for given type of relationship.
 * @param {string} type         - Type of relationship. One of 'hasMany', 'belongsTo', 'belongsToMany'.
 * @param {string} [objectKey]  - If result should be an object, key names are set by objectKey of the result objects.
 * @returns {Function}          - Function which gets and returns related tables.
 * @private
 */
function relatedTableGetter(type, objectKey) {
    /**
     * Returns {@link Table tables} as an array of key/value object which this table has relationship of given type.
     * Returns null if no table found. Returns undefined if callback is provided.
     * @param {orderedTableCallback} callback   - Callback function to be executed for each {@link Table table}.
     * @returns {Array.<Table>|Object.<string, Table>|undefined|null}  - Array of tables.
     * @private
     */
    return function getRelatedTables(callback) {
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

        if (tables.length === 0 && !callback) return null;
        if (objectKey) return lodash.indexBy(tables, objectKey);      // Simple object as name/key pairs.
        if (!callback) return tables;                                   // Ordered array.

        for (let i = 0; i < tables.length; i++) {
            callback(tables[i], i, tables);
        }
    };
}

/**
 * @name Table#hasManyTables
 * @type {Array.<Table>|null}
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
 * @type {Object.<string, Table>|null}
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
 * @type {Object.<string, Table>|null}
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
 * @type {Array.<Table>|null}
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
 * @type {Object.<string, Table>|null}
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
 * @type {Object.<string, Table>|null}
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
 * @type {Array.<Table>|null}
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
 * @type {Object.<string, Table>|null}
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
 * @type {Object.<string, Table>|null}
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
 * @type {Array.<M2MRelation>|null}
 * @readonly
 * @description List of {@link M2MRelation many to many relationships} of the table. {@link M2MRelation} resembles
 * `has many through` and `belongs to many` relations in ORMs has some useful methods and information for generating ORM classes.
 */
Object.defineProperty(Table.prototype, 'm2mRelations', { get: helper.createOrderedObjectsGetter(
    'referentialConstraint', {leftTableFullCatalogName: '$this.fullCatalogName', rightTableFullCatalogName: { $ne: null } }, { objectKey: 'm2mObject' }
), enumerable: true });

/**
 * @name Table#o2mRelations
 * @type {Array.<O2MRelation>|null}
 * @readonly
 * @description List of {@link O2MRelation one to many relationships} of the table. {@link O2MRelation} resembles
 * `has many` relations in ORMs and has some useful methods and information for generating ORM classes.
 */
Object.defineProperty(Table.prototype, 'o2mRelations', { get: helper.createOrderedObjectsGetter(
    'referentialConstraint', {leftTableFullCatalogName: '$this.fullCatalogName'}, { objectKey: 'o2mObject' }
), enumerable: true });

/**
 * @name Table#m2oRelations
 * @type {Array.<M2ORelation>|null}
 * @readonly
 * @description List of {@link M2ORelation many to one relationships} of the table. {@link M2ORelation} resembles
 * `belongs to` relations in ORMs and has some useful methods and information for generating ORM classes.
 */
Object.defineProperty(Table.prototype, 'm2oRelations', { get: helper.createOrderedObjectsGetter(
    'referentialConstraint', {joinTableFullCatalogName: '$this.fullCatalogName'}, { objectKey: 'm2oObject' }
), enumerable: true });

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

/**
 * Retrieves all columns in the table, executes given callback and returns null, if provided. Callback has a signature of
 * ({@link Column}, index, collection). If no callback is provided, returns an array of all {@link Column columns}.
 * @method Table#getColumns
 * @param {orderedColumnCallback} [callback] - Callback to be executed for each column.
 * @returns {Array.<Column>|undefined|null}
 * @example
 * schema.getColumns(function(column, i, collection) {
 *     var name = column.name;
 *     var ord  = i;
 * );
 */
Object.defineProperty(Table.prototype, 'getColumns', { value: helper.createOrderedObjectsGetter('column', {parent: '$this.fullCatalogName'}), enumerable: false });

/**
 * Retrieves all constraints in the table, executes given callback and returns null, if provided. Callback has a signature of
 * ({@link Constraint}, index, collection). If no callback is provided, returns an array of all [constraints]{@link Constraint}.
 * @method Table#getConstraints
 * @param {orderedConstraintCallback} [callback] - Callback to be executed for each constraint.
 * @returns {Array.<Constraint>|undefined|null}
 * @see {@link Table#getForeignKeyConstraints getForeignKeyConstraints} to get only foreign key constraints.
 * @example
 * table.getConstraints(function(constraint, i, collection) {
 *     var name = constraint.name;
 *     var ord  = i;
 * );
 */
Object.defineProperty(Table.prototype, 'getConstraints', { value: helper.createOrderedObjectsGetter('constraint', {parent: '$this.fullCatalogName'}), enumerable: false });

/**
 * Retrieves all {@link Constraint constraints} which are foreign key constraints in the table, executes given callback and returns null, if provided. Callback has a signature of
 * ({@link Constraint}, index, collection). If no callback is provided, returns an array of all {@link Constraint constraints}.
 * @method Table#getForeignKeyConstraints
 * @param {orderedConstraintCallback} [callback] - Callback to be executed for each constraint.
 * @returns {Array.<Constraint>|undefined|null}
 * @see {@link Table#getO2MRelations getO2MRelations}, {@link Table#getM2MRelations getM2MRelations} to get more details about {@link Relation relations}.
 * @see {@link Table#getConstraints} to get all constraints.
 * @example
 * table.getConstraints(function(constraint, i, collection) {
 *     var name = constraint.name;
 *     var ord  = i;
 * );
 */
Object.defineProperty(Table.prototype, 'getForeignKeyConstraints', { value: helper.createOrderedObjectsGetter('constraint', {parent: '$this.fullCatalogName', constraintType: 'FOREIGN KEY'}), enumerable: false });

/**
 * Retrieves all foreign key {@link Column columns} of all foreign key {@link Constraint constraints} in the table, executes given callback and returns null, if provided. Callback has a signature of
 * ({@link Column}, index, collection). If no callback is provided, returns an array of all {@link Column columns}.
 * @method Table#getForeignKeyColumns
 * @param {orderedColumnCallback} [callback] - Callback to be executed for each column.
 * @returns {Array.<Column>|undefined|null}
 * @example
 * table.getForeignKeyColumns(function(column, i, collection) {
 *     var name = column.name;
 *     var ord  = i;
 * );
 */
Object.defineProperty(Table.prototype, 'getForeignKeyColumns', { value: getForeignKeyColumns, enumerable: false });


/**
 * Retrieves all primary key {@link Column columns} in the table, executes given callback and returns null, if provided. Callback has a signature of
 * ({@link Column}, index, collection). If no callback is provided, returns an array of all {@link Column columns}.
 * @method Table#getPrimaryKeyColumns
 * @param {orderedColumnCallback} [callback] - Callback to be executed for each column.
 * @returns {Array.<Column>|undefined|null}
 * @example
 * table.getPrimaryKeyColumns(function(column, i, collection) {
 *     var name = column.name;
 *     var ord  = i;
 * );
 */
Object.defineProperty(Table.prototype, 'getPrimaryKeyColumns', { value: getPrimaryKeyColumns, enumerable: false });

/**
 * Retrieves {@link Constraint primary key constraint} of the table and executes given callback and returns null, if provided. Callback has a signature of
 * ({@link Constraint}, index, collection). If no callback is provided, returns single element array of {@link Constraint primary key constraint}.
 * @method Table#getPrimaryKeyConstraint
 * @param {orderedConstraintCallback} [callback] - Callback to be executed for single constraint.
 * @returns {Array.<Constraint>|undefined|null}
 * @example
 * table.getPrimaryKeyConstraint(function(constraint, i, collection) {
 *     var name = constraint.name;
 *     var ord  = i;
 * );
 */
Object.defineProperty(Table.prototype, 'getPrimaryKeyConstraint', { value: helper.createOrderedObjectsGetter('constraint', {parent: '$this.fullCatalogName', constraintType: 'PRIMARY KEY'}), enumerable: false });

/**
 * Retrieves all {@link Table tables} which this table has relationship of type `one to many`, executes given callback and returns null if provided.
 * Callback has a signature of ({@link Table}, index, collection). If no callback is provided, returns an array of all {@link Table tables}.
 * @method Table#getHasManyTables
 * @param {orderedTableCallback} [callback] - Callback to be executed for each {@link Table table}.
 * @returns {Array.<Column>|undefined|null}
 */
Object.defineProperty(Table.prototype, 'getHasManyTables', { value: relatedTableGetter('hasMany'), enumerable: true });

/**
 * Retrieves all {@link Table tables} which this table has relationship of type `one to many` which is reverse direction of `one to many`, executes given callback and returns null if provided.
 * Callback has a signature of ({@link Table}, index, collection). If no callback is provided, returns an array of all {@link Table tables}.
 * @method Table#getBelongsToTables
 * @param {orderedTableCallback} [callback] - Callback to be executed for each {@link Table table}.
 * @returns {Array.<Column>|undefined|null}
 */
Object.defineProperty(Table.prototype, 'getBelongsToTables', { value: relatedTableGetter('belongsTo'), enumerable: true });

/**
 * Retrieves all {@link Table tables} which this table has relationship of type `many to many`, executes given callback and returns null if provided.
 * Callback has a signature of ({@link Table}, index, collection). If no callback is provided, returns an array of all {@link Table tables}.
 * @method Table#getBelongsToManyTables
 * @param {orderedTableCallback} [callback] - Callback to be executed for each {@link Table table}.
 * @returns {Array.<Column>|undefined|null}
 */
Object.defineProperty(Table.prototype, 'getBelongsToManyTables', { value: relatedTableGetter('belongsToMany'), enumerable: true });

/**
 * List of {@link M2MRelation many to many relationships} of the table. {@link M2MRelation} resembles
 * `has many through` and `belongs to many` relations in ORMs has some useful methods and information for generating ORM classes.
 * @method Table#getM2MRelations
 * @param {orderedRelationCallback} [callback] - Callback to be executed for each {@link M2MRelation many to many relation}.
 * @returns {Array.<M2MRelation>|undefined|null}
 */
Object.defineProperty(Table.prototype, 'getM2MRelations', { value: helper.createOrderedObjectsGetter(
    'referentialConstraint', {leftTableFullCatalogName: '$this.fullCatalogName', rightTableFullCatalogName: { $ne: null } }, { objectKey: 'm2mObject' }
), enumerable: true });

/**
 * List of {@link O2MRelation one to many relationships} of the table. {@link O2MRelation} resembles
 * `has many` relations in ORMs and has some useful methods and information for generating ORM classes.
 * @method Table#getO2MRelations
 * @param {orderedRelationCallback} [callback] - Callback to be executed for each {@link O2MRelation one to many relation}.
 * @returns {Array.<O2MRelation>|undefined|null}
 */
Object.defineProperty(Table.prototype, 'getO2MRelations', { value: helper.createOrderedObjectsGetter(
    'referentialConstraint', {leftTableFullCatalogName: '$this.fullCatalogName'}, { objectKey: 'o2mObject' }
), enumerable: true });

/**
 * List of {@link M2ORelation many to one relationships} of the table. {@link M2ORelation} resembles
 * `belongs to` relations in ORMs and has some useful methods and information for generating ORM classes.
 * @method Table#getM2ORelations
 * @param {orderedRelationCallback} [callback] - Callback to be executed for each {@link M2ORelation many to one relation}.
 * @returns {Array.<M2ORelation>|undefined|null}
 */
Object.defineProperty(Table.prototype, 'getM2ORelations', { value: helper.createOrderedObjectsGetter(
    'referentialConstraint', {joinTableFullCatalogName: '$this.fullCatalogName'}, { objectKey: 'm2oObject' }
), enumerable: true });

module.exports = Table;
