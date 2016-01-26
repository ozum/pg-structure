'use strict';

let helper              = require('./util/helper');
let AMap                = require('./util/amap');
let CSet                = require('./util/cset');
let CMap                = require('./util/cmap');
let ConstraintMap       = require('./util/constraint-map');
let ConstraintToThisMap = require('./util/constraint-to-this-map');
let M2O                 = require('./m2o-relation');
let O2M                 = require('./o2m-relation');
let M2M                 = require('./m2m-relation');

let _data       = new WeakMap();
let attributes  = ['name', ['parent', 'schema'], ['description', 'comment'], 'columns', 'indexes',
    'constraints', 'foreignKeyConstraintsToThis'];

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
     * @description Constructor function. You don't need to call constructor manually. pg-structure handles this.
     * @param   {Object} args               - Attributes of the {@link Table} instance to be created.
     * @param   {Schema} args.parent        - Parent {@link Schema} of the Table.
     * @param   {string} args.name          - Name of the Table.
     * @param   {string} args.description   - Description of the Table.
     * @returns {Table}                     - {@link Table} instance.
     */
    constructor(args) {
        if (!args.name) { throw new Error('Table name is required.'); }

        let _ = _data.set(this, {}).get(this);

        _.name                          = args.name;
        _.parent                        = args.parent;
        _.description                   = args.description;
        _.columns                       = new CMap();
        _.constraints                   = new ConstraintMap();          // Not: foreignKeyConstraintsToThis eklendiğinde buna otomatik ekleme yapar.
        _.foreignKeyConstraintsToThis   = new ConstraintToThisMap();    // Not: constraint eklendiğinde buna otomatik ekleme yapar.
        _.indexes                       = new CMap();
    }

    serialize() {
        let _ = _data.get(this);

        let result = helper.serialize(_, ['name', 'description']);
        result.columns = [..._.columns].map(i => i[1].serialize());
        result.indexes = [..._.indexes].map(i => i[1].serialize());
        result.constraints = [..._.constraints].map(i => i[1].serialize());
        return result;
    }
}

helper.createAccessors(_data, Table, attributes);

function getFullName() {
    let _ = _data.get(this);
    return _.parent.name + '.' + _.name;
}

function getFullCatalogName() {
    let _ = _data.get(this);
    return this.db.name + '.' + _.parent.name + '.' + _.name;
}

function getDb() {
    let _ = _data.get(this);
    return _.parent.db;
}

function getForeignKeyConstraints() {
    return [...this.constraints].filter(el => el[1].type === 'FOREIGN KEY').sort(helper.sortMapPairsByKey);
}

function getForeignKeyColumns() {
    let columns = [];
    for (let constraint of this.foreignKeyConstraints.values()) {
        columns = columns.concat([...constraint.columns]);
    }
    return columns.sort(helper.sortMapPairsByKey);
}

function getPrimaryKeyConstraint() {
    for (let constraint of this.constraints.values()) {
        if (constraint.type === 'PRIMARY KEY') {
            return constraint;
        }
    }
}

function getPrimaryKeyColumns() {
    return this.primaryKeyConstraint.columns;
}

function getM2ORelations() {
    return [...this.foreignKeyConstraints.values()].map(c => new M2O({
        sourceTable: c.table,
        targetTable: c.referencedTable,
        constraint: c
    }));
}

function getO2MRelations() {
    return [...this.foreignKeyConstraintsToThis.values()].map(c => new O2M({
        sourceTable: c.referencedTable,
        targetTable: c.table,
        constraint: c
    }));
}

function *throughConstraints(onlyPk) {
    for (let fkToThis of this.foreignKeyConstraintsToThis.values()) {
        if (onlyPk && ![...fkToThis.columns.values()].every(c => c.isPrimaryKey)) { continue; }         // Skip if not all columns are PK

        for (let fkToOther of fkToThis.table.foreignKeyConstraints.values()) {
            if (fkToThis === fkToOther) { continue; }                                                   // Skip if it is itself.
            if (onlyPk && ![...fkToOther.columns.values()].every(c => c.isPrimaryKey)) { continue; }    // Skip if not all columns are PK
            yield({toThis: fkToThis, toOther: fkToOther});
        }
    }
}


function getM2MRelations() {
    let m2m  = new Set();

    // Cannot be cached/memoized in a healty way. Depends multiple other data. fkToThis and several fkToOther in multiple tables.
    for (let fk of throughConstraints.call(this, false)) {
        m2m.add(new M2M({
            sourceTable: fk.toThis.referencedTable,
            joinTable: fk.toThis.table,
            targetTable: fk.toOther.referencedTable,
            sourceConstraint: fk.toThis,
            targetConstraint: fk.toOther
        }));
    }

    return m2m;
}

