'use strict';

var internal    = require('./util/internal');
var helper      = require('./util/helper');

/**
 * Class which represent a database column. Provides attributes and methods for details of the column.
 */
class Column {
    /**
     * @param {Object}          args                - Database arguments.
     * @param {Loki}            args.registry       - Loki.js database object.
     * @param {Object}          args.attributes     - Attributes of the {@link Column} instance.
     * @returns {Column}                            - Returns a {@link Column} object.
     */
    constructor(args) {
        if (!args) throw new Error('Arguments are required.');
        internal.set(this, {
            registry: args.registry,
            attributes: args.attributes
        });
    }
}

// To automatically create accessor list below is used.
var attributeNames = [
    ['allowNull'], ['arrayDimension'], ['arrayType'],
    ['defaultWithTypeCast'], ['description'],
    ['domainName'], ['domainFullName'], ['fullCatalogName'], ['fullName'], ['isAutoIncrement', 'isSerial'],
    ['length'], ['name'], ['notNull'], ['onDelete'], ['onUpdate'],
    ['precision'], ['scale'], ['type'], ['userDefinedType']
];

for (let accessorName of attributeNames) {
    // Create accessor for each alias such as column.allowNull, column is_nullable.
    for (let alias of accessorName) {
        Object.defineProperty(Column.prototype, alias, { get: helper.createGetter(accessorName[0]), enumerable: true });
    }
}

/**
 * Searches constraintColumn collection of Loki and returns this column's row from loki.
 * @param {string} constraintType   - Constraint type. One of `PRIMARY KEY`, `FOREIGN KEY`, `CHECK` or `UNIQUE`
 * @returns {Object}                - ConstraintColumn row from loki.js db.
 * @private
 */
function constraintColumn(constraintType) {
    let registry = internal.get(this).registry;
    return registry.getCollection('constraintColumn').findObject({columnFullCatalogName: this.fullCatalogName, constraintType: constraintType});
}

// ATTRIBUTES

/**
 * @name Column#allowNull
 * @type {boolean}
 * @readonly
 * @description `true` if column is allowed to contain null values; otherwise `false`.
 * @see {@link Column#notNull notNull}.
 */

/**
 * @name Column#arrayDimension
 * @type {number}
 * @readonly
 * @description Number of dimensions, if the column is an array type; otherwise 0.
 */

/**
 * @name Column#arrayType
 * @type {string|null}
 * @readonly
 * @description If this column is an array, data type of the array. If column is not an array equals `null`.
 */

/**
 * @name Column#db
 * @type {DB}
 * @readonly
 * @description {@link DB} this table belongs to.
 */
Object.defineProperty(Column.prototype, 'db', { get: helper.createDBGetter(), enumerable: true });

/**
 * @name Column#default
 * @type {string|null}
 * @readonly
 * @description Default value of the column without typecast. Default values includes single quotes except sql functions and numeric values.
 * @see {@link Column#defaultWithTypeCast defaultWithTypeCast} for default values with typecast as returned by PostgreSQL
 * @example
 * var column = db('crm').schema('public').table('contact').column('name');
 * var type = column.default;           // "'George'"
 * type = age.default;                  // 20
 * type = created_at.default;           // "now()"
 * type = column.defaultWithTypeCast;   // "'George'::character varying"
 *
 */
Object.defineProperty(Column.prototype, 'default', { get:
    function() {
        var result = this.defaultWithTypeCast;
        if (result !== undefined && result !== null) {
            result = result.replace(/^('.+?')::.+$/, '$1');
        }

        return result;
    }, enumerable: true });

/**
 * @name Column#defaultWithTypeCast
 * @type {string|null}
 * @readonly
 * @description Default expression of the column with typecast. PostgreSQL returns default values with typecast.
 * Default values includes single quotes except sql functions and numeric values. Also sql functions and numeric values
 * do not contain type cast.
 * @see {@link Column#default default} for accessing default values without typecast.
 * @example
 * var column = db('crm').schema('public').table('contact').column('name');
 * var type = column.defaultWithTypeCast;   // "'George'::character varying"
 * type = age.defaultWithTypeCast;          // 20
 * type = created_at.defaultWithTypeCast;   // "now()"
 * type = column.default;                   // "'George'"
 */

/**
 * @name Column#description
 * @type {string|null}
 * @readonly
 * @description Comment about column.
 */

/**
 * @name Column#domainName
 * @type {string|null}
 * @readonly
 * @description If column data type is is a domain, this equals domain name without domain schema. Otherwise null.
 * @see {@link Column#domainFullName domainFullName}.
 * @example
 * var domainName = column.domainName; // i.e. 'phone_number'
 */

