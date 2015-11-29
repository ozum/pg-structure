'use strict';
var Lab         = require('lab');
var Chai        = require('chai');
var pgStructure = require('../lib/pg-structure');

var lab         = exports.lab = Lab.script();
var describe    = lab.describe;
var it          = lab.it;
var testDB      = require('./util/test-db.js');
var expect      = Chai.expect;

var db;


lab.before((done) => {
    testDB.createDB('3')
        .then(() => {
            return pgStructure(testDB.credentials, ['public']);
        })
        .then((result) => {
            db = result;
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

describe('Constraint from join table', function() {
    it('should have name.', function(done) {
        let constraint = db.get('public.product').constraintsByName.account_products;
        expect(constraint.name).to.equal('account_products');
        done();
    });

    it('should have referenced table.', function(done) {
        let constraint = db.get('public.product').constraintsByName.account_products;
        expect(constraint.referencedTable.name).to.equal('account');
        done();
    });
});

describe('Constraint from non-join table', function() {
    it('should have name.', function(done) {
        let constraint = db.get('public.contact').constraintsByName.account_contacts;
        expect(constraint.name).to.equal('account_contacts');
        done();
    });

    it('should have referenced table.', function(done) {
        let constraint = db.get('public.contact').constraintsByName.account_contacts;
        expect(constraint.referencedTable.name).to.equal('account');
        done();
    });
});