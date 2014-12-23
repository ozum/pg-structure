/**
 * @module pg-structure
 * @author Özüm Eldoğan
 */

/*jslint node: true */
"use strict";

var lodash  = require('lodash');
var joi     = require('joi');
var pg      = require('pg');
var async   = require('async');
var sql     = require('../sql');
var DB      = require('./util/db.js');

/**
 * Callback to handle database structure object.
 *
 * @callback exportCallback
 * @param {Object.<string,Object.<table>>} Structure object of the database.
 */

/**
 * Callback to handle next.
 * @private
 * @callback nextCallback
 * @param {Object.<string,Object.<table>>} Structure object of the database.
 */

/**
 * Creates a Structure.
 * @class
 * @private
 */
var Structure = function (host, database, username, password, options) {
    options                 = options || {};
    var port                = options.port || 5432,
        schemas             = options.schema || 'public',
        conString           = 'postgres://' + username + ':' + password + '@' + host + ':' + port + '/' + database, // 'postgres://user:pass@host:port/db'
        db                  = DB({ name: database }, { schemas: schemas });

    if (!lodash.isArray(schemas)) { schemas = [schemas]; }      // In SQL query it is used as: schemas = ANY($1) -- pg expects Array for ANY()


    /**
     * Processes result of the schema SQL 
     * @private
     * @param {Object} dbResult - Result of the pg module query.
     * @param {nextCallback} next - Callback to execute after this function finishes its job.
     */
    function processSchemas(dbResult, next) {
        var i, error;
        try {
            for (i = 0; i < dbResult.rows.length; i = i + 1) {
                db.addSchema({name: dbResult.rows[i].schemaName});
            }
        } catch (err) {
            error = err;
        }
        next(error);
    }

    /**
     * Processes result of the table SQL
     * @private
     * @param {Object} dbResult - Result of the pg module query.
     * @param {nextCallback} next - Callback to execute after this function finishes its job.
     */
    function processTables(dbResult, next) {
        var i, row, error;
        try {
            for (i = 0; i < dbResult.rows.length; i = i + 1) {
                row = dbResult.rows[i];
                db.schema(row.schemaName).addTable({
                    name        : row.tableName,
                    description : row.tableDescription
                });
            }
        } catch (err) {
            error = err;
        }
        next(error);
    }

    /**
     * Processes result of the column SQL
     * @private
     * @param {Object} dbResult - Result of the pg module query.
     * @param {nextCallback} next - Callback to execute after this function finishes its job.
     */
    function processColumns(dbResult, next) {
        var row, table, i, error;
        try {
            for (i = 0; i < dbResult.rows.length; i = i + 1) {
                row = dbResult.rows[i];
                table = db.schema(row.schemaName).table(row.tableName);
                table.addColumn({
                    name: row.name,
                    default: row.default,
                    allowNull: row.allowNull,
                    type: row.type,
                    enumValues: row.enumValues,
                    length: row.length,
                    precision: row.precision,
                    scale: row.scale,
                    arrayType: row.arrayType,
                    arrayDimension: row.arrayDimension,
                    udType: row.udType,
                    description: row.description
                });
            }
        } catch (err) {
            error = err;
        }
        next(error);
    }

    /**
     * Processes result of the constraint SQL
     * @private
     * @param {Object} dbResult - Result of the pg module query.
     * @param {nextCallback} next - Callback to execute after this function finishes its job.
     */
    function processConstraints(dbResult, next) {
        var row, column, i, error;

        try {
            for (i = 0; i < dbResult.rows.length; i = i + 1) {
                row = dbResult.rows[i];
                column = db.schema(row.tableSchema).table(row.tableName).column(row.columnName);
                if (row.constraintType === 'PRIMARY KEY') {
                    column.isPrimaryKey(true);
                } else if (row.constraintType === 'UNIQUE') {
                    column.unique(row.constraintName);
                }
            }
        } catch (err) {
            error = err;
        }
        next(error);
    }

    /**
     * Processes result of the foreigin key SQL
     * @private
     * @param {Object} dbResult - Result of the pg module query.
     * @param {nextCallback} next - Callback to execute after this function finishes its job.
     */
    function processForeignKeys(dbResult, next) {
        var row, table, i, error;
        try {
            for (i = 0; i < dbResult.rows.length; i = i + 1) {
                row = dbResult.rows[i];
                if (db.schemaIncluded(row.foreignSchemaName)) { // Schema should be included in the schemas to be parsed.
                    table = db.schema(row.tableSchema).table(row.tableName);

                    table.addForeignKey({
                        constraintName      : row.constraintName,
                        columnName          : row.columnName,
                        foreignSchemaName   : row.foreignSchemaName,
                        foreignTableName    : row.foreignTableName,
                        foreignColumnName   : row.foreignColumnName,
                        onUpdate            : row.onUpdate,
                        onDelete            : row.onDelete
                    });
                }
            }
        } catch (err) {
            error = err;
        }
        next(error);
    }


    /**
     * Processes result of the index SQL
     * @private
     * @param {Object} dbResult - Result of the pg module query.
     * @param {nextCallback} next - Callback to execute after this function finishes its job.
     */
    function processIndexes(dbResult, next) {
        var row, i, j, table, columnNames, error;
        try {
            for (i = 0; i < dbResult.rows.length; i = i + 1) {
                row = dbResult.rows[i];
                table = db.schema(row.schema).table(row.tableName);
                if (row.unique) {
                    // String {name,surname} to Array ['name','surname']
                    columnNames = row.columnNames.substr(1, row.columnNames.length - 2).split(',');
                    for (j = 0; j < columnNames.length; j = j + 1) {
                        table.column(columnNames[j]).unique(row.name);
                    }
                }
            }
        } catch (err) {
            error = err;
        }

        next(error);
    }


    /**
     * Generates the structure object and executes callback.
     * @private
     * @param callback
     */
    this.generate = function (callback) {
        pg.connect(conString, function (err, client, done) {
            if (err) { callback(new Error('error fetching client from pool.', err)); }

            async.waterfall([
                client.query.bind(client, sql.schema, [schemas]),
                processSchemas,

                client.query.bind(client, sql.table, [schemas]),
                processTables,

                client.query.bind(client, sql.column, [schemas]),
                processColumns,

                client.query.bind(client, sql.constraint, [schemas]),
                processConstraints,

                client.query.bind(client, sql.foreignKey, [schemas]),
                processForeignKeys,

                client.query.bind(client, sql.index, [schemas]),
                processIndexes

            ], function (err) {
                done();
                callback(err, db);
            });
        });
    };


};



