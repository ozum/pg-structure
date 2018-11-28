'use strict';
/**
 * @module pgStructure
 */

const path        = require('path');
const fs          = require('fs-extra');
const Db          = require('./db');
const Schema      = require('./schema');
const Type        = require('./type');
const Table       = require('./table');
const Column      = require('./column');
const Index       = require('./index');
const Constraint  = require('./constraint');
const version     = require('../package.json').version;
const semver      = require('semver');
const JSZip       = require('jszip');
const pg          = require('pg');

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
 * Executes given sql file and assign callback function an error events for the query.
 * @param {string}                      file            - SQL file
 * @param {pg#client}                   client          - node-postgres client to query database.
 * @param {Array.<string>}              schemas         - PostgreSQL schemas to be used in query.
 * @param {Function}                    eventCallback   - Callback to call on 'row' event.
 * @returns {Promise.<void>}                            - Void promise
 * @private
 */
function executeSqlFile(file, client, schemas, eventCallback) {
    return fs.readFile(path.join(sqlDir, file))
        .then(sql => client.query(sql.toString(), [schemas]))
        .then(res => res.rows.forEach(row => eventCallback(row)))
        .catch((err) => { throw err; });
}

/**
 * Returns callback function which adds schemas returned from sql query to given Db object.
 * @param   {Db}                db      - pg-structure Db object.
 * @returns {Function}                  - Callback to call on 'row' event.
 * @private
 */
function addSchemas(db) {
    return function (row) {
        // Create schema.
        db.schemas.set(row.name, new Schema({ parent: db, name: row.name, description: row.description }));
    };
}

/**
 * Returns callback function which adds custom types returned from sql query to given Db object.
 * @param   {Db}                db      - pg-structure Db object.
 * @returns {Function}                  - Callback to call on 'row' event.
 * @private
 */
function addTypes(db) {
    return function (row) {
        // Create table if not exists.
        let schema = db.schemas.get(row.schema);
        let type = schema.types.get(row.typeName)
            || schema.types.set(row.typeName, new Type({
                parent: schema,
                name: row.typeName,
                description: row.typeDescription
               })).get(row.typeName);

        row.parent = type;
        type.columns.set(row.name, new Column(row));
    };
}

/**
 * Returns callback function which adds tables and columns returned from sql query to given Db object.
 * @param   {Db}                db      - pg-structure Db object.
 * @returns {Function}                  - Callback to call on 'row' event.
 * @private
 */
function addTablesAndColumns(db) {
    return function (row) {
        // Create table if not exists.
        let schema = db.schemas.get(row.schema);
        let table = schema.tables.get(row.table)
            || schema.tables.set(row.table, new Table({ parent: schema, isPrimaryKey: false, name: row.table,
                description: row.tableDescription, kind: row.kind })).get(row.table);

        row.parent = table;
        if(row.userDefinedType) {
            row.userType = schema.types.get(row.userDefinedType)
        }
        table.columns.set(row.name, new Column(row));
    };
}

/**
 * Returns callback function which adds indexes returned from sql query to given Db object.
 * @param   {Db}                db      - pg-structure Db object.
 * @returns {Function}                  - Callback to call on 'row' event.
 * @private
 */
function addIndexes(db) {
    return function (row) {
        let table = db.schemas.get(row.tableSchema).tables.get(row.tableName);

        // Add index to table if not exists
        let index = table.indexes.get(row.indexName)
            || table.indexes.set(row.indexName, new Index({ parent: table, name: row.indexName,
                isUnique: row.isUnique, isPrimaryKey: row.isPrimaryKey })).get(row.indexName);

        index.columns.set(row.columnName, table.columns.get(row.columnName));
    };
}

/**
 * Returns callback function which adds constraints returned from sql query to given Db object.
 * @param   {Db}                db      - pg-structure Db object.
 * @returns {Function}                  - Callback to call on 'row' event.
 * @private
 */
function addConstraints(db) {
    return function (row) {
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

    };
}

/**
 * Creates and returns {@link Db} instance by reverse engineering PostgreSQL database.
 * @param   {pgOptions|pg#client}       pgOptions                   - node-postgres client or connection parameters. Parameters passed directly to node-postgres. See it for details.
 * @param   {string|Array.<string>}     [schemas=['public']]        - PostgreSQL schemas to be parsed.
 * @param   {Object}                    options                     - pg-structure options.
 * @param   {boolean}                   [options.cache=true]        - Use cache to memoize calculated results.
 * @returns {Promise.<Db>}                                          - {@link Db}.
 * @throws  {Error}                                                 - Throws if one of the requested shchemas does not exists on database.
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
            db = new Db({ name: pgOptions.database }, Object.assign({ cache: true }, options));
        })
        .then(() => executeSqlFile('schema.sql', client, schemas, addSchemas(db)))
        .then(() => executeSqlFile('type.sql', client, schemas, addTypes(db)))
        .then(() => executeSqlFile('column.sql', client, schemas, addTablesAndColumns(db)))
        .then(() => executeSqlFile('index.sql', client, schemas, addIndexes(db)))
        .then(() => executeSqlFile('constraint.sql', client, schemas, addConstraints(db)))
        .then(() => {
            if (!isClient) {
                client.end();
            }

            schemas.forEach((schemaName) => {
                if (! db.schemas.has(schemaName)) {
                    throw new Error(`${schemaName} does not exists on database.`);
                }
            });

            return db;
        });
};

/**
 * Saves given database structure to a disk file. If given file name ends with `.zip` extension, file will be saved as
 * compressed zip file.
 * @param   {string|undefined}  file    - File path to save database structure.
 * @param   {Db}                db      - {@link Db} object to save.
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
        return Promise.reject(new Error('Path and Db object is required.'));
    }
    var fileInZip = path.basename(file, '.zip') + '.json';

    return new Promise(resolve => resolve(module.exports.serialize(db)))
        .then(serialized => path.extname(file) === '.zip'
            ? new JSZip().file(fileInZip, serialized).generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 3 } })
            : serialized)
        .then(serialized => fs.writeFile(file, serialized));
};

/**
 * Loads database structure from previously saved file. Much faster than getting structure from database.
 * If file is a zip file which contains a json file with same name as zip file, this function decompresses the file
 * automatically.<br/>
 * <img src="../../images/warning-24.png" style="margin-left: -26px;"> pgStructure cannot
 * load files saved by incompatible pg-structure module versions and returns `undefined`. In this case you should
 * fetch structure from database and create a new save file.
 * @param   {string}                    file    - File path to load db structure from.
 * @returns {Promise.<Db|undefined>}            - {@link Db} instance or `undefined` if saved file is generated with incompatible module version.
 * @example
 * var pgStructure = require('pg-structure');
 *
 * pgStructure.load('./db.json')
 *     .then(db => console.log(db.schemas[0].name))
 *     .catch(err => console.log(err.stack));
 */
module.exports.load = function load(file) {
    if (!file) {
        return Promise.reject(new Error('Path is required.'));
    }

    var fileInZip = path.basename(file, '.zip') + '.json';
    return fs.readFile(file)
        .then(data => path.extname(file) === '.zip' ? JSZip.loadAsync(data).then(zip => zip.file(fileInZip).async('string')) : data)
        .then(data => module.exports.deserialize(data));
};

/**
 * Serializes database structure to make it possible to store or transfer.
 * @param   {Db}        db  - {@link Db} instance to serialize.
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
 * @param   {Db}        db  - {@link Db} instance to serialize.
 * @returns {string}        - Serialized database structure.
 * @see {@link module:pgStructure.serialize)
 */
module.exports.toString = module.exports.serialize;

/**
 * Creates and returns {@link Db} instance using previously serialized string. <br/>
 * <img src="../../images/warning-24.png" style="margin-left: -26px;"> pgStructure cannot
 * deserialize incompatible pg-structure module versions and returns `undefined`. In this case you should fetch structure from database.
 * @param   {string} serializedDbJSON   - Serialized database structure to create {@link Db} instance from.
 * @returns {Db|undefined}              - {@link Db} instance. If serialized string is from incompatible module version, this is `undefined`
 * var pgStructure = require('pg-structure');
 *
 * pgStructure.deserialize('./db.json')
 *     .then(db => console.log(db.schemas[0].name)
 *     .catch(err => console.log(err.stack));
 */
module.exports.deserialize = function deserialize(serializedDbJSON) {
    let minimumVersion = '3.0.0';
    let serializedDb = JSON.parse(serializedDbJSON);

    let version = serializedDb.$pgStructureVersion;
    delete serializedDb.$pgStructureVersion;

    if (semver.lt(version, minimumVersion)) { return; } // Return undef if minimum save version requirement is not met.

    let db = new Db(serializedDb, serializedDb.options);

    // 1st pass: Deserialize schemas, tables, columns, indexes.
    for (let serializedSchema of serializedDb.schemas) {
        serializedSchema.parent = db;
        let schema = new Schema(serializedSchema);
        db.schemas.set(serializedSchema.name, schema);

        for (let serializedType of serializedSchema.types) {
            serializedType.parent = schema;
            let type = new Type(serializedType);
            schema.types.set(serializedType.name, type);

            for (let serializedColumn of serializedType.columns) {
                serializedColumn.parent = type;
                let column = new Column(serializedColumn);
                type.columns.set(serializedColumn.name, column);
            }
        }

        for (let serializedTable of serializedSchema.tables) {
            serializedTable.parent = schema;
            let table = new Table(serializedTable);
            schema.tables.set(serializedTable.name, table);

            for (let serializedColumn of serializedTable.columns) {
                serializedColumn.parent = table;
                serializedColumn.userType = schema.types.get(serializedColumn.userDefinedType)
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
    for (let serializedSchema of serializedDb.schemas) {
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
 * Alias of {@link module:pgStructure.deserialize}. Creates and returns {@link Db} instance using previously serialized string. <br/>
 * <img src="../../images/warning-24.png" style="margin-left: -26px;"> pgStructure cannot
 * deserialize incompatible pg-structure module versions and returns `undefined`. In this case you should fetch structure from database.
 * @param   {string} serializedDb   - Serialized database structure to create {@link Db} instance from.
 * @returns {Db|undefined}          - {@link Db} instance. If serialized string is from incompatible module version, this is `undefined`
 * @function
 * @see {@link module:pgStructure.deserialize}
 */
module.exports.parse = module.exports.deserialize;
