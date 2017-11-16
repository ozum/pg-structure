'use strict';
var Lab         = require('lab');
var Chai        = require('chai');
var pgStructure = require('../index');

var lab         = exports.lab = Lab.script();
var describe    = lab.describe;
var it          = lab.it;
var testDB      = require('./util/test-db.js');
var expect      = Chai.expect;

var dbs = {};
var db;
var m2o;

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
            m2o = [...db.get('public.cart_line_item').m2oRelations.values()][0];
            done();
        });

        it('should have type.', function(done) {
            expect(m2o.type).to.equal('MANY TO ONE');
            done();
        });

        it('should have sourceTable.', function(done) {
            expect(m2o.sourceTable.name).to.equal('cart_line_item');
            done();
        });

        it('should have targetTable.', function(done) {
            expect(m2o.targetTable.name).to.equal('cart');
            done();
        });

        it('should have constraint.', function(done) {
            expect(m2o.constraint.name).to.equal('cart_has_products');
            expect([...m2o.constraint.columns.values()][0].name).to.equal('cart_id');
            done();
        });

        it('should have generateName().', function(done) {
            let relAcc = [...db.get('public.account').m2oRelations.values()];
            expect(relAcc[0].generateName('simple')).to.equal('contact');                       // Simple name
            expect(relAcc[0].generateName('complex')).to.equal('owner');                        // Complex name
            expect(relAcc[0].generateName()).to.equal('contact');                               // No multiple relation. Result is simple name

            let rel = [...db.get('public.contact').m2oRelations.values()];
            expect(rel[0].generateName('simple')).to.equal('account');                          // Simple name
            expect(rel[0].generateName('complex')).to.equal('company');                         // Complex name
            expect(rel[0].generateName()).to.equal('company');                                  // There are 2 relations between account and contact. Result is complex name.

            let relCLI = [...db.get('public.cart_line_item').m2oRelations.values()];
            expect(relCLI[0].generateName('simple')).to.equal('cart');                          // Simple name
            expect(relCLI[0].generateName('complex')).to.equal('cart');                         // Complex name
            expect(relCLI[0].generateName()).to.equal('json_cart');                             // Result is from descriptionData

            expect(relCLI[1].generateName('simple')).to.equal('product');                       // Simple name
            expect(relCLI[1].generateName('complex')).to.equal('product');                      // Complex name
            expect(relCLI[1].generateName()).to.equal('cst_product');                             // Result is from constraint name parsed.

            done();
        });
    };
};

describe('M2OConstraint from Database', tests('fromDB'));
describe('M2OConstraint from File', tests('fromFile'));
