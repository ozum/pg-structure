/*jslint node: true */
/*global describe, it, before, beforeEach, after, afterEach */
"use strict";

var assert          = require('chai').assert;
var structure       = require('../lib/pg-structure.js');
var testDB          = require('./util/db.js');
var db;


describe('pg-structure', function () {
    after(function (done) {
        testDB.dropDB(done);
    });

    it('should throw informative error if accessed schema is not in DB and forgotten in options.', function (done) {
        testDB.resetDB(1, function () {
            structure('localhost', 'pg_generator_test_724839', testDB.dbConfig.user, testDB.dbConfig.password, {schema: ['public']}, function (err, result) {
                assert.throw(function () { if (err) { throw err; } }, /This schema is also not in the options/);
                db = result;
                done();
            });
        });
    });
});