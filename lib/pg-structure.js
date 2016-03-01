'use strict';
/**
 * @module pgStructure
 */

let path        = require('path');
let fs          = require('fs');
let DB          = require('./db');
let Schema      = require('./schema');
let Table       = require('./table');
let Column      = require('./column');
let Index       = require('./index');
let Constraint  = require('./constraint');
let version     = require('../package.json').version;
let semver      = require('semver');
var JSZip       = require('jszip');

try {
    var pg  = require('pg').native || require('pg');
} catch (err) {
    pg      = require('pg');
}

let sqlDir      = path.join(__dirname, '../sql');

/**
 * node-postgres module client.
 * @external pg#client
 * @see {@link https://github.com/brianc/node-postgres/wiki/Client}
 */

/**
 * PostgreSQL connection options which are passed directly to node-postgres.
 * @typedef {Object} pgOptions
 * @property {string}           database            - Database name
 * @property {string}           [host=localhost]    - Hostname of the database.
 * @property {number}           [port=5432]         - Port of the database.
 * @property {string}           [user]              - Username for connecting to db.
 * @property {string}           [password]          - Password to connecting to db.
 * @property {boolean|Object}   [ssl=false]         - Pass the same options as tls.connect().
 */

/**
 * Returns pg client. If given object is already pg client returns it directly, otherwise creates pg object
 * based on given options.
 * @param {Object|pg#client} pgOptions  - Pg client or Connection parameters.
 * @returns {Promise.<pg#client>}       - Promise resolved with pg client as parameter.
 * @private
 */
function getClient(pgOptions) {
    return new Promise((resolve, reject) => {
        if (typeof pgOptions.query === 'function') { // If it has a query method, assume it is a pg client.
            return resolve(pgOptions);
        }

        let client = new pg.Client(pgOptions);

        client.connect((err) => err ? reject(err) : resolve(client));
    });
}

/**
 * Executes given sql file and returns query object with events.
 * @param {string}                      file    - SQL file
 * @param {pg#client}                   client  - node-postgres client to query database.
 * @param {Array.<string>}              schemas - PostgreSQL schemas to be used in query.
 * @returns {Promise.<pg#client#query>}         - Query object with events: `row`, `end`, `error`
 * @private
 */
function executeSqlFile(file, client, schemas) {
    return new Promise((resolve, reject) => {
        fs.readFile(path.join(sqlDir, file), (err, sql) => err ? reject(err) : resolve(client.query(sql.toString(), [schemas])));
    });
}

/**
 * Adds tables and columns returned from sql query to given DB object.
 * @param   {pg#client#query}   query   - Query object.
 * @param   {DB}                db      - pg-structure DB object.
 * @returns {Promise}                   - Void.
 * @private
 */
function addTablesAndColumns(query, db) {
    return new Promise((resolve, reject) => {
        query.on('row', (row) => {
            // Create table if not exists.
            let schema = db.schemas.get(row.schema);
            let table = schema.tables.get(row.table)
                || schema.tables.set(row.table, new Table({ parent: schema, isPrimaryKey: false, name: row.table,
                    description: row.tableDescription })).get(row.table);

            row.parent = table;
            table.columns.set(row.name, new Column(row));
        });
        query.on('end', resolve);
        query.on('error', (error) => {
            reject(new Error(error));
        });
    });
}

/**
 * Adds indexes returned from sql query to given DB object.
 * @param   {pg#client#query}   query   - Query object.
 * @param   {DB}                db      - pg-structure DB object.
 * @returns {Promise}                   - Void.
 * @private
 */
function addIndexes(query, db) {
    return new Promise((resolve, reject) => {
        query.on('row', (row) => {
            let table = db.schemas.get(row.tableSchema).tables.get(row.tableName);

            // Add index to table if not exists
            let index = table.indexes.get(row.indexName)
                || table.indexes.set(row.indexName, new Index({ parent: table, name: row.indexName,
                    isUnique: row.isUnique, isPrimaryKey: row.isPrimaryKey })).get(row.indexName);

            index.columns.set(row.columnName, table.columns.get(row.columnName));
        });
        query.on('end', resolve);
        query.on('error', (error) => {
            reject(new Error(error));
        });
    });
}

/**
 * Adds constraints returned from sql query to given DB object.
 * @param   {pg#client#query}   query   - Query object.
 * @param   {DB}                db      - pg-structure DB object.
 * @returns {Promise}                   - Void.
 * @private
 */
