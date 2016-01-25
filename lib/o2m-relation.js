'use strict';

let helper      = require('./util/helper');
let _data       = new WeakMap();
let attributes  = ['sourceTable', 'targetTable', 'constraint', 'type'];

/**
 * @description
 * Class which represent many to one relationship which resembles `hasMany` relation in ORMs (Object Relational Mappers).
 * Provides attributes and methods for details of the relationship.
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
 *
 * ```
 * Below is the same schema as image:
 * ![Database Schema](../../images/schema-through.png)
 *
 * Some definitions used in descriptions for {@link O2MRelation}.
 * * ** Source Table: ** Table which this relationship belongs to.
 * * ** Target Table: ** Table that is related to base table.
 * @example
 * // Example tables have single primary key and examples first relation. So zero index ([0]) is used. Use all array elements if necessary.
 * // product ----< line_item
 * // (source)       (target)
 *
 * let relation         = product.o2mRelations[0];              // RELATION:    product ---< line_item
 * let constraint       = relation.constraint;                  // CONSTRAINT:           ^-- product_has_carts
 * let sourceTable      = relation.sourceTable;                 // TABLE:       product
 * let targetTable      = relation.targetTable;                 // TABLE:       line_item
 * let FKColumn         = relation.constraint.columns[0];       // COLUMN:      product_id  (from line_item table)
 * let sourcePKColumn   = relation.sourceTable.primaryKeys[0];  // COLUMN:      id          (from product table)
 */
class O2MRelation {
    /**
     * @description Constructor function. You don't need to call constructor manually. pg-structure handles this.
     * @param   {Object}        args               - Attributes of the {@link O2MRelation} instance to be created.
     * @param   {Table}         args.sourceTable   - Source {@link Table} which this relation belongs to.
     * @param   {Table}         args.targetTable   - Target {@link Table} which this relation is referring to.
     * @param   {Constraint}    args.constraint    - Foreign key constraint between source table and target table.
     * @returns {O2MRelation}                      - Created {@link O2MRelation} object.
     */
    constructor(args) {
        let _ = _data.set(this, {}).get(this);

        for (let argName of attributes) {
            _[argName] = args[argName] === undefined ? null : args[argName];
        }

        _.type = 'ONE TO MANY';
    }
}

helper.createAccessors(_data, O2MRelation, attributes);

/**
 * @name O2MRelation#type
 * @type {relationType}
 * @readonly
 * @description Type of relation which is `ONE TO MANY`.
 */

/**
 * @name O2MRelation#sourceTable
 * @type {Table}
 * @readonly
 * @description {@link Table} which this relation belongs to.
 * @example
 * let relation     = product.O2MRelationRelations[0];  // RELATION:    product ---< line_item
 * let sourceTable  = relation.sourceTable;             // TABLE:       product
 */

/**
 * @name O2MRelation#targetTable
 * @type {Table}
 * @readonly
 * @description {@link Table} which this relation is referring to.
 * @example
 * let relation     = product.O2MRelationRelations[0];  // RELATION:    product ---< line_item
 * let targetTable  = relation.targetTable;             // TABLE:       line_item
 */

/**
 * @name O2MRelation#constraint
 * @type {Table}
 * @readonly
 * @description Foreign key {@link Constraint constraint} between {@link O2MRelation#sourceTable source table} and {@link O2MRelation#targetTable target table}.
 * @example
 * let relation     = product.O2MRelationRelations[0];  // RELATION:    product ---< line_item
 * let constraint   = relation.constraint;              // CONSTRAINT:           ^-- product_has_carts
 * let FKColumn     = relation.constraint.columns[0];   // COLUMN:      product_id (from line_item table)
 */

module.exports = O2MRelation;
