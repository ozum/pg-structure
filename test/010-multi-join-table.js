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


lab.before((done) => {
    testDB.createDB('3')
        .then(() => pgStructure(testDB.credentials, ['public']))
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
            done();
        });

        it('from join table should have name.', function(done) {
            let constraint = db.get('public.product').constraints.get('account_products');
            expect(constraint.name).to.equal('account_products');
            done();
        });

        it('from join table should have referenced table.', function(done) {
            let constraint = db.get('public.product').constraints.get('account_products');
            expect(constraint.referencedTable.name).to.equal('account');
            done();
        });

        it('from non-join table should have name.', function(done) {
            let constraint = db.get('public.contact').constraints.get('account_contacts');
            expect(constraint.name).to.equal('account_contacts');
            done();
        });

        it('from non-join table should have referenced table.', function(done) {
            let constraint = db.get('public.contact').constraints.get('account_contacts');
            expect(constraint.referencedTable.name).to.equal('account');
            done();
        });
    };
};

describe('Constraint from Database', tests('fromDB'));
describe('Constraint from File', tests('fromFile'));
