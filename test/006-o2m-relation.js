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

        it('should have generateName().', function(done) {
            let rel = [...db.get('public.account').o2mRelations.values()];
            expect(rel[0].generateName('simple')).to.equal('other_schema_tables');              // Simple name
            expect(rel[0].generateName('complex')).to.equal('has_other_schema_tables');         // Complex name
            expect(rel[0].generateName()).to.equal('other_schema_tables');                      // No multiple relation. Result is simple name

            expect(rel[1].generateName('simple')).to.equal('contacts');                         // Simple name
            expect(rel[1].generateName('complex')).to.equal('contacts');                        // Complex name
            expect(rel[1].generateName()).to.equal('contacts');                                 // There are 2 relations between account and contact. Result is complex name.

            expect(rel[2].generateName('simple')).to.equal('contacts');
            expect(rel[2].generateName('complex')).to.equal('second_contacts');
            expect(rel[2].generateName()).to.equal('second_contacts');

            let relCart = [...db.get('public.cart').o2mRelations.values()];
            expect(relCart[0].generateName('simple')).to.equal('cart_line_items');              // Simple name
            expect(relCart[0].generateName('complex')).to.equal('has_products');                // Complex name
            expect(relCart[0].generateName()).to.equal('json_cart_line_items');                 // Result is from descriptionData

            let relProduct = [...db.get('public.product').o2mRelations.values()];
            expect(relProduct[0].generateName('simple')).to.equal('cart_line_items');           // Simple name
            expect(relProduct[0].generateName()).to.equal('cst_cart_line_items');               // Result is from constraint name parsed.

            done();
        });
    };
};

describe('O2MConstraint from Database', tests('fromDB'));
describe('O2MConstraint from File', tests('fromFile'));