function getM2MRelationsPk() {
    let m2m  = new Set();

    // Cannot be cached/memoized in a healty way. Depends multiple other data. fkToThis and several fkToOther in multiple tables.
    for (let fk of throughConstraints.call(this, true)) {
        m2m.add(new M2M({
            sourceTable: fk.toThis.referencedTable,
            joinTable: fk.toThis.table,
            targetTable: fk.toOther.referencedTable,
            sourceConstraint: fk.toThis,
            targetConstraint: fk.toOther
        }));
    }

    return m2m;
}

function getRelations() {
    return new Set([...this.o2mRelations.values()].concat([...this.m2oRelations.values()], [...this.m2mRelations.values()]));
}


function getBelongsToTables() {
    return [...this.foreignKeyConstraints.values()]
        .map(c => [c.referencedTable.name, c.referencedTable]).sort(helper.sortMapPairsByKey);
}

function getHasManyTables() {
    return [...this.foreignKeyConstraintsToThis.values()]
            .map(c => [c.table.name, c.table]).sort(helper.sortMapPairsByKey);
}

function getBelongsToManyTables() {
    let b2m  = new AMap();

    // Cannot be cached/memoized in a healty way. Depends multiple other data. fkToThis and several fkToOther in multiple tables.
    for (let fk of throughConstraints.call(this, false)) {
        let table = fk.toOther.referencedTable;
        b2m.set(table.name, table);
    }

    return b2m;
}

function getBelongsToManyTablesPk() {
    let b2m  = new AMap();

    // Cannot be cached/memoized in a healty way. Depends multiple other data. fkToThis and several fkToOther in multiple tables.
    for (let fk of throughConstraints.call(this, true)) {
        let table = fk.toOther.referencedTable;
        b2m.set(table.name, table);
    }

    return b2m;
}

// ATTRIBUTES

/**
 * @name Table#name
 * @type {string}
 * @readonly
 * @description Name of the table.
 */

/**
 * @name Table#fullName
 * @type {string}
 * @readonly
 * @description Full name of the {@link Table} with (.) notation.
 * @example
 * var fullName = table.fullName; // public.account
 */
Object.defineProperty(Table.prototype, 'fullName', { get: getFullName, enumerable: true });

/**
 * @name Table#fullCatalogName
 * @type {string}
 * @readonly
 * @description Full name of the {@link Table} with (.) notation including catalog name.
 * @example
 * var fullName = table.fullName; // crm.public.account
 */
Object.defineProperty(Table.prototype, 'fullCatalogName', { get: getFullCatalogName, enumerable: true });

/**
 * @name Table#schema
 * @type {Schema}
 * @readonly
 * @description {@link Schema} this table belongs to.
 * @see Aliases {@link Table#parent parent}
 * @example
 * var schema = table.schema; // Schema instance
 */

/**
 * @name Table#parent
 * @type {Schema}
 * @readonly
 * @description {@link Schema} this table belongs to.
 * @see Aliases {@link Table#schema schema}
 * @example
 * var schema = table.parent; // Schema instance
 */

/**
 * @name Table#comment
 * @type {string}
 * @readonly
 * @description Comment of the table.
 * @see Aliases {@link Table#description description}
 */

/**
 * @name Table#description
 * @type {string}
 * @readonly
 * @description Comment of the table.
 * @see Aliases {@link Table#comment comment}
 */

/**
 * @name Table#columns
 * @type {Map.<Column>}
 * @readonly
 * @description All {@link Column} instances in the table as a {@link Map}. They are ordered same order as they are
 * defined in database table.
 * @see {@link Map}
 * @example
 * var isAvailable  = table.columns.has('id');
 * var columnNames  = [...schema.columns.keys()];       // Use spread operator to get column names as an array.
 * var column       = table.columns.get('user_id');
 * var name         = column.name;
 *
 * for (let column of table.columns.values()) {
 *     console.log(column.name);
 * }
 *
 * for (let [name, column] of table.columns) {
 *     console.log(name, column.name);
 * }
 */

/**
 * @name Table#constraints
 * @type {Map.<Constraint>}
 * @readonly
 * @description All {@link Constraint} instances in the table as a {@link Map}. They are ordered by name.
 */

