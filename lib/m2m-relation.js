'use strict';

const lodash        = require('lodash');
const inflection    = require('inflection');
const helper        = require('./util/helper');

const _data             = new WeakMap();
const attributes        = ['sourceTable', 'joinTable', 'targetTable', 'sourceConstraint', 'targetConstraint', 'type'];
const namingStrategy    = { simple: getNameSimple, complex: getNameComplex };

/**
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
class M2MRelation {
    /**
     * @description Constructor function. You don't need to call constructor manually. pg-structure handles this.
     * @param   {Object}        args                    - Attributes of the {@link M2MRelation} instance to be created.
     * @param   {Table}         args.sourceTable        - Source {@link Table} which this relation belongs to.
     * @param   {Table}         args.joinTable          - Join {@link Table} of this relationship.
     * @param   {Table}         args.targetTable        - Target {@link Table} which this relation is referring to through a join table.
     * @param   {Constraint}    args.sourceConstraint   - Foreign key constraint between source table and join table.
     * @param   {Constraint}    args.targetConstraint   - Foreign key constraint between join table and target table.
     * @returns {M2MRelation}                           - Created {@link M2MRelation} object.
     */
    constructor(args) {
        let _ = _data.set(this, {}).get(this);

        for (let argName of attributes) {
            _[argName] = args[argName] === undefined ? null : args[argName];
        }

        _.type = 'MANY TO MANY';
        _.namingStrategy = args.namingStrategy;
    }

    /**
     * @description (! EXPERIMENTAL) Returns name for relation using given strategy. Please see [Relation Names](../relation-names.md) for details.
     * @param   {string} [strategy] - (simple|complex) Naming strategy to use.
     * @return  {string}            - Relation name.
     * @see {@link ../relation-names.md Relation Names}
     */
    generateName(strategy) {
        let _ = _data.get(this);
        return strategy ? namingStrategy[strategy].call(this)
            : getNameFromConstraintName.call(this) || getNameFromDescriptionData.call(this)
        || namingStrategy[_.namingStrategy].call(this);
    }
}

helper.createAccessors(_data, M2MRelation, attributes);

/**
 * Generates a simple name for relation.
 * @private
 * @returns {string} - Simple name.
 */
function getNameSimple() {
    let inflectionMethod = this.targetTable.name[0].toUpperCase() === this.targetTable.name[0] ? 'camelize' : 'underscore';
    return inflection.transform(this.targetTable.name, ['pluralize', inflectionMethod]);
}

/**
 * Generates a complex name for relation.
 * @private
 * @returns {string} - Complex name.
 */
function getNameComplex() {
    let inflectionMethod = this.targetTable.name[0].toUpperCase() === this.targetTable.name[0] ? 'camelize' : 'underscore';
    let name = this.joinTable.name + '_' + helper.fkToRelationName(this.targetConstraint.columns.array[0].name);   // join table name + fk name
    return inflection.transform(name, ['pluralize', inflectionMethod]);
}

/**
 * Returns relation name extracted from constraint name if constraint name is CSV (comma separated value). Name is
 * target table name prefixed with third element.
 * @private
 * @returns {string|undefined} - Second element of CSV constraint name.
 */
function getNameFromConstraintName() {
    let inflectionMethod = this.targetTable.name[0].toUpperCase() === this.targetTable.name[0] ? 'camelize' : 'underscore';
    let string = this.sourceConstraint.name.includes(',') ? this.sourceConstraint.name.split(',')[2].replace(/\s/, '', 'g') : undefined;
    if (string === undefined) return undefined;
    return inflection.transform(string + '_' + this.targetTable.name, ['pluralize', inflectionMethod]);
}

/**
 * Returns relation name extracted from {@link Table#descriptionData} by looking keys `name.belongsToMany` or `name.m2m`.
 * Value from key is used as prefix and joined with target table name.
 * @private
 * @returns {string|undefined} - Name for relation
 */
function getNameFromDescriptionData() {
    let inflectionMethod = this.targetTable.name[0].toUpperCase() === this.targetTable.name[0] ? 'camelize' : 'underscore';
    let data = this.sourceConstraint.descriptionData;
    let string = lodash.get(data, 'name.belongsToMany') || lodash.get(data, 'name.m2m');
    if (string === undefined) return undefined;
    return inflection.transform(string + '_' + this.targetTable.name, ['pluralize', inflectionMethod]);
}

/**
 * @name M2MRelation#type
 * @type {relationType}
 * @readonly
 * @description Type of relation which is `MANY TO MANY`.
 */

/**
 * @name M2MRelation#sourceTable
 * @type {Table}
 * @readonly
 * @description {@link Table} which this relation belongs to.
 * @example
 * let relation = product.M2MRelationRelations[0];  // RELATION:    product ---< line_item >--- cart
 * let source   = relation.sourceTable;             // TABLE:       product
 */

/**
 * @name M2MRelation#joinTable
 * @type {Table}
 * @readonly
 * @description Join {@link Table} of this relationship. This table contains foreign key columns referring both
 * {@link M2MRelation#sourceTable sourceTable} and {@link M2MRelation#targetTable targetTable}.
 * @example
 * let relation  = product.M2MRelationRelations[0]; // RELATION:    product ---< line_item >--- cart
 * let joinTable = relation.joinTable;              // TABLE:       line_item
 */

/**
 * @name M2MRelation#targetTable
 * @type {Table}
 * @readonly
 * @description {@link Table} which this relation is referring to (Through a join table).
 * @example
 * let relation = product.M2MRelationRelations[0];  // RELATION:    product ---< line_item >--- cart
 * let target   = relation.targetTable;             // TABLE:       cart
 */

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

module.exports = M2MRelation;
