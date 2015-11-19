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
var constraint;

lab.before((done) => {
    testDB.createDB('1')
        .then(() => {
            return pgStructure(testDB.credentials, ['public', 'other_schema']);
        })
        .then((result) => {
            db = result;
            constraint = db.get('public.cart').constraintsByName.contact_has_carts;
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

describe('Constraint attributes', function() {
    it('should have name.', function(done) {
        expect(constraint.name).to.equal('contact_has_carts');
        done();
    });

    it('should have fullName.', function(done) {
        expect(constraint.fullName).to.equal('public.contact_has_carts');
        done();
    });

    it('should have fullCatalogName.', function(done) {
        expect(constraint.fullCatalogName).to.equal('pg-test-util.public.contact_has_carts');
        done();
    });

    it('should have type.', function(done) {
        expect(constraint.type).to.equal('FOREIGN KEY');
        done();
    });

    it('should have table.', function(done) {
        expect(constraint.table.name).to.equal('cart');
        done();
    });

    it('should have child.', function(done) {
        expect(constraint.child.name).to.equal('cart');
        done();
    });

    it('should have schema.', function(done) {
        expect(constraint.schema.name).to.equal('public');
        done();
    });

    it('should have db.', function(done) {
        expect(constraint.db.name).to.equal('pg-test-util');
        done();
    });

    it('should have onUpdate.', function(done) {
        expect(constraint.onUpdate).to.equal('CASCADE');
        done();
    });

    it('should have onDelete.', function(done) {
        expect(constraint.onDelete).to.equal('CASCADE');
        done();
    });

    it('should have referencedTable.', function(done) {
        let checkConstraint = db.get('public.account').constraints[0];
        expect(constraint.referencedTable.name).to.equal('contact');
        expect(checkConstraint.name.includes('not_null'));
        expect(checkConstraint.referencedTable).to.equal(null);
        done();
    });

    it('should have parent.', function(done) {
        expect(constraint.parent.name).to.equal('contact');
        done();
    });

    it('should have columns.', function(done) {
        let tempConstraint = db.get('public.cart_line_item_audit_log').constraintsByName.cart_line_item_has_audit_logs;
        expect(tempConstraint.columns[0].name).to.equal('cart_id');
        expect(tempConstraint.columns[1].name).to.equal('product_id');
        done();
    });

    it('should have columns returning null for non column based constraints.', function(done) {
        let checkConstraint = db.get('public.account').constraints[0];
        expect(checkConstraint.name.includes('not_null'));
        expect(checkConstraint.columns).to.equal(null);
        done();
    });

    it('should have columnsByName.', function(done) {
        let tempConstraint = db.get('public.cart_line_item_audit_log').constraintsByName.cart_line_item_has_audit_logs;
        expect(tempConstraint.columnsByName.cart_id.name).to.equal('cart_id');
        expect(tempConstraint.columnsByName.product_id.name).to.equal('product_id');
        done();
    });

});

