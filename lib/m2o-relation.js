'use strict';

var Relation = require('./relation');
var helper      = require('./util/helper');

/**
 * @extends Relation
 * @description
 * Class which represent many to one relationship which resembles `belongsTo` relation in ORMs (Object Relational Mappers).
 * Provides attributes and methods for details of the relationship.
 *
 * Actually there is no many to one relation in database engine. It is basically one to many relation in reverse direction.
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
 * Some definitions used in descriptions for {@link M2ORelation}.
 * * ** Source Table: ** Table which this relationship belongs to.
 * * ** Target Table: ** Table that is related to base table.
 * @example
 * // Example tables have single primary key and examples first relation. So zero index ([0]) is used. Use all array elements if necessary.
 * // line_item >---- product
 * // (source)        (target)
 *
 * let relation     = line_item.m2oRelations[0];            // RELATION:    line_item >---- product
 * let constraint   = relation.constraint;                  // CONSTRAINT:               ^-- product_has_carts
 * let sourceTable  = relation.sourceTable;                 // TABLE:       line_item
 * let targetTable  = relation.targetTable;                 // TABLE:       product
 * let FKColumn     = relation.constraint.columns[0];       // COLUMN:      product_id  (from line_item table)
 * let PKColumn     = relation.targetTable.primaryKeys[0];  // COLUMN:      id          (from product table)
 */
class M2ORelation extends Relation {}

/**
 * @name M2ORelation#type
 * @type {relationType}
 * @readonly
 * @description Type of relation which is `MANY TO ONE`.
 */
Object.defineProperty(M2ORelation.prototype, 'type', { value: 'MANY TO ONE', enumerable: true });

/**
 * @name M2ORelation#sourceTable
 * @type {Table}
 * @readonly
 * @description {@link Table} which this relation belongs to.
 * @example
 * let relation     = product.M2ORelationRelations[0];  // RELATION:    line_item >---- product
 * let sourceTable  = relation.sourceTable;             // TABLE:       line_item
 */
Object.defineProperty(M2ORelation.prototype, 'sourceTable', { get: helper.createReferencedObjectGetter('joinTableFullCatalogName', 'table'), enumerable: true });

/**
 * @name M2ORelation#targetTable
 * @type {Table}
 * @readonly
 * @description {@link Table} which this relation is referred by.
 * @example
 * let relation     = product.M2ORelationRelations[0];  // RELATION:    line_item >---- product
 * let targetTable  = relation.targetTable;             // TABLE:       product
 */
Object.defineProperty(M2ORelation.prototype, 'targetTable', { get: helper.createReferencedObjectGetter('leftTableFullCatalogName', 'table'), enumerable: true });

/**
 * @name M2ORelation#constraint
 * @type {Table}
 * @readonly
 * @description Foreign key {@link Constraint constraint} between {@link M2ORelation#sourceTable source table} and {@link M2ORelation#targetTable target table}.
 * @example
 * let relation     = product.M2ORelationRelations[0];  // RELATION:    line_item >---- product
 * let constraint   = relation.constraint;              // CONSTRAINT:               ^-- product_has_carts
 * let FKColumn     = relation.constraint.columns[0];   // COLUMN:      product_id (from line_item table)
 */
Object.defineProperty(M2ORelation.prototype, 'constraint', { get: helper.createReferencedObjectGetter('leftJoinConstraintFullCatalogName', 'constraint'), enumerable: true });

module.exports = M2ORelation;
