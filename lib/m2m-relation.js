'use strict';

var Relation = require('./relation');
var helper      = require('./util/helper');

/**
 * @extends Relation
 * @description
 * Class which represent a many to many relationship which resembles `belongsToMany` or `hasManyThrough` relations in ORMs (Object Relational Mappers).
 * Provides attributes and methods for details of the relationship.
 *
 * Actually there isn't such a thing called **many to many relationship** or **through constraint** in the database engine.
 * They are concepts to describe records which may be related more than one record on both sides.
 * For example an invoice may contain more than product and a product may related to more than one invoice.
 * Those relationships are solved a so called many to many **join table**.
 *
 * Since those relations are not present in database engine, they are extracted by estimation/interpretation.
 * Many non-join tables in a database could have more than one foreign key constraints,
 * and they may not meant to be join tables, but they still appear to have through relationships.
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
 * Some definitions used in descriptions for {@link M2MRelation}.
 * * ** Source Table: ** Table which this relationship belongs to.
 * * ** Join Table: ** Table that contains common fields from two or more other tables.
 * * ** Target Table: ** Table that is related to base table through a join table.
 * <br><br>
 * Product table has 3 foreign key constraints. Product table is not meant to be a many to many join table.
 * However product could have been join table for `size & vendor`, `color & vendor` and `size & color`. As a result size,
 * color and vendor tables would have many to many relationships.
 * @example
 * // Example tables have single primary key and and examples first relation. So zero index ([0]) is used. Use all array elements if necessary.
 * // product ----< line_item >---- cart
 * // (source)        (join)       (target)
 *
 * let relation             = product.m2mRelations[0];              // RELATION:    product ---< line_item >--- cart
 * let sourceConstraint     = relation.sourceConstraint;            // CONSTRAINT:           ^-- product_has_carts
 * let targetConstraint     = relation.targetConstraint;            // CONSTRAINT:       cart_has_products --^
 * let sourceTable          = relation.sourceTable;                 // TABLE:       product
 * let targetTable          = relation.targetTable;                 // TABLE:       cart
 * let sourceJoinFKColumn   = relation.sourceConstraint.columns[0]; // COLUMN:      product_id  (from line_item table)
 * let targetJoinFKColumn   = relation.targetConstraint.columns[0]; // COLUMN:      cart_id     (from line_item table)
 * let sourcePKColumn       = relation.sourceTable.primaryKeys[0];  // COLUMN:      id          (from product table)
 * let targetPKColumn       = relation.targetTable.primaryKeys[0];  // COLUMN:      id          (from cart table)
 */
class M2MRelation extends Relation {}

/**
 * @name M2MRelation#type
 * @type {relationType}
 * @readonly
 * @description Type of relation which is `ONE TO MANY`.
 */
Object.defineProperty(M2MRelation.prototype, 'type', { value: 'MANY TO MANY', enumerable: true });

/**
 * @name M2MRelation#sourceTable
 * @type {Table}
 * @readonly
 * @description {@link Table} which this relation belongs to.
 * @example
 * let relation = product.M2MRelationRelations[0];  // RELATION:    product ---< line_item >--- cart
 * let source   = relation.sourceTable;             // TABLE:       product
 */
Object.defineProperty(M2MRelation.prototype, 'sourceTable', { get: helper.createReferencedObjectGetter('leftTableFullCatalogName', 'table'), enumerable: true });

/**
 * @name M2MRelation#joinTable
 * @type {Table}
 * @readonly
 * @description {@link Table} of this relationship. This table contains foreign key columns referring both
 * {@link M2MRelation#sourceTable sourceTable} and {@link M2MRelation#targetTable targetTable}.
 * @example
 * let relation  = product.M2MRelationRelations[0]; // RELATION:    product ---< line_item >--- cart
 * let joinTable = relation.joinTable;              // TABLE:       line_item
 */
Object.defineProperty(M2MRelation.prototype, 'joinTable', { get: helper.createReferencedObjectGetter('joinTableFullCatalogName', 'table'), enumerable: true });

/**
 * @name M2MRelation#targetTable
 * @type {Table}
 * @readonly
 * @description {@link Table} which this relation is referring to (Through a join table).
 * @example
 * let relation = product.M2MRelationRelations[0];  // RELATION:    product ---< line_item >--- cart
 * let target   = relation.targetTable;             // TABLE:       cart
 */
Object.defineProperty(M2MRelation.prototype, 'targetTable', { get: helper.createReferencedObjectGetter('rightTableFullCatalogName', 'table'), enumerable: true });

/**
 * @name M2MRelation#sourceConstraint
 * @type {Table}
 * @readonly
 * @description Foreign key {@link Constraint constraint} between {@link M2MRelation#sourceTable source table} and {@link M2MRelation#joinTable join table}.
 * @example
 * let relation             = product.M2MRelationRelations[0];      // RELATION:    product ---< line_item >--- cart
 * let sourceConstraint     = relation.sourceConstraint;            // CONSTRAINT:           ^-- product_has_carts
 * let sourceJoinFKColumn   = relation.sourceConstraint.columns[0]; // COLUMN:      product_id (from line_item table)
 */
Object.defineProperty(M2MRelation.prototype, 'sourceConstraint', { get: helper.createReferencedObjectGetter('leftJoinConstraintFullCatalogName', 'constraint'), enumerable: true });

/**
 * @name M2MRelation#targetConstraint
 * @type {Table}
 * @readonly
 * @description Foreign key {@link Constraint constraint} between {@link M2MRelation#joinTable join table} and {@link M2MRelation#targetTable target table}.
 * @example
 * let relation             = product.M2MRelationRelations[0];      // RELATION:    product ---< line_item >--- cart
 * let targetConstraint     = relation.targetConstraint;            // CONSTRAINT:       cart_has_products --^
 * let targetJoinFKColumn   = relation.targetConstraint.columns[0]; // COLUMN:      cart_id (from line_item table)
 */
Object.defineProperty(M2MRelation.prototype, 'targetConstraint', { get: helper.createReferencedObjectGetter('rightJoinConstraintFullCatalogName', 'constraint'), enumerable: true });

module.exports = M2MRelation;