/**
 * Exports a PostgreSQL schema as a detailed object. Please see {@link DB} object for callback argument that you
 * will get as a result.
 *
 * @param {String} host - Hostname of the database.
 * @param {String} database - Database name
 * @param {String} username - Username for connecting to db.
 * @param {String} password - Password to connecting to db.
 * @param {Object} options - Options
 * @param {Array|String} [options.schema='public'] - Schema(s) of the database.
 * @param {number} [options.port=5432] - Connection port of the database server.
 * @param {exportCallback} callback - Callback to handle database structure object.
 * @throws Will throw error if parameters are not valid.
 * @example
 * var pgs     = require('pg-structure');
 * var util    = require('util');
 * pgs('127.0.0.1', 'node', 'user', 'password', { schema: ['public', 'other_schema'] }, function (err, db) {
 *     if (err) { throw err; }
 *     console.log(db.schema('public').name());
 *
 *     // Callback style
 *     db.schema('public').tables(function (table) {
 *         console.log(table.name());
 *     });
 *
 *     // Array Style
 *     console.log(schema('public').tables());
 *
 *     // Long access chain:
 *     // public schema -> cart table -> contact_id columns -> foreign key constraint of contact_id
 *     // -> table of the constraint -> name of the referenced table
 *     console.log(db.schema('public').table('cart').column('contact_id').foreignKeyConstraint().referencesTable().name());
 * });
 */
module.exports = function (host, database, username, password, options, callback) {
    var validation, structure, error;
    validation = joi.validate(arguments, {
        0: joi.string().required().label('host'),
        1: joi.string().required().label('database'),
        2: joi.string().required().label('username'),
        3: joi.string().required().label('password'),
        4: joi.object().keys({
            port: joi.number().label('port'),
            schema: joi.alternatives().try(joi.array(), joi.string()).label('schema')
        }).required().label('options'),
        5: joi.func().required().label('callback')
    });
    if (validation.error) {
        error = new Error(validation.error + '.');
        if (lodash.isFunction(callback)) {callback(error); } else { throw error; }
        return;
    }
    structure = new Structure(host, database, username, password, options);
    structure.generate(callback);       // callback(result AS JSON)
};