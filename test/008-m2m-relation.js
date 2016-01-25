'use strict';
var Lab         = require('lab');
var Chai        = require('chai');
var pgStructure = require('../lib/pg-structure');

var lab         = exports.lab = Lab.script();
var describe    = lab.describe;
var it          = lab.it;
var testDB      = require('./util/test-db.js');
var expect      = Chai.expect;

var dbs = {};
var db;
var m2m;

lab.before((done) => {
    testDB.createDB('1')
        .then(() => pgStructure(testDB.credentials, ['public', 'other_schema']))
        .then((result) => {
            dbs.fromDB      = result;
            dbs.fromFile    = pgStructure.deserialize(pgStructure.serialize(result));
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

var tests = function(key) {
    return function() {
        lab.before((done) => {
            db = dbs[key];
            m2m = [...db.get('public.cart').m2mRelations.values()][0];
            done();
        });

        it('should have type.', function(done) {
            expect(m2m.type).to.equal('MANY TO MANY');
            done();
        });

        it('should have sourceTable.', function(done) {
            expect(m2m.sourceTable.name).to.equal('cart');
            done();
        });

        it('should have joinTable.', function(done) {
            expect(m2m.joinTable.name).to.equal('cart_line_item');
            done();
        });

        it('should have targetTable.', function(done) {
            expect(m2m.targetTable.name).to.equal('product');
            done();
        });

        it('should have sourceConstraint.', function(done) {
            expect(m2m.sourceConstraint.name).to.equal('cart_has_products');
            expect([...m2m.sourceConstraint.columns.values()][0].name).to.equal('cart_id');
            done();
        });

        it('should have targetConstraint.', function(done) {
            expect(m2m.targetConstraint.name).to.equal('product_has_carts');
            expect([...m2m.targetConstraint.columns.values()][0].name).to.equal('product_id');
            done();
        });
    };
};

describe('M2MConstraint from Database', tests('fromDB'));
describe('M2MConstraint from File', tests('fromFile'));
