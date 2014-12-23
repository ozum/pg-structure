/*jslint node: true */
/*global describe, it, before, beforeEach, after, afterEach */
"use strict";

var assert          = require('chai').assert;
var structure       = require('../lib/pg-structure.js');
var testDB          = require('./util/db.js');
var db;

before(function (done) {
    testDB.resetDB(1, function () {
        structure('localhost', 'pg_generator_test_724839', testDB.dbConfig.user, testDB.dbConfig.password, {schema: ['public']}, function (err, result) {
            if (err) { throw err; }
            db = result;
            done();
        });
    });
});

after(function (done) {
    testDB.dropDB(done);
});

describe('DB Object', function () {
    it('should be defined', function () {
        assert.equal(db.name(), 'pg_generator_test_724839');
    });
    it('should have "public" schema', function () {
        assert.equal(db.schema('public').name(), 'public');
    });
});

