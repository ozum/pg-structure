/*jslint node: true */
/*global describe, it, before, beforeEach, after, afterEach */
"use strict";

var assert          = require('chai').assert;
var structure       = require('../lib/pg-structure.js');
var testDB          = require('./util/db.js');
var db;


describe('pg-structure', function () {
    afterEach(function (done) {
        //testDB.dropDB(done);
        done();
    });

    it('should be ok with empty databases without any table.', function (done) {
        testDB.resetDB(0, function () {
            structure('localhost', 'pg_generator_test_724839', testDB.dbConfig.user, testDB.dbConfig.password, {schema: 'public'}, function (err, result) {
                if (err) { throw err; }
                db = result;
                assert.equal(db.schema('public').name(), 'public');
                done();
            });
        });
    });

    it('should be ok with databases with tables without any column.', function (done) {
        testDB.resetDB('0b', function () {
            structure('localhost', 'pg_generator_test_724839', testDB.dbConfig.user, testDB.dbConfig.password, {schema: 'public'}, function (err, result) {
                if (err) { throw err; }
                db = result;
                assert.equal(db.schema('public').table('table_without_column').name(), 'table_without_column');
                done();
            });
        });
    });
});

describe('pg-structure continued...', function () {
    it('should callback with error if parameters are not valid.', function (done) {
        structure(99, 'pg_generator_test_724839', testDB.dbConfig.user, testDB.dbConfig.password, {schema: ['public']}, function (err) {
            assert.throw(function () {
                if (err) {
                    throw err;
                }
            }, /host must be a string/);
            done();
        });
    });

    it('should throw error if no callback is provided.', function (done) {
        assert.throw(function () {
            structure('localhost', 'pg_generator_test_724839', testDB.dbConfig.user, testDB.dbConfig.password, {schema: ['public']});
        }, /callback is required/);
        done();
    });
    it('should throw error if non-function parameter provided as callback.', function (done) {
        assert.throw(function () {
            structure('localhost', 'pg_generator_test_724839', testDB.dbConfig.user, testDB.dbConfig.password, {schema: ['public']}, 4);
        }, /callback must be a Function/);
        done();
    });
});