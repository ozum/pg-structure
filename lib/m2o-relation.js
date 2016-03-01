'use strict';

const lodash        = require('lodash');
const inflection    = require('inflection');
const helper        = require('./util/helper');

const _data             = new WeakMap();
const attributes        = ['sourceTable', 'targetTable', 'constraint', 'type'];
const namingStrategy    = { simple: getNameSimple, complex: getNameComplex };

/**
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
class M2ORelation {
    /**
     * @description Constructor function. You don't need to call constructor manually. pg-structure handles this.
     * @param   {Object}        args                - Attributes of the {@link M2ORelation} instance to be created.
     * @param   {Table}         args.sourceTable    - Source {@link Table} which this relation belongs to.
     * @param   {Table}         args.targetTable    - Target {@link Table} which this relation is referring to.
     * @param   {Constraint}    args.constraint     - Foreign key constraint between source table and target table.
     * @param   {string}        args.namingStrategy - Naming strategy to be used.
     * @returns {M2ORelation}                       - Created {@link M2ORelation} object.
     */
    constructor(args) {
        let _ = _data.set(this, {}).get(this);

        for (let argName of attributes) {
            _[argName] = args[argName] === undefined ? null : args[argName];
        }

        _.type = 'MANY TO ONE';
        _.namingStrategy = args.namingStrategy;
    }

    /**
     * @description (! EXPERIMENTAL) Returns name for relation using given strategy.
     * @param   {string} [strategy] - Naming strategy to use.
     * @returns {string}            - Relation name.
     */
    generateName(strategy) {
        let _ = _data.get(this);
        return strategy ? namingStrategy[strategy].call(this)
            : getNameFromConstraintName.call(this) || getNameFromDescriptionData.call(this)
        || namingStrategy[_.namingStrategy].call(this);
    }
}

helper.createAccessors(_data, M2ORelation, attributes);

/**
 * Generates a simple name for relation.
 * @private
 * @returns {string} - Simple name.
 */
function getNameSimple() {
    return inflection.transform(this.targetTable.name, ['singularize', 'underscore']);
}

/**
 * Generates a complex name for relation.
 * @private
 * @returns {string} - Complex name.
 */
function getNameComplex() {
    let prefix = 'related';
    let name   = this.constraint.columns.array[0].name;                                 // First foreign key column name.
    name = (name.match(/_?id$/i)) ? name.replace(/_?id$/i, '') : `${prefix}_${name}`;   // Transform: company_id -> company or company -> related_company
    return inflection.transform(name, ['singularize', 'underscore']);
}

/**
 * Returns relation name extracted from constraint name if constraint name is CSV (comma separated value). Name is
 * second element.
 * @private
 * @returns {string|undefined} - Second element of CSV constraint name.
 */
function getNameFromConstraintName() {
    return this.constraint.name.includes(',') ? this.constraint.name.split(',')[1].replace(/\s/, '', 'g') : undefined;
}

/**
 * Returns relation name extracted from {@link Table#descriptionData} by looking keys `name.belongsTo` or `name.m2oName`.
 * @private
 * @returns {string|undefined} - Name for relation
 */
function getNameFromDescriptionData() {
    let data = this.constraint.descriptionData;
    return lodash.get(data, 'name.belongsTo') || lodash.get(data, 'name.m2o');
}

/**
 * @name M2ORelation#type
 * @type {relationType}
 * @readonly
 * @description Type of relation which is `MANY TO ONE`.
 */

/**
 * @name M2ORelation#sourceTable
 * @type {Table}
 * @readonly
 * @description {@link Table} which this relation belongs to.
 * @example
 * let relation     = product.M2ORelationRelations[0];  // RELATION:    line_item >---- product
 * let sourceTable  = relation.sourceTable;             // TABLE:       line_item
 */

/**
 * @name M2ORelation#targetTable
 * @type {Table}
 * @readonly
 * @description {@link Table} which this relation is referred by.
 * @example
 * let relation     = product.M2ORelationRelations[0];  // RELATION:    line_item >---- product
 * let targetTable  = relation.targetTable;             // TABLE:       product
 */

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

module.exports = M2ORelation;
