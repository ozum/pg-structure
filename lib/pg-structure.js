'use strict';
/**
 * @module pgStructrue
 */

var executeSQLFiles = require('../sql/execute-sql-files');

/**
 * @param {Object|pg.client}    pgOptions                       - node-postgres client or connection parameters. Parameters passed directly to node-postgres. See it for details.
 * @param {string}              pgOptions.database              - Database name
 * @param {string}              [pgOptions.host=localhost]      - Hostname of the database.
 * @param {number}              [pgOptions.port=5432]           - Port of the database.
 * @param {string}              [pgOptions.user]                - Username for connecting to db.
 * @param {string}              [pgOptions.password]            - Password to connecting to db.
 * @param {boolean|Object}      [pgOptions.ssl=false]           - Pass the same options as tls.connect().
 * @param {Array.<string>}      [schemas=[public]]              - PostgreSQL schemas to be parsed.
 * @returns {Promise.<T>}                                       - Promise with signature ({@link DB}).
 */
var getDB = function getDB(pgOptions, schemas) {
    return executeSQLFiles(pgOptions, schemas || ['public'])
        .then((loki) => {
            return loki.getCollection('db').get(1).object;
        })
        .catch((err) => {
            return Promise.reject(err);
        });

};

module.exports = getDB;
