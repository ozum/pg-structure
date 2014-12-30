/*jslint node: true */
/*global describe, it, before, beforeEach, after, afterEach */
"use strict";

var assert          = require('chai').assert;
var structure       = require('../lib/pg-structure.js');
var testDB          = require('./util/db.js');
var db;

before(function (done) {
    testDB.resetDB('sequelize', function () {
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

describe('product', function() {
    it('should access own foreign key in through table', function () {
        assert.equal(db.get('public.product').hasManyThrough('source_alternative_products&destination_alternative_products').foreignKey(0).name(), 'product_id');
    });
    it('should access through foreign key in through table', function () {
        assert.equal(db.get('public.product').hasManyThrough('source_alternative_products&destination_alternative_products').throughForeignKeyConstraint().foreignKey(0).name(), 'alternative_product_id');
        assert.equal(db.get('public.product').hasManyThrough('source_alternative_products&suggestion_type_alternative_products').throughForeignKeyConstraint().foreignKey(0).name(), 'suggestion_type_id');
    });
});