'use strict';
var Lab         = require('lab');
var Chai        = require('chai');
var pgStructure = require('../lib/pg-structure');

var lab         = exports.lab = Lab.script();
var describe    = lab.describe;
var it          = lab.it;
var testDB      = require('./util/test-db.js');
var expect      = Chai.expect;

var schema;

lab.before((done) => {
    testDB.createDB('1')
        .then(() => {
            return pgStructure(testDB.credentials, ['public', 'other_schema']);
        })
        .then((result) => {
            schema = result.schemasByName.public;
            done();
        })
        .catch((err) => {
            console.log(err.stack);
        });
});

lab.after((done) => {
    testDB.dropDB().then(() => {
        done();
    });
});

describe('Schema attributes', function() {
    it('should have name.', function(done) {
        expect(schema.name).to.equal('public');
        done();
    });

    it('should have fullName.', function(done) {
        expect(schema.fullName).to.equal('public');
        done();
    });

    it('should have fullCatalogName.', function(done) {
        expect(schema.fullCatalogName).to.equal('pg-test-util.public');
        done();
    });

    it('should have parent.', function(done) {
        expect(schema.parent.name).to.equal('pg-test-util');
        done();
    });

    it('should have db.', function(done) {
        expect(schema.db.name).to.equal('pg-test-util');
        done();
    });

    it('should have tables.', function(done) {
        expect(schema.tables[0].name).to.equal('account');
        expect(schema.tables[1].name).to.equal('cart');
        done();
    });

    it('should have tablesByName.', function(done) {
        expect(schema.tablesByName.account.name).to.equal('account');
        expect(schema.tablesByName.cart.name).to.equal('cart');
        done();
    });
});

describe('Schema methods', function() {
    it('should have getTable().', function(done) {
        expect(schema.getTable('account').name).to.equal('account');
        done();
    });

    it('should have tableExists().', function(done) {
        expect(schema.tableExists('account')).to.equal(true);
        expect(schema.tableExists('not_available')).to.equal(false);
        done();
    });

    it('should have get().', function(done) {
        expect(schema.get('account').name).to.equal('account');
        expect(schema.get('account.id').name).to.equal('id');
        done();
    });

    it('should have getSchemas().', function(done) {
        var tables = [];
        schema.getTables((table) => {
            tables.push(table);
        });

        expect(tables[0].name).to.equal('account');
        expect(tables[1].name).to.equal('cart');

        done();
    });
});