/**
 * @name Column#domainFullName
 * @type {string|null}
 * @readonly
 * @description If column data type is is a domain, this equals domain name including domain schema. Otherwise null.
 * @see {@link Column#domainName domainName}.
 * @example
 * var domainName = column.domainFullName; // i.e. 'public.phone_number'
 */

/**
 * Parses enum labels defined in PostgreSQL and returns as an array of string values. PostgreSQL returns enum values
 * as comma separated values between curly braces. If string contains a comma, it wraps string with double quotes.
 * This function considers this situation
 * @private
 * @returns {Array.<string>|null}   - Enum labels as an array. If column is not an enum returns null.
 */
function parseEnumLabels() {
    var values = internal.get(this).attributes.enumValues;

    if (values === null) return values;

    // Strip curly braces: {}
    values = values.substr(1, values.length - 2);

    // Split by comma considering quoted strings which includes comma.
    values = values.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g).map((value) => {
        // Strip quotes at start and end of string;
        return (value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') ? value.substr(1, value.length - 2) : value;
    });

    return values;
}

/**
 * @name Column#enumLabels
 * @type {Array.<string>|null}
 * @readonly
 * @description Array of the textual labels for enum values column may contain. If column is not an enum, then this
 * equals `undefined`
 * @see Aliases {@link Column#enumValues enumValues}
 */
Object.defineProperty(Column.prototype, 'enumLabels', { get: parseEnumLabels, enumerable: true });

/**
 * @name Column#enumValues
 * @type {Array.<string>|null}
 * @readonly
 * @description Array of the textual labels for enum values column may contain. If column is not an enum, then this
 * equals `undefined`
 * @see Aliases {@link Column#enumLabels enumLabels}
 */
Object.defineProperty(Column.prototype, 'enumValues', { get: parseEnumLabels, enumerable: true });

/**
 * @name Column#foreignKeyConstraint
 * @type {Constraint|null}
 * @readonly
 * @description Foreign key constraint of the column, if column is part of a foreign key constraint, null otherwise.
 */
Object.defineProperty(Column.prototype, 'foreignKeyConstraint', {
    /**
     * @private
     * @returns {Constraint|null}   - Constraint object.
     */
    get: function() {
        let record      = constraintColumn.call(this, 'FOREIGN KEY');
        let registry    = internal.get(this).registry;
        return record ? registry.getCollection('constraint').by('fullCatalogName', record.constraintFullCatalogName).object : null;
    }, enumerable: true });

/**
 * @name Column#fullName
 * @type {string}
 * @readonly
 * @description Full name of the {@link Column} with (.) notation.
 * @example
 * var fullName = column.fullName; // public.account.id
 */

/**
 * @name Column#fullCatalogName
 * @type {string}
 * @readonly
 * @description Full name of the {@link Column} with (.) notation including catalog name.
 * @example
 * var fullName = table.fullName; // crm.public.account.id
 */

/**
 * @name Column#isAutoIncrement
 * @type {boolean}
 * @readonly
 * @description `true` if this column has an auto incremented (`nextval()`) default value or defined one of `serial`
 * types.
 * @see Aliases {@link Column#isSerial isSerial}
 */

/**
 * @name Column#isSerial
 * @type {boolean}
 * @readonly
 * @description `true` if this column has an auto incremented (`nextval()`) default value or defined one of `serial`
 * types.
 * @see Aliases {@link Column#isAutoIncrement isAutoIncrement}
 */

/**
 * @name Column#isForeignKey
 * @type {boolean}
 * @readonly
 * @description `true` if this column is a foreign key or part of a foreign key constraint; otherwise `false`.
 * Please note that a foreign key may contain more than one column.
 */
Object.defineProperty(Column.prototype, 'isForeignKey', {
    /**
     * @private
     * @returns {boolean}   - If column is foreign key `true`. Otherwise `false`.
     */
    get: function() {
        return constraintColumn.call(this, 'FOREIGN KEY') ? true : false;
    }, enumerable: true });

/**
 * @name Column#isPrimaryKey
 * @type {boolean}
 * @readonly
 * @description `true` if this column is a primary key or part of a primary key constraint; otherwise `false`.
 * Please note that a primary key may contain more than one column.
 */
Object.defineProperty(Column.prototype, 'isPrimaryKey', {
    /**
     * @private
     * @returns {boolean}   - If column is primary key `true`. Otherwise `false`.
     */
    get: function() {
        return constraintColumn.call(this, 'PRIMARY KEY') ? true : false;
    }, enumerable: true });

/**
 * @name Column#length
 * @type {number|null}
 * @readonly
 * @description Length of the column.
 * * For data type identified as a character or bit string type, this is the declared
 * maximum length. If column is an array, same rule applies data type of the array.
 * * For character arrays or bit string type arrays, this is the declared maximum length of the array's data type.
 * * For arrays atttypmod records type-specific data supplied at table creation time (for example, the maximum length
 * of a varchar column). It is passed to type-specific input functions and length coercion functions.
 * * This value is `undefined` for all other data types or if no maximum length was declared.
 */