/**
 * @name Table#db
 * @type {DB}
 * @readonly
 * @description {@link DB} this table belongs to.
 */
Object.defineProperty(Table.prototype, 'db', { get: getDb, enumerable: true });

/**
 * @name Table#foreignKeyConstraints
 * @type {Map.<Constraint>}
 * @readonly
 * @description All {@link Constraint} instances which are foreign key constraints in the table as a {@link Map}.
 * @see {@link Table#o2mRelations o2mRelations}, {@link Table#m2oRelations m2oRelations}, {@link Table#m2mRelations m2mRelations} to get more details about relations.
 */
Object.defineProperty(Table.prototype, 'foreignKeyConstraints', { get: helper.cachedValue({ collectionClass: CMap, data: _data, cacheKey: 'foreignKeyConstraints', calculatedFrom: 'constraints', calculator: getForeignKeyConstraints }), enumerable: true });

/**
 * @name Table#foreignKeyColumns
 * @type {Map.<Column>}
 * @readonly
 * @description All foreign key {@link Column columns} of all {@link Table#foreignKeyConstraints foreignKeyConstraints} as a {@link Map}.
 * Foreign key {@link Constraint constraints} may contain more than one column. To get foreign key columns of a specific foreign key constraint
 * use {@link Table#foreignKeyConstraints}.{@link Constraint#columns columns}
 */
Object.defineProperty(Table.prototype, 'foreignKeyColumns', { get: helper.cachedValue({ collectionClass: CMap, data: _data, cacheKey: 'foreignKeyColumns', calculatedFrom: 'foreignKeyConstraints', calculator: getForeignKeyColumns }), enumerable: true });

/**
 * @name Table#foreignKeyConstraintsToThis
 * @type {Map.<Constraint>}
 * @readonly
 * @description All foreign key {@link Constraint} instances which are referring to this table as a {@link Map}.
 * @see {@link Table#o2mRelations o2mRelations}, {@link Table#m2oRelations m2oRelations}, {@link Table#m2mRelations m2mRelations} to get more details about relations.
 */

/**
 * @name Table#primaryKeyConstraint
 * @type {Constraint|undefined}
 * @readonly
 * @description Primary key {@link Constraint constraint} instance of this table.
 * @see {@link Table#primaryKeyColumns primaryKeyColumns} to get primary key columns directly.
 * @example
 * let pkConstraint = table.primaryKeyConstraint;
 * let pkColumns    = [...pkConstraint.columns.values()];   // As an array
 *
 * for (let [name, column] of pkConstraint.columns) {
 *     console.log(column.name);
 * }
 */
Object.defineProperty(Table.prototype, 'primaryKeyConstraint', { get: helper.cachedValue({ data: _data, cacheKey: 'primaryKeyConstraint', calculatedFrom: 'constraints', calculator: getPrimaryKeyConstraint }), enumerable: true });

/**
 * @name Table#primaryKeyColumns
 * @type {Map.<Column>}
 * @readonly
 * @description Primary key {@link Column columns} of this table as a {@link Map}.
 * @see {@link Table#primaryKeyConstraint primaryKeyConstraint} to get primary key constraint.
 * @example
 * let pkColumns  = [...table.primaryKeyColumns.values()];  // As an array
 * for (let [name, column] of pkConstraint.columns) {
 *     console.log(column.name);
 * }
 */
Object.defineProperty(Table.prototype, 'primaryKeyColumns', { get: getPrimaryKeyColumns, enumerable: true });

/**
 * @name Table#hasManyTables
 * @type {Map.<Table>}
 * @readonly
 * @description {@link Table Tables} sorted by name, which this table has relationship of type `one to many`.
 * @see [Example schema](#exampleSchema), {@link Map}
 * @example
 * for (let [name, table] of vendorTable.hasManyTables) {
 *     console.log(table.name);
 * }
 */
Object.defineProperty(Table.prototype, 'hasManyTables', { get: helper.cachedValue({ collectionClass: CMap, data: _data, cacheKey: 'hasManyTables', calculatedFrom: 'foreignKeyConstraintsToThis', calculator: getHasManyTables }), enumerable: true });

/**
 * @name Table#belongsToTables
 * @type {Map.<Table>}
 * @readonly
 * @description {@link Table Tables} sorted by name, which this table has relationship of type `belongs to` which is reverse direction of `one to many`.
 * @see [Example schema](#exampleSchema), {@link Map}
 * @example
 * for (let [name, table] of productTable.belongsToTables) {
 *     console.log(table.name);
 * }
 */
