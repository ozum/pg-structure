'use strict';

let helper      = require('./util/helper');
let CMap        = require('./util/cmap');
let ASet        = require('./util/aset');

let _data       = new WeakMap();

let parameters  = [
    'allowNull', 'arrayDimension', 'arrayType',
    'defaultWithTypeCast', 'description', 'descriptionData', 'domainName', 'domainSchema', 'isAutoIncrement',
    'length', 'name', 'onDelete', 'onUpdate', 'parent',
    'precision', 'scale', 'type', 'userDefinedType'
];

let attributes  = [
    'allowNull', 'arrayDimension', 'arrayType',
    'defaultWithTypeCast', ['description', 'comment'], ['descriptionData', 'commentData'], ['enumValues', 'enumLabels'],
    'domainName', 'domainSchema', ['isAutoIncrement', 'isSerial'],
    'length', 'name', 'onDelete', 'onUpdate', ['parent', 'table'],
    'precision', 'scale', 'type', 'userDefinedType'
];

class Column {
    /**
     * @description Constructor function. You don't need to call constructor manually. pg-structure handles this.
     * @param   {Object}    args    - Attributes of the {@link Column} instance to be created.
     * @returns {Column}            - {@link Column} instance.
     */
    constructor(args) {
        if (!args.name) { throw new Error('Column name is required.'); }

        let _ = _data.set(this, {}).get(this);

        for (let argName of parameters) {
            _[argName] = args[argName] === undefined ? null : args[argName];
        }

        _.descriptionData   = args.descriptionData || helper.extractJSON(args.description);
        _.description       = helper.replaceJSON(args.description);
        _.enumValues        = parseEnumValues(args.enumValues);
    }

    serialize() {
        let _ = _data.get(this);

        let result = helper.serialize(_, parameters);

        result.enumValues = _.enumValues;

        return result;
    }
}

helper.createAccessors(_data, Column, attributes);

function getFullName() {
    let _ = _data.get(this);
    return _.parent.schema.name + '.' + _.parent.name + '.' + _.name;
}

function getFullCatalogName() {
    let _       = _data.get(this);
    let schema  = _.parent.schema;
    return schema.parent.name + '.' + schema.name + '.' + _.parent.name + '.' + _.name;
}

function getDb() {
    let _ = _data.get(this);
    return _.parent.schema.db;
}

function getSchema() {
    let _ = _data.get(this);
    return _.parent.schema;  // For constraints, child is the table that constraint is defined in.
}

function getDomainFullName() {
    let _ = _data.get(this);
    return _.domainName ? _.domainSchema + '.' + _.domainName : null;
}

function getDomainFullCatalogName() {
    let _ = _data.get(this);
    return _.domainName ? this.db.name + '.' + _.domainSchema + '.' + _.domainName : null;
}

function isForeignKey() {
    return this.foreignKeyConstraints.size > 0;
}

function isPrimaryKey() {
    return this.table.primaryKeyColumns.has(this.name);
}

function getIndexes() {
    return Array.from(this.table.indexes.entries()).filter(e => e[1].columns.has(this.name));
}

function getForeignKeyConstraints() {
    return Array.from(this.table.foreignKeyConstraints.entries()).filter(e => e[1].columns.has(this.name));
}

function notNull() {
    return !_data.get(this).allowNull;
}

function getUniqueIndexes() {
    return Array.from(this.indexes.entries()).filter(e => e[1].isUnique);
}

function getUniqueIndexesNoPk() {
    return Array.from(this.uniqueIndexes.entries()).filter(e => !e[1].isPrimaryKey);
}

function getReferencedColumns() {
    let columns = new ASet;
    for (let fkc of Array.from(this.foreignKeyConstraints.values())) {
        columns.add(fkc.referencedColumnsBy.get(this.name));
    }

    return columns;
}

/**
 * Calculates and returns non typecast default value from default value with typecast.
 * Default values includes single quotes except sql functions and numeric values.
 * @returns {string}                        - Default value without typecast.
 * @private
 */
function getDefault() {
    var result = _data.get(this).defaultWithTypeCast;
    if (result !== undefined && result !== null) {
        result = result.replace(/^('.+?')::.+$/, '$1');
    }

    return result;
}

/**
 * Parses enum labels defined in PostgreSQL and returns as an array of string values. PostgreSQL returns enum values
 * as comma separated values between curly braces. If string contains a comma, it wraps string with double quotes.
 * This function considers this situation
 * @private
 * @param   {string}                values  - Enum values.
 * @returns {Array.<string>|null}           - Enum labels as an array. If column is not an enum returns null.
 */
