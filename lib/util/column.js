/**
 * @author Özüm Eldoğan
 */
/*jslint node: true, regexp: true */

"use strict";

var joi             = require('joi');
var lodash          = require('lodash');
var sequelizeTypes  = require('./../util/sequelize-types.js');
var util            = require('util');
var helper          = require('./helper.js');

/**
 * Returns object to get/set internal properties of an object.
 * @function internal
 * @private
 * @returns {object}
 */
var internal        = helper.internal;


var allowedTypes = [
    'array', 'bigint', 'bigserial', 'bit varying', 'bit', 'boolean', 'box', 'bytea', 'character varying', 'character',
    'cidr', 'circle', 'date', 'double precision', 'hstore', 'inet', 'integer', 'interval', 'json', 'line', 'lseg',
    'macaddr', 'money', 'numeric', 'path', 'point', 'polygon', 'real', 'serial', 'smallint', 'smallserial', 'text',
    'time with time zone', 'time without time zone', 'timestamp with time zone', 'timestamp without time zone',
    'tsquery', 'tsvector', 'txid_snapshot', 'user-defined', 'uuid', 'xml'
];

/**
 * Allowed column attributes and validations.
 * @type {{name: *, default: *, allowNull: *, type: *, special: *, length: *, precision: *, scale: *, arrayType: *, arrayDimension: *, description: *, isAutoIncrement: *, table: *}}
 */
var columnAttributes = {
    name                : joi.string().required(),
    default             : joi.string().allow(null),
    allowNull           : joi.boolean().default(false),
    type                : joi.string().valid(allowedTypes).required(),
    special             : joi.string().allow(null),
    length              : joi.number().integer().allow(null),
    precision           : joi.number().integer().allow(null),
    scale               : joi.number().integer().allow(null),
    arrayType           : joi.string().valid(allowedTypes).allow(null),
    arrayDimension      : joi.number().integer().allow(null),
    udType              : joi.string().allow(null),
    description         : joi.string().allow(null),
    table               : joi.object().required()
};

/**
 * @class
 * @param {Object} args - Column arguments
 * @param {string} args.name - Name of the column
 * @param {string} [args.default] - Default value of the column
 * @param {boolean} args.allowNull - Is this column allowed to contain null values?
 * @param {string} args.type - Data type of the column.
 * @param {string} [args.special] - Special attributes of the column.
 * @param {number} [args.length] - Length of the column.
 * @param {number} [args.precision] - Precision of the column.
 * @param {number} [args.scale] - Scale of the column.
 * @param {string} [args.arrayType] - If column is array. Data type of the array.
 * @param {number} [args.arrayDimension] - array dimension of the column.
 * @param {string} [args.udType] - User defined type of the column if the column type is user defined
 * @param {String} [args.description] - Description of the table
 * @param {Table} args.table - {@link Table} of the class
 * @param {Object} [options] - Options
 * @param {boolean} [options.allowUnknown = true] - If true, unknown parameters passed to constructor does not throw error while creating object.
 */
var Column = function Column(args, options) {
    var attr, validation;
    if (!args) { throw new Error('column arguments are required.'); }
    options = lodash.defaults(options || {}, { abortEarly: false, allowUnknown: false });
    validation = joi.validate(args, joi.object().keys(columnAttributes).required(), options);
    if (validation.error) {
        throw new Error('Error in function arguments while trying to create "' + args.name + '" column. ' + validation.error + '. Arguments: ' + util.inspect(args, { depth: null }));
    }
    attr                        = args;
    attr.isAutoIncrement        = (attr.default && attr.default.toLowerCase().indexOf('nextval') !== -1) ? true : false;
    attr.parent                 = attr.table;
    internal(this).attributes   = attr;
};


/**
 * @method
 * @param {string} [value] - New value
 * @returns {string}
 */
Column.prototype.name = helper.accessor('name');
/**
 * Gets full name of the object in database . notation.
 */
Column.prototype.fullName = helper.objectFullName();
/**
 * Returns default value with type cast.
 * @method
 * @param {string} [value] - New value
 * @returns {string}
 */
Column.prototype.defaultWithTypeCast = helper.accessor('default');

/**
 * Returns default value without type cast.
 * @method
 * @param {string} [value] - New value
 * @returns {string}
 * @example
 * var column = db('crm').schema('public').table('contact').column('name');
 * console.log(column.defaultWithTypeCast());  // 'George'::character varying
 * console.log(column.default());              // George
 */
Column.prototype.default = function (value) {
    if (arguments.length > 0) {
        this.defaultWithTypeCast(value);
    }
    var result = this.defaultWithTypeCast();
    if (result !== undefined && result !== null) {
        result = result.replace(/^('.+?')::.+$/, '$1');
    }
    return result;
};

/**
 * @method
 * @param {boolean} [value] - New value
 * @returns {boolean}
 */
Column.prototype.allowNull = helper.accessor('allowNull');
/**
 * @method
 * @param {string} [value] - New value
 * @returns {string}
 */
Column.prototype.type = helper.accessor('type');
/**
 * @method
 * @param {string} [value] - New value
 * @returns {string}
 */
