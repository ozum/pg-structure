/*jslint node: true */
/*global describe, it, before, beforeEach, after, afterEach */
"use strict";

var assert          = require('chai').assert;
var dbModule        = require('../lib/util/db.js');
var db;

beforeEach(function (done) {
    db = dbModule({ name: 'crm' });
    db.addSchema({ name: 'public' });
    db.addSchema({ name: 'private' });
    db.addSchema({ name: 'extra_modules' });
    done();
});


describe('DB function', function () {
    it('should throw error if no args provided', function () {
        assert.throw(function () { dbModule(); }, /DB arguments are required/);
    });
    it('should throw error if arguments are not validated', function () {
        assert.throw(function () { dbModule({ corruptParam: true }); }, /DB\. ValidationError: name is required/);
    });
});


describe('addSchema function', function () {
    it('should add schema via plain object and return it.', function () {
        var schema = db.addSchema({ name: 'test_schema' });
        assert.equal(schema.constructor.name, 'Schema');
        assert.equal(schema.name(), 'test_schema');
        assert.equal(db.schema('test_schema').name(), 'test_schema');
    });
    it('should return when existing schema tried to be added.', function () {
        var schema = db.addSchema({ name: 'public' });
        assert.equal(schema.constructor.name, 'Schema');
        assert.equal(schema.name(), 'public');
        assert.equal(db.schema('public').name(), 'public');
    });
    it('should throw error when no arguments passed.', function () {
        assert.throw(function () { db.addSchema(); }, /required/);
    });
    it('should add reference to its database', function () {
        var addedSchema    = db.addSchema({ name: 'test_schema2' });
        assert.equal(addedSchema.db().name(), 'crm');
        assert.equal(addedSchema.parent().name(), 'crm');
    });
});


describe('schema function', function () {
    it('should get schema', function () {
        assert.equal(db.schema('private').name(), 'private');
    });
    it('should throw error if no name is provided.', function () {
        assert.throw(function () { db.schema(); }, /is required/);
    });
    it('should throw error if position 0 provided.', function () {
        assert.throw(function () { db.schema(0); }, /must be a string/);
    });
    it('should throw error if position 1 provided.', function () {
        assert.throw(function () { db.schema(1); }, /must be a string/);
    });
});

describe('schemas function', function () {
    it('should return all schemas without callback.', function () {
        var schemas = db.schemas();
        assert.equal(schemas.extra_modules.name(), 'extra_modules');
    });
    it('should execute callback if callback provided.', function () {
        db.schemas(function (schema) {
            assert.deepEqual(schema, db.schema(schema.name()));
        });
    });
});

describe('Accessing from schemas back to db', function () {
    it('should return schema', function () {
        assert.equal(db.schema('public').db().name(), 'crm');
    });
    it('should access other schemas thrugh db', function () {
        assert.equal(db.schema('public').db().schema('private').name(), 'private');
    });
});

describe('name function', function () {
    it('should get name', function () {
        assert.equal(db.name(), 'crm');
    });
});