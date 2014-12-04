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
    //testDB.dropDB(done);
    done();
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

describe('Column Default', function () {
    it('contact should have some default values.', function () {
        assert.equal(db.schema('public').table('contact').column('name').default(), '\'oz\'');
        assert.equal(db.schema('public').table('contact').column('surname').default(), '\'O\'\'Reilly\'');
        assert.equal(db.schema('public').table('contact').column('birth_date').default(), '\'2010-01-01\'');
        assert.equal(db.schema('public').table('contact').column('is_active').default(), 'true');
        assert.equal(db.schema('public').table('contact').column('email').default(), '\'x@x.com\'');
    });
    it('contact should have some default values with typecast.', function () {
        assert.equal(db.schema('public').table('contact').column('name').defaultWithTypeCast(), '\'oz\'::character varying');
        assert.equal(db.schema('public').table('contact').column('surname').defaultWithTypeCast(), '\'O\'\'Reilly\'::character varying');
        assert.equal(db.schema('public').table('contact').column('birth_date').defaultWithTypeCast(), '\'2010-01-01\'::date');
        assert.equal(db.schema('public').table('contact').column('is_active').defaultWithTypeCast(), 'true');
        assert.equal(db.schema('public').table('contact').column('email').defaultWithTypeCast(), '\'x@x.com\'::character varying');
    });

    it('cart_line_item should have some default values.', function () {
        assert.equal(db.schema('public').table('cart_line_item').column('quantity').default(), 1);
    });
});