function addConstraints(query, db) {
    return new Promise((resolve, reject) => {
        query.on('row', (row) => {
            let table               = db.schemas.get(row.tableSchema).tables.get(row.tableName);
            let referencedTable     = row.referencedTableName ? db.schemas.get(row.referencedTableSchema).tables.get(row.referencedTableName) : undefined;

            // Add constraint to table if not exists
            let constraint = table.constraints.get(row.constraintName)
                || table.constraints.set(row.constraintName, new Constraint({ schemaName: row.constraintSchema,
                    name: row.constraintName, type: row.constraintType, description: row.constraintDescription, onUpdate: row.updateRule,
                    onDelete: row.deleteRule, matchOption: row.matchOption,
                    table: table, parent: referencedTable })).get(row.constraintName);

            let column = row.columnName ? table.columns.get(row.columnName) : undefined;
            let referencedColumn = row.referencedColumnName ? referencedTable.columns.get(row.referencedColumnName) : undefined;

            if (column !== undefined) {
                constraint.columns.set(column.name, column);                                // Add column to constraint
            }

            if (referencedColumn !== undefined) {
                // Add referenced and referenced by column to constraint.
                // By conjunction: Different naming schema -> key: referencing column name, value: referenced column.
                // Aynı alan birden fazla FK içinde kullanılmış dolayısı ile başka tablolarda başka alanlara referens veriyor olabilir.
                // Bu alan bu FK içerisinde nereye referans veriyor tutabilmek için bu yöntem kullanılıyor.
                constraint.referencedColumnsBy.set(column.name, referencedColumn);
            }

        });
        query.on('end', resolve);
        query.on('error', (error) => {
            reject(new Error(error));
        });
    });
}

/**
 * Creates and returns {@link DB} instance by reverse engineering PostgreSQL database.
 * @param   {pgOptions|pg#client}       pgOptions               - node-postgres client or connection parameters. Parameters passed directly to node-postgres. See it for details.
 * @param   {string|Array.<string>}     [schemas=['public']]    - PostgreSQL schemas to be parsed.
 * @param   {Object}                    options                 - pg-structure options.
 * @param   {boolean}                   [options.cache=true]    - Use cache to memoize calculated results.
 * @returns {Promise.<DB>}                                      - {@link DB}.
 * @example
 * var pgStructure = require('pg-structure');
 *
 * pgStructure({database: 'db', user: 'user', password: 'password'}, ['public', 'other_schema'])
 *     .then((db) => { console.log( db.get('public.account').columns[0].name ); })
 *     .catch(err => console.log(err.stack));
 */
module.exports = function pgStructure(pgOptions, schemas, options) {
    schemas                 = Array.isArray(schemas) ? schemas.sort() : [schemas || 'public'];
    let db;
    let client;
    let isClient    = typeof pgOptions.query === 'function'; // If it has a query method, assume it is a pg client.

    return Promise.resolve()
        .then(() => isClient ? pgOptions : getClient(pgOptions))
        .then(c => {
            client = c;
            db = new DB({ name: pgOptions.database }, Object.assign({ cache: true }, options));
            for (let schema of schemas) { db.schemas.set(schema, new Schema({ parent: db, name: schema })); }
        })

        .then(() => executeSqlFile('column.sql', client, schemas))
        .then(query => addTablesAndColumns(query, db))

        .then(() => executeSqlFile('index.sql', client, schemas))
        .then(query => addIndexes(query, db))

        .then(() => executeSqlFile('constraint.sql', client, schemas))
        .then(query => addConstraints(query, db))

        .then(() => {
            if (!isClient) {
                client.end();
            }

            return db;
        });
};

/**
 * Saves given database structure to a disk file. If given file name ends with `.zip` extension, file will be saved as
 * compressed zip file.
 * @param   {string|undefined}  file    - File path to save database structure.
 * @param   {DB}                db      - {@link DB} object to save.
 * @returns {Promise.<string>}          - Serialized string.
 * @example
 * var pgStructure = require('pg-structure');
 *
 * pgStructure({database: 'db', user: 'user', password: 'password', host: 'localhost', port: 5432}, ['public', 'other_schema'])
 *     .then(db => pgStructure.save('./db.json', db))
 *     .catch(err => console.log(err.stack));
 */
module.exports.save = function save(file, db) {
    if (!(db && file)) {
        return Promise.reject(new Error('Path and DB object is required.'));
    }

    return new Promise((resolve, reject) => {
        let serialized = module.exports.serialize(db);

        if (path.extname(file) === '.zip') {
            let name = path.basename(file, '.zip') + '.json';
            let zip = new JSZip();
            zip.file(name, serialized);
            serialized = zip.generate({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 3 } });
        }

        fs.writeFile(file, serialized, err => err ? reject(err) : resolve(serialized));
    });
};

/**
 * Loads database structure from previously saved file. Much faster than getting structure from database.
 * If file is a zip file which contains a json file with same name as zip file, this function decompresses the file
 * automatically.<br/>
 * <img src="../../images/warning-24.png" style="margin-left: -26px;"> pgStructure cannot
 * load files saved by incompatible pg-structure module versions and returns `undefined`. In this case you should
 * fetch structure from database and create a new save file.
 * @param   {string}                    file    - File path to load db structure from.
 * @returns {Promise.<DB|undefined>}            - {@link DB} instance or `undefined` if saved file is generated with incompatible module version.
 * @example
 * var pgStructure = require('pg-structure');
 *
 * pgStructure.load('./db.json')
 *     .then(db => console.log(db.schemas[0].name))
 *     .catch(err => console.log(err.stack));
 */
