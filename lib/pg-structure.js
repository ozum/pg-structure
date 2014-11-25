/**
 * @module pg-structure
 * @author Özüm Eldoğan
 */

/*jslint node: true */
"use strict";

var lodash  = require('lodash');
var sql     = require('../sql');
var pg      = require('pg');
var async   = require('async');
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
        db                  = DB({ name: database });

    /**
     * Processes result of the column SQL and populates result object.
     * @private
     * @param {Object} dbResult - Result of the pg module query.
     * @param {nextCallback} next - Callback to execute after this function finishes its job.
     */
    function processColumns(dbResult, next) {
        var row, table, schema, i;
        for (i = 0; i < dbResult.rows.length; i = i + 1) {
            row     = dbResult.rows[i];
            schema  = db.addSchema({name: row.schemaName });
            table   = schema.addTable({
                name        : row.tableName,
                description : row.description
            });
            table.addColumn({
                name            : row.name,
                default         : row.default,
                allowNull       : row.allowNull,
                type            : row.type,
                special         : row.special,
                length          : row.length,
                precision       : row.precision,
                scale           : row.scale,
                arrayType       : row.arrayType,
                arrayDimension  : row.arrayDimension,
                description     : row.description
            });
        }
        next();
    }

    /**
     * Processes result of the constraint SQL and populates result object.
     * @private
     * @param {Object} dbResult - Result of the pg module query.
     * @param {nextCallback} next - Callback to execute after this function finishes its job.
     */
    function processConstraints(dbResult, next) {
        var row, column, i;

        for (i = 0; i < dbResult.rows.length; i = i + 1) {
            row = dbResult.rows[i];
            column = db.schema(row.tableSchema).table(row.tableName).column(row.columnName);
            if (row.constraintType === 'PRIMARY KEY') {
                column.isPrimaryKey(true);
            } else if (row.constraintType === 'UNIQUE') {
                column.unique(row.constraintName);
            }
        }
        next();
    }

    /**
     * Processes result of the foreigin key SQL and populates result object.
     * @private
     * @param {Object} dbResult - Result of the pg module query.
     * @param {nextCallback} next - Callback to execute after this function finishes its job.
     */
    function processForeignKeys(dbResult, next) {
        var row, table, i;

        for (i = 0; i < dbResult.rows.length; i = i + 1) {
            row = dbResult.rows[i];
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
        next();
    }


    /**
     * Processes result of the index SQL and populates result object.
     * @private
     * @param {Object} dbResult - Result of the pg module query.
     * @param {nextCallback} next - Callback to execute after this function finishes its job.
     */
    function processIndexes(dbResult, next) {
        var row, i, j, table, columnNames;
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
        next();
    }


    /**
     * Generates the structure object and executes callback.
     * @private
     * @param callback
     */
    this.generate = function (callback) {
        pg.connect(conString, function (err, client, done) {
            if (err) { return console.error('error fetching client from pool', err); }

            async.waterfall([
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
 * @example
 * var pgs     = require('pg-structure');
 * var util    = require('util');
 * pgs('127.0.0.1', 'node', 'user', 'password', { schema: ['public', 'other_schema'] }, function (err, db) {
 *     console.log(db.schema('public').name());
 *         db.schema('public').tables(function (table) {
 *             console.log(table.name());
 *         });
 *     console.log(db.schema('public').table('cart').column('contact_id').foreignKeyConstraint().referencesTable().name());
 * });

 */
module.exports = function (host, database, username, password, options, callback) {
    var structure = new Structure(host, database, username, password, options);
    structure.generate(callback);       // callback(result AS JSON)
};