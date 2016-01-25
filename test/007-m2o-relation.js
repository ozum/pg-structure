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
    };
};

describe('M2OConstraint from Database', tests('fromDB'));
describe('M2OConstraint from File', tests('fromFile'));
