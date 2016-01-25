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
var o2m;

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
            o2m = [...db.get('public.cart').o2mRelations.values()][0];
            done();
        });

        it('should have type.', function(done) {
            expect(o2m.type).to.equal('ONE TO MANY');
            done();
        });

        it('should have sourceTable.', function(done) {
            expect(o2m.sourceTable.name).to.equal('cart');
            done();
        });

        it('should have targetTable.', function(done) {
            expect(o2m.targetTable.name).to.equal('cart_line_item');
            done();
        });

        it('should have constraint.', function(done) {
            expect(o2m.constraint.name).to.equal('cart_has_products');
            expect([...o2m.constraint.columns.values()][0].name).to.equal('cart_id');
            done();
        });
    };
};

describe('O2MConstraint from Database', tests('fromDB'));
describe('O2MConstraint from File', tests('fromFile'));
