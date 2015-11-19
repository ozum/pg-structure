'use strict';

var Relation = require('./relation');
var helper      = require('./util/helper');

/**
 * @extends Relation
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
class O2MRelation extends Relation {}

/**
 * @name O2MRelation#type
 * @type {relationType}
 * @readonly
 * @description Type of relation which is `MANY TO MANY`.
 */
Object.defineProperty(O2MRelation.prototype, 'type', { value: 'ONE TO MANY', enumerable: true });

/**
 * @name O2MRelation#sourceTable
 * @type {Table}
 * @readonly
 * @description {@link Table} which this relation belongs to.
 * @example
 * let relation     = product.O2MRelationRelations[0];  // RELATION:    product ---< line_item
 * let sourceTable  = relation.sourceTable;             // TABLE:       product
 */
Object.defineProperty(O2MRelation.prototype, 'sourceTable', { get: helper.createReferencedObjectGetter('leftTableFullCatalogName', 'table'), enumerable: true });

/**
 * @name O2MRelation#targetTable
 * @type {Table}
 * @readonly
 * @description {@link Table} which this relation is referring to.
 * @example
 * let relation     = product.O2MRelationRelations[0];  // RELATION:    product ---< line_item
 * let targetTable  = relation.targetTable;             // TABLE:       line_item
 */
Object.defineProperty(O2MRelation.prototype, 'targetTable', { get: helper.createReferencedObjectGetter('joinTableFullCatalogName', 'table'), enumerable: true });

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
Object.defineProperty(O2MRelation.prototype, 'constraint', { get: helper.createReferencedObjectGetter('leftJoinConstraintFullCatalogName', 'constraint'), enumerable: true });

module.exports = O2MRelation;
