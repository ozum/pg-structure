/**
 * Exports SQL queries.
 *
 * @module sql
 * @author Özüm Eldoğan
 */

var fs = require('fs');

/**
 * @type {{field: *, constraint: *, index: *}}
 */
module.exports = {
    column      : fs.readFileSync(__dirname + '/column.sql').toString(),
    constraint  : fs.readFileSync(__dirname + '/constraint.sql').toString(),
    foreignKey  : fs.readFileSync(__dirname + '/foreign-key.sql').toString(),
    index       : fs.readFileSync(__dirname + '/index.sql').toString()
};