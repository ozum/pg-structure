'use strict';

var internal    = require('./util/internal');
var helper      = require('./util/helper');

/**
 * Class which represent a constraint. Provides attributes and methods for details of the constraint.
 *
 * #### Notes for Through Constraints <span id="notes"></span>
 * Through constraints are used for many to many relationships. Actually there isn't such a thing called
 * **many to many relationship** or **through constraint** in the database engine. They are concepts to describe
 * records which may be related more than one record on both sides. For example an invoice may contain more than product and
 * a product may related to more than one invoice. Those relationships are solved a so called many to many **join table**.
 *
 * Constraint class supports many to many relationships. Since those constraints are not present in database engine,
 * they are extracted by estimation/interpretation. Many non-join tables in a database could have more than one
 * foreign key constraints, and they may not meant to be join tables, but they have still through relationships .
 *
 * <span id="exampleSchema"></span>Below is a database schema as an example:
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
 *
 * Product table has 3 foreign key constraints. It is obvious that product table is not meant to be a many to many join table.
 * However product could have been join table for `size & vendor`, `color & vendor` and `size & color`. As a result size,
 * color and vendor tables would have many to many `through constraints`.
 *
 */
class Constraint {
    /**
     * @param {Object}          args                - Constraint arguments.
     * @param {Loki}            args.registry       - Loki.js database object.
     * @param {Object}          args.attributes     - Attributes of the {@link Constraint} instance.
     * @returns {Constraint}                        - Constraint object.
     */
    constructor(args) {
        if (!args) throw new Error('Arguments are required.');
        internal.set(this, {
            registry: args.registry,
            attributes: args.attributes
        });
    }
}

/**
 * Fetches foreign key constraint details from Loki.
 * @private
 * @returns {Object|undefined} - Loki referentialConstraint document.
 */
function getForeignConstraint() {
    return internal.get(this).registry.getCollection('referentialConstraint').find({'leftJoinConstraintFullCatalogName': this.fullCatalogName})[0];
}

// ATTRIBUTES

/**
 * @name Constraint#name
 * @type {string}
 * @readonly
 * @description Name of the constraint.
 */
Object.defineProperty(Constraint.prototype, 'name', { get: helper.createGetter('name'), enumerable: true });

/**
 * @name Constraint#fullName
 * @type {string}
 * @readonly
 * @description Full name of the {@link Constraint constraint} with (.) notation.
 * @example
 * var fullName = constraint.fullName; // crm.public
 */
Object.defineProperty(Constraint.prototype, 'fullName', { get: helper.createGetter('fullName'), enumerable: true });

/**
 * @name Constraint#fullCatalogName
 * @type {string}
 * @readonly
 * @description Full name of the {@link Constraint constraint} with (.) notation including catalog name.
 * @example
 * var fullCatalogName = constraint.fullCatalogName; // crm.public
 */
Object.defineProperty(Constraint.prototype, 'fullCatalogName', { get: helper.createGetter('fullCatalogName'), enumerable: true });

/**
 * @name Constraint#type
 * @type {contsraintType}
 * @readonly
 * @description Constraint type. One of `PRIMARY KEY`, `FOREIGN KEY` or `CHECK`
 */
Object.defineProperty(Constraint.prototype, 'type', { get: helper.createGetter('constraintType'), enumerable: true });

/**
 * @name Constraint#child
 * @type {Table}
 * @readonly
 * @description Child {@link Table table} of this {@link Constraint constraint}.
 * **Note for foreign key constraints:** Child table is the table which contains foreign key.
 * In [example schema](#exampleSchema) product is a child table (vendor_id FK) of vendor table.
 * @example
 * var table = constraint.child;
 */
Object.defineProperty(Constraint.prototype, 'child', { get: helper.createReferencedObjectGetter('tableFullCatalogName', 'table'), enumerable: true });

/**
 * @name Constraint#table
 * @type {Table}
 * @readonly
 * @description {@link Table} which this {@link Constraint constraint} belongs to or defined in. <br>
 * **Note for foreign key constraints:** As usual PostgreSQL defines foreign key constraints in child tables,
 * where foreign key column is defined, so this is child table for foreign key constraints.
 * @example
 * var table = constraint.table;
 */
Object.defineProperty(Constraint.prototype, 'table', { get: helper.createReferencedObjectGetter('tableFullCatalogName', 'table'), enumerable: true });

/**
 * @name Constraint#db
 * @type {DB}
 * @readonly
 * @description {@link DB} this {@link Constraint constraint} belongs to.
 */
Object.defineProperty(Constraint.prototype, 'db', { get: helper.createDBGetter(), enumerable: true });

/**
 * @name Constraint#schema
 * @type {Schema}
 * @readonly
 * @description {@link Schema} this {@link Constraint constraint} belongs to.
 */
Object.defineProperty(Constraint.prototype, 'schema', { get: helper.createSchemaGetter(), enumerable: true });

