"use strict";

var PgTestUtil = require("pg-test-util").default;
var path = require("path");

var dbName = "pg-test-util";

var dbOptions = {
    connection: {
        host: process.env.PGHOST || "localhost",
        port: process.env.PGPORT || 5432,
        user: process.env.PGUSER || "user",
        password: process.env.PGPASSWORD || "password"
    },
    defaultDatabase: dbName
};

var pgUtil = new PgTestUtil(dbOptions);

var createDB = function createDB(code) {
    return pgUtil
        .createDatabase({ name: dbName, drop: true })
        .then(db => db.queryFile(path.join(__dirname, `create-test-db-${code}.sql`)))
        .catch(err => {
            console.error(err);
        });
};

var dropDB = function dropDB() {
    return pgUtil.dropDatabase(dbName);
};

module.exports = {
    createDB: createDB,
    dropDB: dropDB,
    credentials: {
        database: dbName,
        user: dbOptions.connection.user,
        password: dbOptions.connection.password,
        host: dbOptions.connection.host,
        port: dbOptions.connection.port
    }
};