Object.defineProperty(Table.prototype, 'belongsToTables', { get: helper.cachedValue({ collectionClass: CMap, data: _data, cacheKey: 'belongsToTables', calculatedFrom: 'foreignKeyConstraints', calculator: getBelongsToTables }), enumerable: true });

/**
 * @name Table#belongsToManyTables
 * @type {Map.<Table>}
 * @readonly
 * @description {@link Table Tables} sorted by name, which this table has relationship of type `many to many`.
 * @see [Example schema](#exampleSchema), {@link Map}
 * @example
 * // Cart (id) has many products (id) through line_item join table.
 * for (let [name, table] of cartTable.belongsToManyTables) {
 *     console.log(table.name);
 * }
 */
Object.defineProperty(Table.prototype, 'belongsToManyTables', { get: getBelongsToManyTables, enumerable: true });

/**
 * @name Table#belongsToManyTablesPk
 * @type {Map.<Table>}
 * @readonly
 * @description {@link Table Tables} sorted by name, which this table has relationship of type `many to many`. Includes
 * only tables joined by primary keys in join table.
 * @see [Example schema](#exampleSchema), {@link Map}
 * @example
 * // Cart (id) has many products (id) through line_item join table.
 * for (let [name, table] of cartTable.belongsToManyTables) {
 *     console.log(table.name);
 * }
 */
Object.defineProperty(Table.prototype, 'belongsToManyTablesPk', { get: getBelongsToManyTablesPk, enumerable: true });

/**
 * @name Table#m2mRelations
 * @type {Set.<M2MRelation>}
 * @readonly
 * @description Set of {@link M2MRelation many to many relationships} of the table. {@link M2MRelation} resembles
 * `has many through` and `belongs to many` relations in ORMs. It has some useful methods and information for generating ORM classes.
 */
Object.defineProperty(Table.prototype, 'm2mRelations', { get: getM2MRelations, enumerable: true });

/**
 * @name Table#m2mRelationsPk
 * @type {Set.<M2MRelation>}
 * @readonly
 * @description Set of {@link M2MRelation many to many relationships} of the table. Different from {@link Table#m2mRelations m2mRelations}
 * this only includes relations joined by `Primary Foreign Keys` in join table. `Primary Foreign Keys` means
 * foreign keys of join table which are also Primary Keys of join table at the same time.
 * {@link M2MRelation} resembles `has many through` and `belongs to many` relations in ORMs.
 * It has some useful methods and information for generating ORM classes.
 */
Object.defineProperty(Table.prototype, 'm2mRelationsPk', { get: getM2MRelationsPk, enumerable: true });

/**
 * @name Table#o2mRelations
 * @type {Set.<O2MRelation>}
 * @readonly
 * @description Set of {@link O2MRelation one to many relationships} of the table. {@link O2MRelation} resembles
 * `has many` relations in ORMs. It has some useful methods and information for generating ORM classes.
 */
Object.defineProperty(Table.prototype, 'o2mRelations', { get: helper.cachedValue({ collectionClass: CSet, data: _data, cacheKey: 'o2mRelations', calculatedFrom: 'foreignKeyConstraintsToThis', calculator: getO2MRelations }), enumerable: true });

/**
 * @name Table#m2oRelations
 * @type {Set.<M2ORelation>}
 * @readonly
 * @description Set of {@link M2ORelation many to one relationships} of the table. {@link M2ORelation} resembles
 * `belongs to` relations in ORMs. It has some useful methods and information for generating ORM classes.
 */
Object.defineProperty(Table.prototype, 'm2oRelations', { get: helper.cachedValue({ collectionClass: CSet, data: _data, cacheKey: 'm2oRelations', calculatedFrom: 'foreignKeyConstraints', calculator: getM2ORelations }), enumerable: true });

/**
 * @name Table#relations
 * @type {Array.<O2MRelation|M2ORelation|M2MRelation>}
 * @readonly
 * @description List of all relationships of the table.
 */
Object.defineProperty(Table.prototype, 'relations', { get: getRelations, enumerable: true });


// METHODS
/**
 * Returns {@link Column} on given path relative to {@link Table}.
 * @method Table#get
 * @param {string}                  path    - Path of the requested item in dot (.) notation such as 'public.contact'
 * @returns {Column|undefined}              - Requested item.
 * @example
 * var column = table.get('contact'),      // Returns contact column in public table.
 */
Object.defineProperty(Table.prototype, 'get', { value:
    function(column) {
        return this.columns.get(column);
    }, enumerable: false });

module.exports = Table;