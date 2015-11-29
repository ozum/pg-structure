/**
 * Exports a function which returns a promise. Promise is resolved with LokiJS database object. Object
 * has collections named after camelized sql file names without extension.
 * @module executeSqlFiles
 * @private
 * @author Özüm Eldoğan
 * @example
 * var executeSQLFiles = require('./sql/execute-sql-files');
 * executeSQLFiles(client, ['public'])
 *     .then((result) => {
 *         console.log(result.getCollection('table').find({fullName: 'public.account'}));       // table.sql query result
 *     })
 *     .catch((err) => {
 *         console.log(err);
 *         client.end();
 *     });
 */
'use strict';
try {
    var pg  = require('pg').native;
} catch (err) {
    pg      = require('pg');
}

var inflection          = require('inflection');
var readSQLFiles        = require('./read-sql-files');
var Loki                = require('lokijs');
var DB                  = require('../lib/db');
var Schema              = require('../lib/schema');
var Table               = require('../lib/table');
var Column              = require('../lib/column');
var Constraint          = require('../lib/constraint');
var RelationFabricator  = require('../lib/util/relation-fabricator.js');
var Index               = require('../lib/index.js');

var config = {
    db: {
        collection: 'db',
        uniqueIndex: 'fullCatalogName',
        inflator: DB,
        skipParameters: true
    },
    schema:{
        collection: 'schema',
        uniqueIndex: 'fullCatalogName',
        indices: [],
        inflator: Schema
    },
    table: {
        collection: 'table',
        uniqueIndex: 'fullCatalogName',
        indices: [],
        inflator: Table
    },
    column: {
        collection: 'column',
        uniqueIndex: 'fullCatalogName',
        indices: [],
        inflator: Column
    },
    referentialConstraint: {
        collection: 'referentialConstraint',
        indices: ['leftJoinConstraintFullCatalogName', 'rightJoinConstraintFullCatalogName'],
        inflator: RelationFabricator
    },
    constraintColumn: {
        collection: 'constraintColumn',
        indices: ['columnFullCatalogName', 'constraintFullCatalogName', 'referencedColumnFullCatalogName']
    },
    constraint: {
        collection: 'constraint',
        uniqueIndex: 'fullCatalogName',
        indices: ['tableFullCatalogName'],
        inflator: Constraint
    },
    index: {
        collection: 'index',
        uniqueIndex: 'fullCatalogName',
        indices: ['tableFullCatalogName'],
        inflator: Index
    },
    indexColumn: {
        collection: 'indexColumn',
        indices: ['columnFullCatalogName', 'indexFullCatalogName', 'tableFullCatalogName']
    }
};

/**
 *
 * @param {Object}          client          - pg client object.
 * @param {string}          sql             - SQL query to execute.
 * @param {Array.<string>}  schemas         - PostgreSQL schemas to execute queries against. ie. 'public'
 * @param {Loki}            loki            - Loki database.
 * @param {string}          type            - Query type from config.
 * @returns {Promise.<Array.<Object>>}      - Returns a proimse which is resolved with an array of query result rows.
 */
function executeSQL(client, sql, schemas, loki, type) {
    return new Promise((resolve, reject) => {
        let insertOrder = 0;
        let query       = config[type].skipParameters ? client.query(sql) : client.query(sql, [schemas]);
        let collection  = createCollection(loki, type);

        query.on('row', (row) => {
            insertIntoCollection(loki, collection, row, type, insertOrder);
            insertOrder++;
        });
        query.on('end', resolve);
        query.on('error', (error) => { reject(new Error(error)); });
    });
}

/**
 * Creates loki collection with given name. Also creates indices and unique indices as necessary based on config.
 * @param {Loki}                loki    - Loki database.
 * @param {string}              type    - Collection name to be created.
 * @returns {Loki.Collection}           - Loki collection.
 */
function createCollection(loki, type) {
    let collection = loki.addCollection(config[type].collection, { indices: config[type].indices });
    if (config[type].uniqueIndex) collection.ensureUniqueIndex(config[type].uniqueIndex);
    collection.ensureUniqueIndex('insertOrder');
    return collection;
}

/**
 * Inserts given data into Loki collection. Creates some additional data and stores them in object as below:
 * * Creates object and stores it in `object` key.
 * * Stores given insert order in `insertOrder` key.
 * @param {Loki}                loki        - Loki database.
 * @param {Loki.Collection}     collection  - Loki collection to insert record.
 * @param {Object}              data        - Data to insert
 * @param {string}              type        - Type of data from config.
 * @param {number}              insertOrder - Order number of the inserted record.
 * @returns {Loki.Collection.document}      - Inserted Loki record
 */
function insertIntoCollection(loki, collection, data, type, insertOrder) {
    let document = collection.insert(data);
    let Inflator = config[type].inflator;

    if (Inflator) document.object = new Inflator({ registry: loki, attributes: document });

    document.insertOrder = insertOrder || 0;

    return document;
}

/**
 * Tests if given object is a pg client or not.
 * @param {Object|pg.client} pgOptions  - Pg client or Connection parameters.
 * @returns {boolean}                   - `true` if given object is a pg client.
 */
function isPgClient(pgOptions) {
    // If it has a query method, assume it is a pg client.
    return typeof pgOptions.query === 'function';
}

/**
 * Returns pg client. If given object is already pg client returns it directly, otherwise creates pg object
 * based on given options.
 * @param {Object|pg.client} pgOptions  - Pg client or Connection parameters.
 * @returns {Promise.<pg.client>}       - Promise resolved with pg client as parameter.
 */
function getClient(pgOptions) {
    return new Promise((resolve, reject) => {
        if (isPgClient(pgOptions)) return resolve(pgOptions);
        let client = new pg.Client(pgOptions);

        client.connect((err) => {
            if (err) return reject(new Error(err));
            return resolve(client);
        });
    });
}

/**
 * Converts dashed filename such as 'constraint-column' to camelCased type such as 'constraintColumn'.
 * @param {string} filename - File name to convert.
 * @returns {string}        - Resulting type name.
 */
function fileNameToType(filename) {
    let type = filename.replace(/-/g, '_');
    return inflection.camelize(type, true);
}

/**
 * Executes all SQL queries and creates a Loki.js database from them. Returns a promise which resolved with created
 * Loki database.
 * @param {Object|pg.client}    pgOptions   - Pg client or Connection parameters.
 * @param {Array.<string>}      schemas     - PostgreSQL schemas to execute queries against. ie. 'public'
 * @returns {Promise.<Loki>}                - Returns a promise which is resolved with a LokiJS database object. Object
 *                                            has collections named after camelized sql file names without extension.
 */
function executeSQLFiles(pgOptions, schemas) {
    let client;

    return Promise.all([readSQLFiles(), getClient(pgOptions)])
        .then((result) => {
            let queries         = result[0];
            client              = result[1];
            let promises        = [];
            let loki            = new Loki();

            for (let name in queries) {
                if (queries.hasOwnProperty(name)) {
                    promises.push(executeSQL(client, queries[name], schemas, loki, fileNameToType(name)));
                }
            }

            return Promise.all(promises)
                .then(() => {
                    // End connection if created by this module.
                    if (!isPgClient(pgOptions)) client.end();
                    return loki;
                })
                .catch((err) => {
                    return Promise.reject(err);
                });
        })
        .catch((err) => {
            // End connection if created by this module and failure is after client is created.
            if (!isPgClient(pgOptions) && client !== undefined) client.end();
            return Promise.reject(err);
        });
}

module.exports = executeSQLFiles;
