// This file is used for definitions for JSDoc. DO NOT DELETE.

// CALLBACKS

/**
 * Callback function to execute for each {@link Schema} in an ordered collection.
 * @callback orderedSchemaCallback
 * @param {Schema}          object      - {@link Schema} from related collection.
 * @param {number}          index       - Index of the {@link Schema}.
 * @param {Array.<Schema>}  collection  - Whole collection array.
 */

/**
 * Callback function to execute for each {@link Table} in an ordered collection.
 * @callback orderedTableCallback
 * @param {Table}           object      - {@link Table} from related collection.
 * @param {number}          index       - Index of the {@link Table}.
 * @param {Array.<Table>}   collection  - Whole collection array.
 */

/**
 * Callback function to execute for each {@link Column} in an ordered collection.
 * @callback orderedColumnCallback
 * @param {Column}          object      - {@link Column} from related collection.
 * @param {number}          index       - Index of the {@link Column}.
 * @param {Array.<Column>}  collection  - Whole collection array.
 */

/**
 * Callback function to execute for each {@link Constraint} in an ordered collection.
 * @callback orderedConstraintCallback
 * @param {Constraint}          object      - {@link Constraint} from related collection.
 * @param {number}              index       - Index of the {@link Constraint}.
 * @param {Array.<Constraint>}  collection  - Whole collection array.
 */

/**
 * Callback function to execute for each {@link Relation} in an ordered collection.
 * @callback orderedRelationCallback
 * @param {Relation}            object      - {@link Relation} from related collection.
 * @param {number}              index       - Index of the {@link Relation}.
 * @param {Array.<Relation>}    collection  - Whole collection array.
 */

/**
 * Callback function to execute for each {@link Index} in an ordered collection.
 * @callback orderedIndexCallback
 * @param {Index}               object      - {@link Index} from related collection.
 * @param {number}              index       - Index of the {@link Index}.
 * @param {Array.<Index>}       collection  - Whole collection array.
 */

/**
 * Callback function to execute for each object in an ordered collection.
 * @callback orderedObjectCallback
 * @param {Object}              object      - Object from related collection.
 * @param {number}              index       - Index of the object.
 * @param {Array.<Object>}      collection  - Whole collection array.
 */

/**
 * PostgreSQL data types as returned by {@link Column#type} and {@link Column#userDefinedType}.
 * @enum {string}
 * @readonly
 */
var postgreSQLDataType = {
    array: 'array',
    bigint: 'bigint',
    bigserial: 'bigserial',
    bit: 'bit',
    'bit varying': 'bit varying',
    boolean: 'boolean',
    box: 'box',
    bytea: 'bytea',
    character: 'character',
    'character varying': 'character varying',
    cidr: 'cidr',
    circle: 'circle',
    date: 'date',
    'double precision': 'double precision',
    hstore: 'hstore',
    inet: 'inet',
    integer: 'integer',
    interval: 'interval',
    json: 'json',
    jsonb: 'jsonb',
    line: 'line',
    lseg: 'lseg',
    macaddr: 'macaddr',
    money: 'money',
    numeric: 'numeric',
    path: 'path',
    point: 'point',
    polygon: 'polygon',
    real: 'real',
    smallint: 'smallint',
    smallserial: 'smallserial',
    serial: 'serial',
    text: 'text',
    'time without time zone': 'time without time zone',
    'time with time zone': 'time with time zone',
    'timestamp without time zone': 'timestamp without time zone',
    'timestamp with time zone': 'timestamp with time zone',
    tsquery: 'tsquery',
    tsvector: 'tsvector',
    txid_snapshot: 'txid_snapshot',
    uuid: 'uuid',
    xml: 'xml'
};

/**
 * Referential constraint rules.
 * @enum {string}
 * @readonly
 */
var constraintRule = {
    /**
     * Specifies that when a referenced row is deleted, row(s) referencing it should be automatically deleted as well.
     */
    CASCADE: 'CASCADE',
    /**
     * These cause the referencing column(s) in the referencing row(s) to be set to nulls, respectively, when the referenced row is deleted.
     */
    'SET NULL': 'SET NULL',
    /**
     * These cause the referencing column(s) in the referencing row(s) to be set to default values, respectively, when the referenced row is deleted.
     */
    'SET DEFAULT': 'SET DEFAULT',
    /**
     * Prevents deletion of a referenced row
     */
    RESTRICT: 'RESTRICT',
    /**
     * Means that if any referencing rows still exist when the constraint is checked, an error is raised;
     */
    'NO ACTION': 'NO ACTION'
};

var contsraintType = {
    'PRIMARY KEY': 'PRIMARY KEY',
    'FOREIGN KEY': 'FOREIGN KEY',
    CHECK: 'CHECK'
};

var relationType = {
    'ONE TO MANY': 'ONE TO MANY',
    'MANY TO ONE': 'MANY TO ONE',
    'MANY TO MANY': 'MANY TO MANY'
};

module.exports = {
    postgreSQLDataType: postgreSQLDataType,
    constraintRule: constraintRule,
    contsraintType: contsraintType,
    relationType: relationType
};