Column.prototype.special = helper.accessor('special');
/**
 * @method
 * @param {integer} [value] - New value
 * @returns {integer}
 */
Column.prototype.length = helper.accessor('length');
/**
 * @method
 * @param {integer} [value] - New value
 * @returns {integer}
 */
Column.prototype.precision = helper.accessor('precision');
/**
 * @method
 * @param {integer} [value] - New value
 * @returns {integer}
 */
Column.prototype.scale = helper.accessor('scale');
/**
 * @method
 * @param {string} [value] - New value
 * @returns {string}
 */
Column.prototype.arrayType = helper.accessor('arrayType');
/**
 * @method
 * @param {integer} [value] - New value
 * @returns {integer}
 */
Column.prototype.arrayDimension = helper.accessor('arrayDimension');
/**
 * @method
 * @param {string} [value] - New value
 * @returns {string}
 */
Column.prototype.description = helper.accessor('description');
/**
 * @method
 * @param {boolean} [value] - New value
 * @returns {boolean}
 */
Column.prototype.isAutoIncrement = helper.accessor('isAutoIncrement');
/**
 * @method
 * @param {boolean} [value] - New value
 * @returns {boolean}
 */
Column.prototype.isPrimaryKey = helper.accessor('isPrimaryKey');
/**
 * @method
 * @param {boolean} [value] - New value
 * @returns {boolean}
 */
Column.prototype.isForeignKey = helper.accessor('isForeignKey');
/**
 * @method
 * @param {Table} [value] - New value
 * @returns {Table}
 */
Column.prototype.referencesColumn = helper.accessor('referencesColumn');
/**
 * @method
 * @param {string} [value] - New value
 * @returns {string}
 */
Column.prototype.onUpdate = helper.accessor('onUpdate');
/**
 * @method
 * @param {string} [value] - New value
 * @returns {string}
 */
Column.prototype.onDelete = helper.accessor('onDelete');
/**
 * @method
 * @param {string} [value] - New value
 * @returns {string}
 */
Column.prototype.unique = helper.accessor('unique');
/**
 * @method
 * @param {Table} [value] - New value
 * @returns {Table}
 */
Column.prototype.table = helper.accessor('table');
/**
 * @method
 * @param {Table} [value] - New value
 * @returns {Table}
 */
Column.prototype.parent = Column.prototype.table;
/**
 * Gets/sets foreign key constraint of the column, if column is a foreign key.
 * @method
 * @param {Constraint} [value] - New value
 * @returns {Constraint}
 */
Column.prototype.foreignKeyConstraint = helper.accessor('foreignKeyConstraint');

/**
 * Gets/sets user defined type of the column, if column is a user defined type.
 * @method
 * @param {string} [value] - New value
 * @returns {string}
 */
Column.prototype.udType = helper.accessor('udType');


/**
 * Returns Sequelize ORM datatype for column.
 * @param {String} [varName = DataTypes] - Variable name to use in sequelize data type. ie. 'DataTypes' for DataTypes.INTEGER
 * @returns {string}
 * @example
 * var typeA = column.sequelizeType();              // DataTypes.INTEGER(3)
 * var typeB = column.sequelizeType('Sequelize');   // Sequelize.INTEGER(3)
 */
Column.prototype.sequelizeType = function (varName) {
    varName         = varName || 'DataTypes';       // DataTypes.INTEGER etc. prefix
    var type        = sequelizeTypes[internal(this).attributes.type].type,
        isObject    = type && type.indexOf('.') !== -1,             // . ile başlıyorsa değişkene çevirmek için
        details,
        isArrayTypeObject;
    if (isObject) { type = varName + type; }

    details = function (num1, num2) {
        var detail = '';
        if (num1 >= 0 && num1 !== null && num2 && num2 !== null) {
            detail = '(' + num1 + ',' + num2 + ')';         // (5,2)
        } else if (num1 >= 0 && num1 !== null) {
            detail = '(' + num1 + ')';                      // (5)
        }
        return detail;
    };

    if (internal(this).attributes.arrayDimension >= 1) {
        isArrayTypeObject = sequelizeTypes[internal(this).attributes.arrayType].type.indexOf('.') !== -1;
        type += '(';
        if (internal(this).attributes.arrayDimension > 1) { type += new Array(internal(this).attributes.arrayDimension).join(varName + '.ARRAY('); } // arrayDimension -1 tane 'ARRAY(' yaz
        type += isArrayTypeObject ? varName : "'";
        type += sequelizeTypes[internal(this).attributes.arrayType].type;
        type += isArrayTypeObject ? '' : "'";
    }

    type += details(internal(this).attributes.precision, internal(this).attributes.scale);
    type += details(internal(this).attributes.length);

    if (internal(this).attributes.arrayDimension >= 1) {
        type += new Array(internal(this).attributes.arrayDimension + 1).join(')'); // arrayDimension -1 tane ) yaz
    }

    if (!isObject) { type = "'" + type + "'"; }
    return type;
};


module.exports = function (args, options) {
    return new Column(args, options);
};
