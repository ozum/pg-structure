/**
 * @author Özüm Eldoğan
 */
/*jslint node: true, regexp: true */
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
    name: joi.string().required()
};


/**
 * @class
 * @param {Object} args - Database arguments.
 * @param {String} args.name - Name of the database.
 * @param {Object} [options] - Options
 * @param {array|string} [options.schemas] - Requested schemas. Information purposes only.
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
    attr.options    = options;

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
 * @throws  Will throw error if schema does not exists.
 * @returns {Schema}
 */
DB.prototype.schema = helper.getObject('schemas', null, { before: function (name) {
    /*jshint validthis:true */
    if (!this.schemaExist(name) && !this.schemaIncluded(name)) { throw new Error('Schema "' + name + '" does not exist. This schema is also not in the options. Requested schemas are: [' + this.includedSchemas() + ']. Perhaps you forget to add it to options.'); }
}});

/**
 * Shortcut function which returns object based on path.
 * @param {string} path - Database path of the requested item.
 * @returns {Schema|Table|Column}
 * @example
 * var schema = db.get('public'),                   // Returns public schema.
 *     table  = db.get('public.contact'),           // Returns contact table in public schema.
 *     column = db.get('public.contact.name');      // Returns name column of the contact table in public schema.
 */
DB.prototype.get = function (path) {
    var parts   = path.split('.'),
        schema  = parts.shift();
    return parts.length === 0 ? this.schema(schema) : this.schema(schema).get(parts.join('.'));
};

/**
 * Returns true if object with given name exist.
 * @method
 * @param {string} name - Name of the schema
 * @returns {boolean}
 */
DB.prototype.schemaExist = helper.objectExist('schemas', null);

/**
 * Returns if given schema is one of the requested schemas to be parsed.
 * @param {string} schemaName - Name of the schema to check
 * @returns {boolean}
 */
DB.prototype.schemaIncluded = function (schemaName) {
    return this.includedSchemas().indexOf(schemaName) !== -1;
};

/**
 * Returns the list of requested schemas to be parsed.
 * @returns {Array}
 */
DB.prototype.includedSchemas = function () {
    return lodash.isArray(internal(this).attributes.options.schemas) ? internal(this).attributes.options.schemas : [internal(this).attributes.options.schemas];
};

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