/**
 * @name Column#name
 * @type {string}
 * @readonly
 * @description Name of the column.
 */

/**
 * @name Column#notNull
 * @type {boolean}
 * @readonly
 * @description `true` if column is **not allowed** to contain null values; otherwise `false`.
 * @see {@link Column#allowNull allowNull}
 */

/**
 * @name Column#parent
 * @type {Table}
 * @readonly
 * @description {@link Table} this column belongs to.
 * @see Aliases {@link Column#table table}
 * @example
 * var table = column.parent; // Table instance
 */
Object.defineProperty(Column.prototype, 'parent', { get: helper.createReferencedObjectGetter('parent', 'table'), enumerable: true });

/**
 * @name Column#precision
 * @type {number|null}
 * @readonly
 * @description * If data type identifies a numeric type, this contains the (declared or implicit) precision of
 * the type for this column. The precision indicates the number of significant digits.
 * * If data type identifies a date, time, timestamp, or interval type, this column contains the (declared or implicit)
 * fractional seconds precision of the type for this attribute, that is, the number of decimal digits maintained
 * following the decimal point in the seconds value.
 * * If data type is an array. Same rules apply for the data type of the array, and this value would become precision
 * of the data type of the array.
 * * For all other data types, this is `undefined`.
 */

/**
 * @name Column#referencedColumn
 * @type {Column|null}
 * @readonly
 * @description Referenced column by this column. If this isn't foreign key then this is null.
 */
Object.defineProperty(Column.prototype, 'referencedColumn', {
    /**
     * @private
     * @returns {Column|null}   - Referenced column.
     */
    get: function() {
        let record      = constraintColumn.call(this, 'FOREIGN KEY');
        let registry    = internal.get(this).registry;
        return record ? registry.getCollection('column').by('fullCatalogName', record.referencedColumnFullCatalogName).object : null;
    }, enumerable: true });

/**
 * @name Column#scale
 * @type {number|null}
 * @readonly
 * @description * If data type identifies an exact numeric type, this contains the (declared or implicit) scale
 * of the type for this attribute. The scale indicates the number of significant digits to the right of the decimal point.
 * * If data type is an array. Same rule applies for the data type of the array, and this value would become scale
 * of the data type of the array.
 * * For all other data types, this is `undefined`.
 */

/**
 * @name Column#schema
 * @type {Schema}
 * @readonly
 * @description {@link Schema} this column belongs to.
 */
Object.defineProperty(Column.prototype, 'schema', { get: helper.createSchemaGetter(), enumerable: true });

/**
 * @name Column#type
 * @type {postgreSQLDataType}
 * @readonly
 * @description Data type of the column.
 * * For built-in types this is name of type.
 * * `ARRAY`, for arrays, and type of array can be found via {@link Column#arrayType arrayType}.
 * * `USER-DEFINED` for user defined types, and type of it can be found via {@link Column#userDefinedType userDefinedType}.
 * * For domain types this is not domain name, but underlying base type of that domain. Use {@link Column#domainName domainName} or {@link Column#domainFullName domainFullName}
 * @see {@link Column#userDefinedType userDefinedType}
 * @see {@link Column#domainName domainName} and {@link Column#domainFullName domainFullName}
 */

/**
 * @name Column#table
 * @type {Table}
 * @readonly
 * @description {@link Table} this column belongs to.
 * @see Aliases {@link Column#parent parent}
 * @example
 * var table = column.table; // Table instance
 */
Object.defineProperty(Column.prototype, 'table', { get: helper.createReferencedObjectGetter('parent', 'table'), enumerable: true });

/**
 * Returns if this column is a part of a Primary Key constraint. Otherwise returns false.
 * @private
 * @returns {string|null}   - Primary key constraint name or null.
 */
function unique() {
    let _ = internal.get(this);
    let result = _.registry.getCollection('constraintColumn').findObject({ columnFullCatalogName: this.fullCatalogName, constraintType: 'UNIQUE' });
    return result ? result.constraintName : null;
}

/**
 * @name Column#userDefinedType
 * @type {postgreSQLDataType|null}
 * @readonly
 * @description If type of column is user defined such as composite, enumerated, this is the data type of the underlying type.
 */

/**
 * @name Column#unique
 * @type {string|null}
 * @readonly
 * @description If column is unique or part of a unique constraint returns constraint name, otherwise null.
 * Also adding a unique constraint to a column will automatically create a unique btree index on the column
 * or group of columns used in the constraint. As a result this attribute includes all.
 */
Object.defineProperty(Column.prototype, 'unique', { get: unique, enumerable: true });

module.exports = Column;
