'use strict';

const helper                = require('./util/helper');
const ASet                  = require('./util/aset');
const AMap                  = require('./util/amap');
const CSet                  = require('./util/cset');
const CMap                  = require('./util/cmap');
const ConstraintMap         = require('./util/constraint-map');
const ConstraintToThisMap   = require('./util/constraint-to-this-map');
const M2O                   = require('./m2o-relation');
const O2M                   = require('./o2m-relation');
const M2M                   = require('./m2m-relation');

const _data           = new WeakMap();
const attributes    = ['name', ['parent', 'schema'], ['description', 'comment'], 'columns', 'indexes',
    'constraints', 'foreignKeyConstraintsToThis', ['descriptionData', 'commentData']];

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
     * @param   {Object} args                   - Attributes of the {@link Table} instance to be created.
     * @param   {Schema} args.parent            - Parent {@link Schema} of the Table.
     * @param   {string} args.name              - Name of the Table.
     * @param   {string} args.description       - Description of the Table.
     * @param   {Object} args.descriptionData   - Extra data to store in object.
     * @returns {Table}                         - {@link Table} instance.
     */
    constructor(args) {
        if (!args.name) { throw new Error('Table name is required.'); }

        let _ = _data.set(this, {}).get(this);

        _.name                          = args.name;
        _.parent                        = args.parent;
        _.descriptionData               = args.descriptionData || helper.extractJSON(args.description);
        _.description                   = helper.replaceJSON(args.description);
        _.columns                       = new CMap();
        _.constraints                   = new ConstraintMap();          // Not: foreignKeyConstraintsToThis eklendiğinde buna otomatik ekleme yapar.
        _.foreignKeyConstraintsToThis   = new ConstraintToThisMap();    // Not: constraint eklendiğinde buna otomatik ekleme yapar.
        _.indexes                       = new CMap();
    }

    serialize() {
        let _ = _data.get(this);

        let result = helper.serialize(_, ['name', 'description', 'descriptionData']);
        result.columns = Array.from(_.columns).map(i => i[1].serialize());
        result.indexes = Array.from(_.indexes).map(i => i[1].serialize());
        result.constraints = Array.from(_.constraints).map(i => i[1].serialize());
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
    return Array.from(this.constraints).filter(el => el[1].type === 'FOREIGN KEY').sort(helper.sortMapPairsByKey);
}