function parseEnumValues(values) {
    if (values === null || values === undefined) {
        return null;
    }

    if (Array.isArray(values)) {
        return values;
    }

    // Strip curly braces: {}
    values = values.substr(1, values.length - 2);

    // Split by comma considering quoted strings which includes comma.
    values = values.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g).map((value) => {
        // Strip quotes at start and end of string;
        return (value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') ? value.substr(1, value.length - 2) : value;
    });

    return values;
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
 * @name Column#comment
 * @type {string|null}
 * @readonly
 * @description Comment about column.
 * @see Aliases {@link Column#description description}
 */

/**
 * @name Column#commentData
 * @type {Object}
 * @readonly
 * @description JS Object extracted from column description. Object is expected as JSON data between `[JSON]` and `[/JSON]`
 * tags in description. Tags are case-insensitive.
 * @see Aliases {@link Column#descriptionData descriptionData}
 * @example
 * let description = column.comment;            // -> 'This column holds name of account. [JSON]{ "extraData": 2 }[/PGEN]'
 * let extra = column.commentData;              // -> { extraData: 2 }
 * console.log(column.commentData.extraData);   // -> 2
 */

/**
 * @name Column#db
 * @type {Db}
 * @readonly
 * @description {@link Db} this table belongs to.
 */
Object.defineProperty(Column.prototype, 'db', { get: getDb, enumerable: true });

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
Object.defineProperty(Column.prototype, 'default', { get: getDefault, enumerable: true });

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
 * @see Aliases {@link Column#comment comment}
 */

/**
 * @name Column#descriptionData
 * @type {Object}
 * @readonly
 * @description JS Object extracted from column description. Object is expected as JSON data between `[JSON]` and `[/JSON]`
 * tags in description. Tags are case-insensitive.
 * @see Aliases {@link Column#commentData commentData}
 * @example
 * let description = column.description;            // -> 'This column holds name of account. [JSON]{ "extraData": 2 }[/PGEN]'
 * let extra = column.descriptionData;              // -> { extraData: 2 }
 * console.log(column.descriptionData.extraData);   // -> 2
 */

/**
 * @name Column#domainName
 * @type {string|null}
 * @readonly
 * @description If column data type is a domain, this equals domain name without domain schema. Otherwise null.
 * @see {@link Column#domainFullName domainFullName} {@link Column#domainFullCatalogName domainFullCatalogName}.
 * @example
 * var domainName = column.domainName; // i.e. 'phone_number'
 */

/**
 * @name Column#domainFullName
 * @type {string|null}
 * @readonly
 * @description If column data type is a domain, this equals domain name including domain schema. Otherwise null.
 * @see {@link Column#domainName domainName}.
 * @example
 * var domainName = column.domainFullName; // i.e. 'public.phone_number'
 */
Object.defineProperty(Column.prototype, 'domainFullName', { get: getDomainFullName, enumerable: true });

/**
 * @name Column#domainFullCatalogName
 * @type {string|null}
 * @readonly
 * @description If column data type is a domain, this equals domain name including domain schema. Otherwise null.
 * @see {@link Column#domainName domainName}.
 * @example
 * var domainName = column.domainFullName; // i.e. 'public.phone_number'
 */
Object.defineProperty(Column.prototype, 'domainFullCatalogName', { get: getDomainFullCatalogName, enumerable: true });

/**
 * @name Column#domainSchema
 * @type {string|null}
 * @readonly
 * @description If column data type is a domain, this equals domain schema name. Otherwise null.
 * @see {@link Column#domainFullName domainFullName}.
 * @example
 * var domainName = column.domainSchema; // i.e. 'public'
 */

/**
 * @name Column#enumLabels
 * @type {Array.<string>|null}
 * @readonly
 * @description Array of the textual labels for enum values column may contain. If column is not an enum, then this
 * equals `undefined`
 * @see Aliases {@link Column#enumValues enumValues}
 */

/**
 * @name Column#enumValues
 * @type {Array.<string>|null}
 * @readonly
 * @description Array of the textual labels for enum values column may contain. If column is not an enum, then this
 * equals `undefined`
 * @see Aliases {@link Column#enumLabels enumLabels}
 */

/**
 * @name Column#foreignKeyConstraints
 * @type {Map.<Constraint>}
 * @readonly
 * @description {@link Map} of foreign key constraints of the column, if column is part of one or more foreign key constraint.
 */
Object.defineProperty(Column.prototype, 'foreignKeyConstraints', { get: helper.cachedValue({ collectionClass: CMap, data: _data, cacheKey: 'foreignKeyConstraints', calculatedFrom: 'parent.foreignKeyConstraints', calculator: getForeignKeyConstraints }), enumerable: true });

/**
 * @name Column#fullName
 * @type {string}
 * @readonly
 * @description Full name of the {@link Column} with (.) notation.
 * @example
 * var fullName = column.fullName; // public.account.id
 */
Object.defineProperty(Column.prototype, 'fullName', { get: getFullName, enumerable: true });

/**
 * @name Column#fullCatalogName
 * @type {string}
 * @readonly
 * @description Full name of the {@link Column} with (.) notation including catalog name.
 * @example
 * var fullName = table.fullCatalogName; // crm.public.account.id
 */
Object.defineProperty(Column.prototype, 'fullCatalogName', { get: getFullCatalogName, enumerable: true });

/**
 * @name Column#indexes
 * @type {Map.<Index>}
 * @readonly
 * @description {@link Map} of {@link Index indexes}, which column is part of.
 */
Object.defineProperty(Column.prototype, 'indexes', { get: helper.cachedValue({ collectionClass: CMap, data: _data, cacheKey: 'indexes', calculatedFrom: 'parent.indexes', calculator: getIndexes }), enumerable: true });

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
Object.defineProperty(Column.prototype, 'isForeignKey', { get: isForeignKey, enumerable: true });

/**
 * @name Column#isPrimaryKey
 * @type {boolean}
 * @readonly
 * @description `true` if this column is a primary key or part of a primary key constraint; otherwise `false`.
 * Please note that a primary key may contain more than one column.
 */
Object.defineProperty(Column.prototype, 'isPrimaryKey', { get: isPrimaryKey, enumerable: true });

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
Object.defineProperty(Column.prototype, 'notNull', { get: notNull, enumerable: true });

/**
 * @name Column#parent
 * @type {Table}
 * @readonly
 * @description {@link Table} this column belongs to.
 * @see Aliases {@link Column#table table}
 * @example
 * var table = column.parent; // Table instance
 */

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
 * @name Column#referencedColumns
 * @type {Set<Column>}
 * @readonly
 * @description All referenced columns in all foreign key constraints by this column.
 */
Object.defineProperty(Column.prototype, 'referencedColumns', { get: getReferencedColumns, enumerable: true });

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
Object.defineProperty(Column.prototype, 'schema', { get: getSchema, enumerable: true });

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

/**
 * @name Column#userDefinedType
 * @type {postgreSQLDataType|null}
 * @readonly
 * @description If type of column is user defined such as composite, enumerated, this is the data type of the underlying type.
 */

/**
 * @name Column#uniqueIndexesNoPk
 * @type {Map.<Index>}
 * @readonly
 * @description {@link Map} of unique {@link Index indexes}, which column is part of. Excludes primary key indexes. PostgreSQL already creates a unique index for unique
 * {@link Constraint constraints}. So there is no need to look for unique constraints which will result duplicates.
 * @see {@link Column#uniqueIndexes uniqueIndexes} for all unique indexes including primary key indexes.
 */
Object.defineProperty(Column.prototype, 'uniqueIndexesNoPk', { get: helper.cachedValue({ collectionClass: CMap, data: _data, cacheKey: 'uniqueIndexesNoPk', calculatedFrom: 'uniqueIndexes', calculator: getUniqueIndexesNoPk }), enumerable: true });

/**
 * @name Column#uniqueIndexes
 * @type {Map.<Index>}
 * @readonly
 * @description {@link Map} of unique {@link Index indexes}, which column is part of. PostgreSQL already creates a unique index for unique
 * {@link Constraint constraints}. So there is no need to look for unique constraints which will result duplicates.
 * @see {@link Column#uniqueIndexesNoPk uniqueIndexesNoPK} for unique indexes excluding primary key indexes.
 */
Object.defineProperty(Column.prototype, 'uniqueIndexes', { get: helper.cachedValue({ collectionClass: CMap, data: _data, cacheKey: 'uniqueIndexes', calculatedFrom: 'indexes', calculator: getUniqueIndexes }), enumerable: true });

module.exports = Column;
