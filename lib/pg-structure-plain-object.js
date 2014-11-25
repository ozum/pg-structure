/**
 * @module pg-structure-plain-object
 * @private
 * @author Özüm Eldoğan
 */

/*jslint node: true */
"use strict";

var lodash  = require('lodash');
var sql     = require('../sql');
var pg      = require('pg');
var async   = require('async');


/**
 * Callback to handle database structure object.
 *
 * @callback exportCallback
 * @param {Object.<string,Object.<table>>} Structure object of the database.
 */

/**
 * Callback to handle next.
 *
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
        schema              = options.schema || 'public',
        result              = {},
        defaultTableObject  = { columns: {}, columnsOrdered: [], primaryKeys: []},
        conString           = 'postgres://' + username + ':' + password + '@' + host + ':' + port + '/' + database; // 'postgres://user:pass@host:port/db'

    /**
     * Processes result of the column SQL and populates result object.
     * @param {Object} dbResult - Result of the pg module query.
     * @param {nextCallback} next - Callback to execute after this function finishes its job.
     */
    function processColumns(dbResult, next) {
        var column, table, i;

        for (i = 0; i < dbResult.rows.length; i = i + 1) {
            column = dbResult.rows[i];
            if (!result[column.tableName]) {
                result[column.tableName] = lodash.cloneDeep(defaultTableObject);
                result[column.tableName].description = column.tableDescription;
                result[column.tableName].name = column.tableName;
                result[column.tableName].schemaName = column.schemaName;
            }
            table = result[column.tableName];
            if (column.default && column.default.toLowerCase().indexOf('nextval') !== -1) { column.isAutoIncrement = true; }
            table.columns[column.name] = column;
            table.columnsOrdered.push(column);
            delete column.tableDescription;
            delete column.position;
        }
        next();
    }

    /**
     * Processes result of the constraint SQL and populates result object.
     * @param {Object} dbResult - Result of the pg module query.
     * @param {nextCallback} next - Callback to execute after this function finishes its job.
     */
    function processConstraints(dbResult, next) {
        var constraint, table, column, i;

        for (i = 0; i < dbResult.rows.length; i = i + 1) {
            constraint = dbResult.rows[i];
            table = result[constraint.tableName];
            column = table.columns[constraint.columnName];

            column.constraintName = constraint.constraintName;

            if (constraint.constraintType === 'PRIMARY KEY') {
                table.primaryKeys.push(column);
                column.isPrimaryKey = true;
            } else if (!constraint.constraintType) {                                                                // Foreign Keys come from different query, which has not constraintType column
                if (!table.foreignKeys) { table.foreignKeys = {}; }                                                 // Init foreignKeys
                if (!table.foreignKeys[column.constraintName]) { table.foreignKeys[column.constraintName] = []; }   // Init constraintName
                table.foreignKeys[column.constraintName].push(column);
                column.isForeignKey = true;
                column.referencesSchema     = constraint.foreignSchemaName;
                column.referencesTable      = constraint.foreignTableName;
                column.referencesColumn     = constraint.foreignColumnName;
                column.onUpdate             = constraint.onUpdate;
                column.onDelete             = constraint.onDelete;
            } else if (constraint.constraintType === 'UNIQUE') {
                column.unique               = constraint.constraintName;
            }

        }
        next();
    }


    /**
     * Processes result of the index SQL and populates result object.
     * @param {Object} dbResult - Result of the pg module query.
     * @param {nextCallback} next - Callback to execute after this function finishes its job.
     */
    function processIndexes(dbResult, next) {
        var index, i, j, table, columnNames;
        for (i = 0; i < dbResult.rows.length; i = i + 1) {
            index = dbResult.rows[i];
            table = result[index.tableName];
            if (index.unique) {
                // String {name,surname} to Array ['name','surname'] sonra forEach
                columnNames = index.columnNames.substr(1, index.columnNames.length - 2).split(',');
                for (j = 0; j < columnNames.length; j = j + 1) {
                    table.columns[columnNames[j]].unique = index.name;
                }
            }
        }
        next();
    }

    /**
     * Calculates relations by examining result object.
     * @param {nextCallback} next - Callback to execute after this function finishes its job.
     */
    function processRelations(next) {
        var table, tableName, firstConstraint, secondConstraint, firstTable, secondTable;
        for (tableName in result) {
            if (result.hasOwnProperty(tableName) && result[tableName].foreignKeys) {
                table = result[tableName];

                for (firstConstraint in table.foreignKeys) {                                                // Process all foreign keys
                    if (table.foreignKeys.hasOwnProperty(firstConstraint)) {
                        firstTable = result[table.foreignKeys[firstConstraint][0].referencesTable];
                        if (!firstTable.hasMany) {
                            firstTable.hasMany = {};
                        }                                    // Init hasMany on table which references to this table
                        firstTable.hasMany[firstConstraint] = {                                                 // Add hasMany details
                            tableName       : tableName,
                            foreignKeys     : table.foreignKeys[firstConstraint],
                            constraintName  : firstConstraint
                        };

                        for (secondConstraint in table.foreignKeys) {                                                           // Process all foreign keys in inner loop for through relationships
                            if (table.foreignKeys.hasOwnProperty(secondConstraint) && firstConstraint !== secondConstraint) {   // Skip same
                                secondTable = result[table.foreignKeys[secondConstraint][0].referencesTable];

                                if (!firstTable.hasManyThrough) {
                                    firstTable.hasManyThrough = {};
                                }                  // Init hasManyThrough on table which references to this table
                                firstTable.hasManyThrough[firstConstraint] = {                                      // Add hasManyThrough details
                                    tableName       : secondTable.name,
                                    foreignKeys     : table.foreignKeys[firstConstraint],
                                    constraintName  : firstConstraint,
                                    through         : tableName
                                };
                            }
                        }
                    }

                }
            }
        }
        next();
    }

    /**
     * Generates the structure object and executes callback.
     * @param callback
     */
    this.generate = function (callback) {
        pg.connect(conString, function (err, client, done) {
            if (err) { return console.error('error fetching client from pool', err); }

            async.waterfall([
                client.query.bind(client, sql.column, [schema]),
                processColumns,

                client.query.bind(client, sql.constraint, [schema]),
                processConstraints,

                client.query.bind(client, sql.foreignKey, [schema]),
                processConstraints,

                client.query.bind(client, sql.index, [schema]),
                processIndexes,
                processRelations

            ], function (err) {
                done();
                callback(err, result);
            });
        });
    };


};


