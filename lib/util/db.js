/**
 * @author Özüm Eldoğan
 */
/*jslint node: true */
"use strict";

var joi             = require('joi');
var lodash          = require('lodash');
var schema          = require('./schema.js');
var util            = require('util');
var helper          = require('./helper.js');

/**
 * Returns object to get/set internal properties of an object.
 * @function internal
 * @private
 * @returns {object}
 */
var internal        = helper.internal;

var dbAttributes = {
    name    : joi.string().required()
};


/**
 * @class
 * @param {Object} args - Database arguments.
 * @param {String} args.name - Name of the database.
 * @param {Object} [options] - Options
 * @param {boolean} [options.allowUnknown = true] - If true, unknown parameters passed to constructor does not throw error while creating object.
 */
var DB = function DB(args, options) {
    var attr, validation;
    if (!args) { throw new Error('DB arguments are required.'); }
    options = lodash.defaults(options || {}, { abortEarly: false, allowUnknown: false });
    validation = joi.validate(args, joi.object().keys(dbAttributes), options);
    if (validation.error) {
        throw new Error('Error in function arguments while trying to create "' + args.name + '" DB. ' + validation.error + '\n' + util.inspect(args, { depth: null }));
    }

    attr            = args;
    attr.schemas    = {};

    internal(this).attributes = attr;
};

/**
 * Returns name of the db
 * @method
 * @param {string} [value] - New value
 * @returns {string}
 */
DB.prototype.name = helper.accessor('name');

/**
 * Gets full name of the object in database . notation.
 */
DB.prototype.fullName = helper.objectFullName();

/**
 * Adds schema to the schema and returns schema created newly.
 * @method
 * @param { Schema | object } args - Schema object or general object to create column object
 * @param {string} args.name - Name of the schema.
 * @returns { Schema }
 * @throws Will throw if existing schema tried to be added.
 */
DB.prototype.addSchema = helper.addObject('schemas', null, schema, 'db');

/**
 * Returns the {@link Schema} object with given name.
 * @method
 * @param {string} name - Name of the schema
 * @returns {Schema}
 */
DB.prototype.schema = helper.getObject('schemas', null);

/**
 * @callback schemaCallback
 * @param {Schema} schema - Schema object
 */

/**
 * Retrieves all schemas in the schema. If callback is provided, it is executed for each schema. Callback is passed {@link Schema}
 * object as parameter. If no callback is provided, returns a plain object. Object keys are schema names,
 * values are {@link Schema} objects.
 * @method
 * @param {schemaCallback} [callback] - Callback to be executed for each schema.
 * @returns {object.<string, Schema> | undefined}
 */
DB.prototype.schemas = helper.objectsByName('schemas');

module.exports = function (args, options) {
    return new DB(args, options);
};
