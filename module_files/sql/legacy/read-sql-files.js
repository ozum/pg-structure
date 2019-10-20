/**
 * Exports a function which returns a promise. Promise is resolved with an object value. Keys are camelized file names
 * without file extension, values are contents of the files. On first call this promise read files from disk, on
 * concecutive calls, returns already read results from memory.
 * @module readSQLFiles
 * @private
 * @author Özüm Eldoğan
 * @example
 * var readSQLFiles = require('./sql/read-sql-files');
 * readSQLFiles()
 *     .then((sql) => {
 *         console.log(sql.table);      // table.sql file content.
 *     })
 *     .catch((err) => {
 *         console.log(err);
 *     });
 */
'use strict';
var fs              = require('fs');
var path            = require('path');
var inflection      = require('inflection');
var EventEmitter    = require('events').EventEmitter;

var emitter     = new EventEmitter();
var sqlFiles    = {};
var status      = 'STOPPED'; // STOPPED|WORKING|READY

/**
 * Reads given file and assigns its content to global `sqlFiles` variable.
 * @param {string} file - Full path of the file to read.
 * @returns {Promise}   - Returns a promise. No value is resolved.
 */
function promiseReadFile(file) {
    return new Promise((resolve, reject) => {
        fs.readFile(file, function(err, content) {
            if (err) return reject(new Error(err));
            let key = inflection.camelize(path.basename(file, path.extname(file)), true);
            sqlFiles[key] = content.toString();
            resolve();
        });
    });
}

/**
 * Change status to given status and emits an event with given name.
 * @param {string} newStatus - New status to change. Possible states are `STOPPED`, `WORKING`, `READY`
 */
function changeStatus(newStatus) {
    status = newStatus;
    emitter.emit(newStatus);
}

/**
 * Read all sql files in the sql directory and assigns their contents to an object with keys as camelized file names,
 * values as content of the file.
 * @returns {Promise.<Object>} - Promise resolved with a signature (Object<string, string>). Keys are camelized file names
 *                               without file extension, values are file contents. ie. For `referential_constraint.sql` file
 *                               { referentialConstraint: --content of the file--, ... }
 */
function readSQLFiles() {
    let promises = [];

    return new Promise((resolve, reject) => {
        if (status === 'READY') return resolve(sqlFiles);
        if (status === 'WORKING') return emitter.on('READY', resolve.bind(null, sqlFiles));

        changeStatus('WORKING');

        fs.readdir(path.join(__dirname, '.'), function(err, files) {
            if (err) return reject(new Error(err));

            for (let file of files) {
                if (path.extname(file) === '.sql') promises.push(promiseReadFile(path.join(__dirname, file)));
            }

            Promise.all(promises).then(() => {
                changeStatus('READY');
                resolve(sqlFiles);
            });
        });
    });
}

module.exports = readSQLFiles;