/**
 * A type which contains reference to a column object.
 * @typedef {object} columnRef
 */

/**
 * A type which contains name of a constraint.
 * @typedef {string} constraintName
 */

/**
 * @typedef table
 * @property {string} schemaName - Schema name of the table.
 * @property {string} name - Name of the table
 * @property {string} description - Table description. This description is defined in database.
 * @property {object} columns - An object which contains column names as keys, column details as values.
 * @property {string} columns.[columnName].name - Name of the database column
 * @property {string} columns.[columnName].default - Default value of the column
 * @property {boolean} columns.[columnName].allowNull - Is the column allowed to contain null values?
 * @property {string} columns.[columnName].type - Data type of the column. Data types has PostgreSQL long style names such as 'integer', 'timestamp without time zone', 'character varying' etc.
 * @property {string} columns.[columnName].special - Special attribute of the column.
 * @property {number} columns.[columnName].length - Length of the column.
 * @property {number} columns.[columnName].precision - Precision of the column. Used for data types such as numeric etc. Date and datetime types also has optional precision.
 * @property {number} columns.[columnName].scale - Scale of the column.
 * @property {string} columns.[columnName].arrayTpe - (If column data type is array) Indicates what kind of data type does this array contain.
 * @property {number} columns.[columnName].arrayDimension - (If column data type is array). Dimension of the array.
 * @property {string} columns.[columnName].description - Column description. This description is defined in database.
 * @property {boolean} columns.[columnName].isAutoIncrement - Is the column data type one of auto incremented types such as serial, bigserial etc.
 * @property {boolean} columns.[columnName].isPrimaryKey - Is the column a primary key?
 * @property {boolean} columns.[columnName].isForeignKey - Is the column a foreign key?
 * @property {string} columns.[columnName].constraintName - Primary/foreign key constraint name
 * @property {string} columns.[columnName].referencesTable - (If column is foreign key) Table name which this column refers to.
 * @property {string} columns.[columnName].referencesColumn - (If column is foreign key) Column name which this column refers to.
 * @property {string} columns.[columnName].onUpdate - (If column is foreign key) Action which will be taken on update.
 * @property {string} columns.[columnName].onDelete - (If column is foreign key) Action which will be taken on delete.
 * @property {string} columns.[columnName].unique - (NOT BOOLEAN) If this column is unique, unique index or part of combined unique index, this column contains name of the unique index name.
 * @property {string} columns.[columnName].tableName - Table name of the column.
 * @property {string} columns.[columnName].schemaName - Schema name of the column.
 * @property {array.<columnRef>} columnsOrdered - An array containing references to columns. Array has same order of columns with database table.
 * @property {array.<columnRef>} primaryKeys - An array containing references to primary key columns of the table.
 * @property {object.<constraintName, array.<columnRef>>} foreignKeys - An object containing constraint names as keys and array of foreign key field references as values.
 * @property {object.<constraintName, object>} hasMany - An array containing details about tables which this table has many of. (Other tables which references to this table)
 * @property {string} hasMany.[constraintName].tableName - Name of the table which references to this table.
 * @property {string} hasMany.[constraintName].constraintName - Constraint name
 * @property {array.<columnRef>} hasMany.[constraintName].foreignKeys - Array of references to foreign key column(s) of referencing table.
 * @property {object.<constraintName, object>} hasManyThrough - An array containing details about tables which this table has many of through many to many relationship. (Other tables which references to this table via many to many)
 * @property {string} hasMany.[constraintName].tableName - Name of the table which references to this table.
 * @property {string} hasMany.[constraintName].constraintName - Constraint name
 * @property {array.<columnRef>} hasMany.[constraintName].foreignKeys - Array of references to foreign key column(s) of referencing table.
 * @property {string} hasManyThrough.[constraintName].through - Many to many connection table name which has references to this table and other table.
 */

/**
 * Exports a PostgreSQL schema as a detailed object. Please see @see {@link table} object for callback argument that you
 * will get as a result.
 *
 * @param {String} host - Hostname of the database.
 * @param {String} database - Database name
 * @param {String} username - Username for connecting to db.
 * @param {String} password - Password to connecting to db.
 * @param {Object} options - Options
 * @param {String} [options.schema=public] - Schema of the database.
 * @param {number} [options.port=5432] - Connection port of the database server.
 * @param {exportCallback} callback - Callback to handle database structure object.
 * @example
 * var pg-structure = require('pg-structure');
 * var util         = require('util');
 * pg-structure('localhost', 'db', 'user', 'password', { schema: 'public', port: 5432 }, function(result) {console.log(util.inspect(result, {depth: null}));} );
 * pg-structure('localhost', 'db', 'user', 'password', {}, function(result) {console.log(JSON.stringify(result));} );
 */
module.exports = function (host, database, username, password, options, callback) {
    var structure = new Structure(host, database, username, password, options);
    structure.generate(callback);       // callback(result AS JSON)
};
