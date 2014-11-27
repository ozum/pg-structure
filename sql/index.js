/**
 * Exports SQL queries.
 *
 * @module sql
 * @private
 * @author Özüm Eldoğan
 */
/*jslint node: true, nomen: true, stupid: true */
"use strict";

var fs = require('fs');

/**
 * @type {{field: *, constraint: *, index: *}}
 */
module.exports = {
    schema      : fs.readFileSync(__dirname + '/schema.sql').toString(),
    table       : fs.readFileSync(__dirname + '/table.sql').toString(),
    column      : fs.readFileSync(__dirname + '/column.sql').toString(),
    constraint  : fs.readFileSync(__dirname + '/constraint.sql').toString(),
    foreignKey  : fs.readFileSync(__dirname + '/foreign-key.sql').toString(),
    index       : fs.readFileSync(__dirname + '/index.sql').toString()
};