function getForeignKeyColumns() {
    let columns = [];
    for (let constraint of this.foreignKeyConstraints.values()) {
        columns = columns.concat(Array.from(constraint.columns));
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
    return !this.primaryKeyConstraint ? new AMap() : this.primaryKeyConstraint.columns;
}

function getM2ORelations() {
    let strategy = {};

    // Decide naming strategy based on table names. If there are more than one relation between same tables, use complex naming for them.
    for (let c of this.foreignKeyConstraints.values()) {
        strategy[c.referencedTable.name] = strategy[c.referencedTable.name] ? 'complex' : 'simple';
    }

    return new ASet(Array.from(this.foreignKeyConstraints.values()).map(c => new M2O({
        namingStrategy: strategy[c.referencedTable.name],
        sourceTable: c.table,
        targetTable: c.referencedTable,
        constraint: c
    })));
}

function getO2MRelations() {
    let strategy = {};

    // Decide naming strategy based on table names. If there are more than one relation between same tables, use complex naming for them.
    for (let c of this.foreignKeyConstraintsToThis.values()) {
        strategy[c.table.name] = strategy[c.table.name] ? 'complex' : 'simple';
    }

    return new ASet(Array.from(this.foreignKeyConstraintsToThis.values()).map(c => new O2M({
        namingStrategy: strategy[c.table.name],
        sourceTable: c.referencedTable,
        targetTable: c.table,
        constraint: c
    })));
}

function *throughConstraints(onlyPk) {
    for (let fkToThis of this.foreignKeyConstraintsToThis.values()) {
        if (onlyPk && !Array.from(fkToThis.columns.values()).every(c => c.isPrimaryKey)) {              // Skip if not all columns are PK
            continue;
        }

        for (let fkToOther of fkToThis.table.foreignKeyConstraints.values()) {                          // Skip if it is itself.
            if (fkToThis === fkToOther) {
                continue;
            }

            if (onlyPk && !Array.from(fkToOther.columns.values()).every(c => c.isPrimaryKey)) {         // Skip if not all columns are PK
                continue;
            }

            yield({ toThis: fkToThis, toOther: fkToOther });
        }
    }
}

function getM2MRelations(onlyPk) {
    let strategy = {};
    let constraints = [];

    // If it has M2M relation more than one table with same name, set it's naming strategy as complex.
    for (let fkc of throughConstraints.call(this, onlyPk)) {
        constraints.push(fkc);
        // Many to many: console.log(this.name, ' --< ', fkc.toThis.table.name, ' >-- ', fkc.toOther.referencedTable.name );

        // Decide naming strategy based on table names. If there are more than one relation between same tables, use complex naming for them.
        // Account both m2m and o2m relations
        for (let c of fkc.toOther.referencedTable.foreignKeyConstraints.values()) {
            // One to many: console.log(`${c.referencedTable.name} --< ${c.table.name}`);

            if (c.referencedTable.name === this.name && c.table.name === fkc.toOther.referencedTable.name ) { // tA -< tX >- tB  && tA -< tB
                strategy[fkc.toOther.referencedTable.name] = 'complex';
            }
        }

        strategy[fkc.toOther.referencedTable.name] = strategy[fkc.toOther.referencedTable.name] ? 'complex' : 'simple';
    }

    // Cannot be cached/memoized in a healty way. Depends multiple other data. fkToThis and several fkToOther in multiple tables.
    return new ASet(constraints.map(fkc => new M2M({
        namingStrategy: strategy[fkc.toOther.referencedTable.name],
        sourceTable: fkc.toThis.referencedTable,
        joinTable: fkc.toThis.table,
        targetTable: fkc.toOther.referencedTable,
        sourceConstraint: fkc.toThis,
        targetConstraint: fkc.toOther
    })));
}

function getM2MRelationsAll() {
    return getM2MRelations.call(this, false);
}

function getM2MRelationsPk() {
    return getM2MRelations.call(this, true);
}

function getRelations() {
    return new ASet(Array.from(this.o2mRelations.values()).concat(Array.from(this.m2oRelations.values()), Array.from(this.m2mRelations.values())));
}

function getBelongsToTables() {
    return Array.from(this.foreignKeyConstraints.values())
        .map(c => [c.referencedTable.name, c.referencedTable]).sort(helper.sortMapPairsByKey);
}

function getHasManyTables() {
    return Array.from(this.foreignKeyConstraintsToThis.values())
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
 * @name Table#commentData
 * @type {Object}
 * @readonly
 * @description JS Object extracted from table description. Object is expected as JSON data between `[PG-STRUCTURE]` and `[/PG-STRUCTURE]`
 * tags in description. Tags are case-insensitive.
 * For maximum comfort JSON parsing is made by [jsonic](https://www.npmjs.com/package/jsonic). It is a non-strict JSON parser. It is possible
 * to ommit quotes etc. Please see [jsonic](https://www.npmjs.com/package/jsonic) for details.
 * @see Aliases {@link Table#descriptionData descriptionData}
 * @example
 * let description = table.comment;             // -> 'This table holds account details. [PG-STRUCTURE]{ extraData: 2 }[/PGEN]'
 * let extra = table.commentData;               // -> { extraData: 2 }
 * console.log(table.commentData.extraData);    // -> 2
 */

/**
 * @name Table#description
 * @type {string}
 * @readonly
 * @description Comment of the table.
 * @see Aliases {@link Table#comment comment}
 */

/**
 * @name Table#descriptionData
 * @type {Object}
 * @readonly
 * @description JS Object extracted from table description. Object is expected as JSON data between `[PG-STRUCTURE]` and `[/PG-STRUCTURE]`
 * tags in description. Tags are case-insensitive.
 * For maximum comfort JSON parsing is made by [jsonic](https://www.npmjs.com/package/jsonic). It is a non-strict JSON parser. It is possible
 * to ommit quotes etc.
 * * You don't need to quote property names: { foo:"bar baz", red:255 }
 * * You don't need the top level braces: foo:"bar baz", red:255
 * * You don't need to quote strings with spaces: foo:bar baz, red:255
 * * You do need to quote strings if they contain a comma or closing brace or square bracket: icky:",}]"
 * * You can use single quotes for strings: Jules:'Cry "Havoc," and let slip the dogs of war!'
 * * You can have trailing commas: foo:bar, red:255,
 * For details, please see [jsonic](https://www.npmjs.com/package/jsonic).
 * @see Aliases {@link Table#commentData commentData}
 * @example
 * let description = table.description;             // -> 'This table holds account details. [PG-STRUCTURE]{ "extraData": 2 }[/PGEN]'
 * let extra = table.descriptionData;               // -> { extraData: 2 }
 * console.log(table.descriptionData.extraData);    // -> 2
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
 * var columnNames  = Array.from(schema.columns.keys());       // Use spread operator to get column names as an array.
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
 * @type {Db}
 * @readonly
 * @description {@link Db} this table belongs to.
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
 * let pkColumns    = Array.from(pkConstraint.columns.values());   // As an array
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
 * let pkColumns  = Array.from(table.primaryKeyColumns.values());  // As an array
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
Object.defineProperty(Table.prototype, 'm2mRelations', { get: getM2MRelationsAll, enumerable: true });

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
