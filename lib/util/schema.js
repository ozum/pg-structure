/**
 * @author Özüm Eldoğan
 */
/*jslint node: true */
"use strict";

var joi             = require('joi');
var lodash          = require('lodash');
var table           = require('./table.js');
var util            = require('util');
var helper          = require('./helper.js');

/**
 * Returns object to get/set internal properties of an object.
 * @function internal
 * @private
 * @returns {object}
 */
var internal        = helper.internal;

/**
 * Allowed schema attributes and validations.
 * @type {{name: *, db: *}}
 */
var schemaAttributes = {
    name    : joi.string().required(),
    db      : joi.object().required()
};

/**
 * @class
 * @param {Object} args - Schema arguments.
 * @param {string} args.name - Name of the schema.
 * @param {DB} args.db - {@link DB} of the schema.
 * @param {Object} [options] - Options
 * @param {boolean} [options.allowUnknown = true] - If true, unknown parameters passed to constructor does not throw error while creating object.
 */
var Schema = function Schema(args, options) {
    var attr, validation;
    if (!args) { throw new Error('Schema arguments are required.'); }
    options = lodash.defaults(options || {}, { abortEarly: false, allowUnknown: false });
    validation = joi.validate(args, joi.object().keys(schemaAttributes), options);
    if (validation.error) {
        throw new Error('Error in function arguments while trying to create "' + args.name + '" schema. ' + validation.error + '\n' + util.inspect(args, { depth: null }));
    }

    attr                        = args;
    attr.tables                 = {};
    internal(this).attributes   = args;
};

/**
 * Returns name of the schema
 * @method
 * @param {string} [value] - New value
 * @returns {string}
 */
Schema.prototype.name = helper.accessor('name');

/**
 * Gets full name of the object in database . notation.
 */
Schema.prototype.fullName = helper.objectFullName();

/**
 * Retrieves {@link DB} object of the schema.
 * @method
 * @param {DB} [value] - New value
 * @returns {DB}
 */
Schema.prototype.db = helper.accessor('db');

/**
 * Retrieves {@link DB} object of the schema.
 * @method
 * @param {DB} [value] - New value
 * @returns {DB}
 */
Schema.prototype.parent = Schema.prototype.db;

/**
 * Adds table to the schema and returns table created newly.
 * @method
 * @private
 * @param { Table | object } args - Table object or general object to create column object
 * @param {String} args.name - Name of the table.
 * @param {String} [args.description] - Description of the table.
 * @returns { Table }
 */
Schema.prototype.addTable = helper.addObject('tables', null, table, 'schema');

/**
 * Returns the {@link Table} object with given name.
 * @method
 * @param {string} name - Name of the table
 * @returns {Table}
 */
Schema.prototype.table = helper.getObject('tables', null);

/**
 * @callback tableCallback
 * @param {Table} table - Table object
 */

/**
 * Retrieves all tables in the schema. If callback is provided, it is executed for each table. Callback is passed {@link Table}
 * object as parameter. If no callback is provided, returns a plain object. Object keys are table names,
 * values are {@link Table} objects.
 * @method
 * @param {tableCallback} [callback] - Callback to be executed for each table.
 * @returns {object.<string, Table> | undefined}
 */
Schema.prototype.tables = helper.objectsByName('tables');

module.exports = function (args, options) {
    return new Schema(args, options);
};