/**
 * @name Constraint#onUpdate
 * @type {constraintRule|null}
 * @readonly
 * @description Update rule for foreign key {@link Constraint constraints}. One of `CASCADE`, `SET NULL`, `SET DEFAULT`, `RESTRICT`, `NO ACTION`
 * If this is not a foreign key {@link Constraint constraint} this is `null`.
 */
Object.defineProperty(Constraint.prototype, 'onUpdate', {
    /**
     * @private
     * @returns {constraintRule|null}   - Constraint rule.
     */
    get: function() {
        return getForeignConstraint.apply(this).leftJoinConstraintOnUpdate;
    }, enumerable: true });

/**
 * @name Constraint#onDelete
 * @type {constraintRule|null}
 * @readonly
 * @description Update rule for foreign key {@link Constraint constraints}. One of `CASCADE`, `SET NULL`, `SET DEFAULT`, `RESTRICT`, `NO ACTION`
 * If this is not a foreign key {@link Constraint constraint} this is `null`.
 */
Object.defineProperty(Constraint.prototype, 'onDelete', {
    /**
     * @private
     * @returns {constraintRule|null}   - Constraint rule.
     */
    get: function() {
        return getForeignConstraint.apply(this).leftJoinConstraintOnDelete;
    }, enumerable: true });

/**
 * For foreign key constraints, returns referenced {@link Table table} by this {@link Constraint constraint}.
 * @returns {Table|null}    - Referenced {@link Table} object.
 * @private
 */
function getReferencedTable() {
    let fkConstraint = getForeignConstraint.apply(this);
    if (!fkConstraint) return null;
    let tableName = fkConstraint.leftTableFullCatalogName;
    return internal.get(this).registry.getCollection('table').by('fullCatalogName', tableName).object;
}

/**
 * @name Constraint#referencedTable
 * @type {Table|null}
 * @readonly
 * @description For foreign key {@link Constraint constraints} this is {@link Table} instance this {@link Constraint constraint} refers to.
 * If this is not a foreign key {@link Constraint constraint} this is `null`.
 * @see Aliases {@link Constraint#parent parent}
 */
Object.defineProperty(Constraint.prototype, 'referencedTable', { get: getReferencedTable, enumerable: true });

/**
 * @name Constraint#parent
 * @type {Table|null}
 * @readonly
 * @description For foreign key {@link Constraint constraints} this is {@link Table} instance this {@link Constraint constraint} refers to.
 * If this is not a foreign key {@link Constraint constraint} this is `null`. <br>
 * **Please Note:** This is not the {@link Table} this constraint belongs to or defined in. Parent applies only to
 * foreign key constraints and for foreign key constraints parent means referenced table not the table it is defined in.
 * @see Aliases {@link Constraint#referencedTable referencedTable}
 * @see To get {@link Table} this constraint belongs to or defined in, use {@link Constraint#table table}.
 */
Object.defineProperty(Constraint.prototype, 'parent', { get: getReferencedTable, enumerable: true });

/**
 * If callback is defined executes it for each {@link Column} and returns undefined.
 * Otherwise, returns array of {@link Column columns} belonging to this {@link Constraint constraint}.
 * If there aren't any related {@link Column columns}, returns `null`.
 * @param {Function} [callback]             - Callback function to call for each column.
 * @returns {Array.<Column>|null|undefined} - Array of columns belonging to this constraint. Null if no
 * @private
 */
function getColumns(callback) {
    let _       = internal.get(this);
    let result  =  _.registry.getCollection('constraintColumn').chain()
        .find({constraintFullCatalogName: this.fullCatalogName})
        .simplesort('position')
        .data()
        .map((row) => {
            return _.registry.getCollection('column').by('fullCatalogName', row.columnFullCatalogName).object;
        });

    return helper.getCollection(result, callback, {objectKey: null});
}

/**
 * @name Constraint#columns
 * @type {Array.<Column>|null}
 * @readonly
 * @description List of {@link Column columns} restricted by {@link Constraint constraint}, in order their ordinal position
 * within the constraint key. If {@link Constraint constraint} does not have any {@link Column columns} this is `null`.
 */
Object.defineProperty(Constraint.prototype, 'columns', { get: getColumns, enumerable: true });

/**
 * @name Constraint#columnsByName
 * @type {Object.<string,Column>|null}
 * @readonly
 * @description List of columns restricted by {@link Constraint constraint}, in order their ordinal position within the constraint key.
 * If {@link Constraint constraint} does not have any columns this is `null`.
 */
Object.defineProperty(Constraint.prototype, 'columnsByName', {
    /**
     * @private
     * @returns {Object.<string,Column>|null}   - Columns as key/value object.
     */
    get: function() {
        return helper.getCollection(getColumns.call(this), null, {nameKey: 'name', objectKey: null});
    }, enumerable: true });

module.exports = Constraint;