module.exports.load = function load(file) {
    return new Promise((resolve, reject) =>
        fs.readFile(file, (err, data) => {
            if (err) { return reject(err); }

            if (path.extname(file) === '.zip') {
                let name = path.basename(file, '.zip') + '.json';
                data = new JSZip(data).file(name).asText();
            }

            resolve(module.exports.deserialize(data));
        }));
};

/**
 * Serializes database structure to make it possible to store or transfer.
 * @param   {DB}        db  - {@link DB} instance to serialize.
 * @returns {string}        - Serialized database structure.
 * @example
 * pgStructure({database: 'db', user: 'user', password: 'password', host: 'localhost', port: 5432}, ['public', 'other_schema'])
 *     .then(db => pgStructure.serialize(db))
 *     .then(data => console.log(data))
 *     .catch(err => console.log(err.stack));
 */
module.exports.serialize = function serialize(db) {
    let serialized = db.serialize();
    serialized.$pgStructureVersion = version;
    return JSON.stringify(serialized);
};

/**
 * Alias of {@link module:pgStructure.serialize). Serializes database structure to make it possible to store or transfer.
 * @function
 * @param   {DB}        db  - {@link DB} instance to serialize.
 * @returns {string}        - Serialized database structure.
 * @see {@link module:pgStructure.serialize)
 */
module.exports.toString = module.exports.serialize;

/**
 * Creates and returns {@link DB} instance using previously serialized string. <br/>
 * <img src="../../images/warning-24.png" style="margin-left: -26px;"> pgStructure cannot
 * deserialize incompatible pg-structure module versions and returns `undefined`. In this case you should fetch structure from database.
 * @param   {string} serializedDBJSON   - Serialized database structure to create {@link DB} instance from.
 * @returns {DB|undefined}              - {@link DB} instance. If serialized string is from incompatible module version, this is `undefined`
 * var pgStructure = require('pg-structure');
 *
 * pgStructure.deserialize('./db.json')
 *     .then(db => console.log(db.schemas[0].name)
 *     .catch(err => console.log(err.stack));
 */
module.exports.deserialize = function deserialize(serializedDBJSON) {
    let minimumVersion = '3.0.0';
    let serializedDB = JSON.parse(serializedDBJSON);

    let version = serializedDB.$pgStructureVersion;
    delete serializedDB.$pgStructureVersion;

    if (semver.lt(version, minimumVersion)) { return; } // Return undef if minimum save version requirement is not met.

    let db = new DB(serializedDB, serializedDB.options);

    // 1st pass: Deserialize schemas, tables, columns, indexes.
    for (let serializedSchema of serializedDB.schemas) {
        serializedSchema.parent = db;
        let schema = new Schema(serializedSchema);
        db.schemas.set(serializedSchema.name, schema);

        for (let serializedTable of serializedSchema.tables) {
            serializedTable.parent = schema;
            let table = new Table(serializedTable);
            schema.tables.set(serializedTable.name, table);

            for (let serializedColumn of serializedTable.columns) {
                serializedColumn.parent = table;
                let column = new Column(serializedColumn);
                table.columns.set(serializedColumn.name, column);
            }

            for (let serializedIndex of serializedTable.indexes) {
                serializedIndex.parent = table;
                let index = new Index(serializedIndex);

                for (let indexColumnName of serializedIndex.columns) {
                    index.columns.set(indexColumnName, index.parent.columns.get(indexColumnName));
                }

                table.indexes.set(serializedIndex.name, index);
            }
        }
    }

    // 2nd pass: Deserialize constraints
    for (let serializedSchema of serializedDB.schemas) {
        let schema = db.schemas.get(serializedSchema.name);

        for (let serializedTable of serializedSchema.tables) {
            let table = schema.get(serializedTable.name);

            for (let serializedConstraint of serializedTable.constraints) {
                if (serializedConstraint.parent) {
                    serializedConstraint.parent = db.get(serializedConstraint.parent);
                }

                serializedConstraint.table = table;

                let constraint = new Constraint(serializedConstraint);

                for (let constraintColumnName of serializedConstraint.columns) {
                    constraint.columns.set(constraintColumnName, table.columns.get(constraintColumnName));
                }

                for (let pair of serializedConstraint.referencedColumnsBy) {
                    constraint.referencedColumnsBy.set(pair[0], db.get(pair[1]));
                }

                table.constraints.set(serializedConstraint.name, constraint);
            }
        }
    }

    return db;
};

/**
 * Alias of {@link module:pgStructure.deserialize}. Creates and returns {@link DB} instance using previously serialized string. <br/>
 * <img src="../../images/warning-24.png" style="margin-left: -26px;"> pgStructure cannot
 * deserialize incompatible pg-structure module versions and returns `undefined`. In this case you should fetch structure from database.
 * @param   {string} serializedDB   - Serialized database structure to create {@link DB} instance from.
 * @returns {DB|undefined}          - {@link DB} instance. If serialized string is from incompatible module version, this is `undefined`
 * @function
 * @see {@link module:pgStructure.deserialize}
 */
module.exports.parse = module.exports.deserialize;
