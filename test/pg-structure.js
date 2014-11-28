/*jslint node: true */
/*global describe, it, before, beforeEach, after, afterEach */
"use strict";

var assert          = require('chai').assert;
var structure       = require('../lib/pg-structure.js');
var testDB          = require('./util/db.js');
var db;

before(function (done) {
    testDB.resetDB(1, function () {
        structure('localhost', 'pg_generator_test_724839', testDB.dbConfig.user, testDB.dbConfig.password, {schema: ['public', 'other_schema']}, function (err, result) {
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
    it('should have "other_schema" schema', function () {
        assert.equal(db.schema('other_schema').name(), 'other_schema');
    });
});

describe('Inter-Schema Relationship', function () {
    it('should work', function () {
        assert.equal(db.schema('other_schema').table('other_schema_table').column('account_id').foreignKeyConstraint().referencesTable().name(), 'account');
    });
});

describe('User Defined Type', function () {
    it('should have udtType', function () {
        assert.equal(db.schema('public').table('type_table').column('company').type(), 'user-defined');
        assert.equal(db.schema('public').table('type_table').column('company').udType(), 'composite_udt');

    });
    it('should have Sequelize Type', function () {
        assert.equal(db.schema('public').table('type_table').column('company').sequelizeType(), 'DataTypes.STRING');
    });
});