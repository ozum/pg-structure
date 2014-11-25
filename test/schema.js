/*jslint node: true */
/*global describe, it, before, beforeEach, after, afterEach */
"use strict";

var assert          = require('chai').assert;
var dbModule        = require('../lib/util/db.js');
var schemaModule    = require('../lib/util/schema.js');
var schema;

beforeEach(function (done) {
    schema = dbModule({name: 'test_db'}).addSchema({ name: 'public' });
    schema.addTable({ name: 'account' });
    schema.addTable({ name: 'contact' });
    schema.addTable({ name: 'product' });
    done();
});

describe('Schema function', function () {
    it('should throw error if no args provided', function () {
        assert.throw(function () { schemaModule(); }, /Schema arguments are required/);
    });
    it('should throw error if arguments are not validated', function () {
        assert.throw(function () { schemaModule({ corruptParam: true }); }, /schema\. ValidationError: name is required/);
    });
});

describe('addTable function', function () {
    it('should add table and return it.', function () {
        var table = schema.addTable({ name: 'test_table' });
        assert.equal(table.constructor.name, 'Table');
        assert.equal(table.name(), 'test_table');
        assert.equal(schema.table('test_table').name(), 'test_table');
    });
    it('should return table when existing table tried to be added.', function () {
        var table = schema.addTable({ name: 'contact' });
        assert.equal(table.constructor.name, 'Table');
        assert.equal(table.name(), 'contact');
        assert.equal(schema.table('contact').name(), 'contact');
    });
    it('should throw error when no arguments passed.', function () {
        assert.throw(function () { schema.addTable(); }, /required/);
    });
    it('should add reference to its schema', function () {
        var addedTable  = schema.addTable({ name: 'test_table' });
        assert.equal(addedTable.schema().name(), 'public');
        assert.equal(addedTable.parent().name(), 'public');
    });
});


describe('table function', function () {
    it('should get table', function () {
        assert.equal(schema.table('account').name(), 'account');
        assert.equal(schema.table('product').name(), 'product');
    });
});


describe('tables function', function () {
    it('should return all tables without callback.', function () {
        var tables = schema.tables();
        assert.equal(tables.account.name(), 'account');
    });
    it('should execute callback if callback provided.', function () {
        schema.tables(function (table) {
            assert.deepEqual(table, schema.table(table.name()));
        });
    });
});

describe('Accessing from tables back to schema', function () {
    it('should return schema', function () {
        assert.equal(schema.table('account').schema().name(), 'public');
    });
    it('should access other columns thrugh table', function () {
        assert.equal(schema.table('account').schema().table('contact').name(), 'contact');
    });
});