'use strict';

var helper      = require('./util/helper');

let _data       = new WeakMap();

let parameters  = ['name', 'type', 'onUpdate', 'onDelete', 'matchOption', 'table', 'parent'];
let attributes  = ['name', 'type', 'onUpdate', 'onDelete', 'matchOption', ['parent', 'referencedTable'],
    'columns', 'referencedColumnsBy', ['table', 'child']];

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
     * @description Constructor function. You don't need to call constructor manually. pg-structure handles this.
     * @param   {Object} args               - Attributes of the {@link Constraint} instance to be created.
     * @param   {Table}  args.parent        - For foreign key constraints this is {@link Table} instance this {@link Constraint constraint} refers to. If this is not a foreign key {@link Constraint constraint} this is `null`.
     * @param   {Table}  args.table         - {@link Table} instance the Constraint is defined in.
     * @param   {string} args.schemaName    - Schema name of the Constraint.
     * @param   {string} args.name          - Name of the Constraint.
     * @param   {string} args.type          - Constraint type.
     * @param   {string} args.onUpdate      - Update rule of the constraint.
     * @param   {string} args.onDelete      - Delete rule of the constraint.
     * @param   {string} args.matchOption   - Match option of the constraint.
     * @returns {Constraint}                - Created {@link Constraint} object.
     */
    constructor(args) {
        if (!args.name) { throw new Error('Constraint name is required.'); }

        let _ = _data.set(this, {}).get(this);

        for (let argName of parameters) {
            _[argName] = args[argName] === undefined ? null : args[argName];
        }

        _.columns               = new Map();
        _.referencedColumnsBy   = new Map();
    }

    serialize() {
        let _ = _data.get(this);

        let result      = helper.serialize(_, parameters);

        if (this.parent) {
            result.parent = this.parent.fullName;
        }

        result.columns              = [..._.columns].map(i => i[1].name);
        result.referencedColumnsBy  = [..._.referencedColumnsBy].map(i => [i[0], i[1].fullName]);

        return result;
    }
}

helper.createAccessors(_data, Constraint, attributes);

// TODO: <img src="../../images/warning-24.png" style="margin-left: -26px;">

function getFullName() {
    let _ = _data.get(this);
    return _.table.schema.name + '.' + _.name;
}

function getFullCatalogName() {
    let _       = _data.get(this);
    let schema  = _.table.schema;
    return schema.db.name + '.' + schema.name + '.' + _.name;
}

function getDb() {
    let _ = _data.get(this);
    return _.table.schema.db;
}

function getSchema() {
    let _ = _data.get(this);
    return _.table.schema;  // For constraints, child is the table that constraint is defined in.
}

// ATTRIBUTES

/**
 * @name Constraint#name
 * @type {string}
 * @readonly
 * @description Name of the constraint.
 */

/**
 * @name Constraint#fullName
 * @type {string}
 * @readonly
 * @description Full name of the {@link Constraint constraint} with (.) notation.
 * @example
 * var fullName = constraint.fullName; // crm.public
 */
Object.defineProperty(Constraint.prototype, 'fullName', { get: getFullName, enumerable: true });

/**
 * @name Constraint#fullCatalogName
 * @type {string}
 * @readonly
 * @description Full name of the {@link Constraint constraint} with (.) notation including catalog name.
 * @example
 * var fullCatalogName = constraint.fullCatalogName; // crm.public
 */
Object.defineProperty(Constraint.prototype, 'fullCatalogName', { get: getFullCatalogName, enumerable: true });

/**
 * @name Constraint#type
 * @type {contsraintType}
 * @readonly
 * @description Constraint type. One of `PRIMARY KEY`, `FOREIGN KEY` or `CHECK`
 */

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

/**
 * @name Constraint#db
 * @type {DB}
 * @readonly
 * @description {@link DB} this {@link Constraint constraint} belongs to.
 */
Object.defineProperty(Constraint.prototype, 'db', { get: getDb, enumerable: true });

/**
 * @name Constraint#schema
 * @type {Schema}
 * @readonly
 * @description {@link Schema} this {@link Constraint constraint} belongs to.
 */
Object.defineProperty(Constraint.prototype, 'schema', { get: getSchema, enumerable: true });

/**
 * @name Constraint#matchOption
 * @type {string}
 * @readonly
 * @description Match option of {@link Constraint}.
 */

/**
 * @name Constraint#onUpdate
 * @type {constraintRule|null}
 * @readonly
 * @description Update rule for foreign key {@link Constraint constraints}. One of `CASCADE`, `SET NULL`, `SET DEFAULT`, `RESTRICT`, `NO ACTION`
 * If this is not a foreign key {@link Constraint constraint} this is `null`.
 */

/**
 * @name Constraint#onDelete
 * @type {constraintRule|null}
 * @readonly
 * @description Update rule for foreign key {@link Constraint constraints}. One of `CASCADE`, `SET NULL`, `SET DEFAULT`, `RESTRICT`, `NO ACTION`
 * If this is not a foreign key {@link Constraint constraint} this is `null`.
 */

/**
 * @name Constraint#referencedTable
 * @type {Table|null}
 * @readonly
 * @description For foreign key {@link Constraint constraints} this is {@link Table} instance this {@link Constraint constraint} refers to.
 * If this is not a foreign key {@link Constraint constraint} this is `null`.
 * @see Aliases {@link Constraint#parent parent}
 */

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

/**
 * @name Constraint#columns
 * @type {Map.<Column>}
 * @readonly
 * @description For foreign key constraints, this is {@link Map map} of {@link Column columns} restricted by {@link Constraint constraint}, in order their ordinal position
 * within the constraint key.
 */

/**
 * @name Constraint#referencedColumnsBy
 * @type {Map.<Column>}
 * @readonly
 * @description For foreign key constraints, this is {@link Map map} of {@link Column columns} referenced by this constraint's columns.
 * Keys are referencing column's names, values are referenced columns.
 */


module.exports = Constraint;
