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
var constraint;

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

let tests = function(key) {
    return function() {
        lab.before((done) => {
            db = dbs[key];
            constraint = db.get('public.cart').constraints.get('contact_has_carts');
            done();
        });

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

        it('should have description.', function(done) {
            expect(constraint.description).to.equal('Constraint description.');
            done();
        });

        it('should have comment.', function(done) {
            expect(constraint.comment).to.equal('Constraint description.');
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

        it('should have matchOption.', function(done) {
            expect(constraint.matchOption).to.equal('NONE');
            done();
        });

        it('should have referencedTable.', function(done) {
            let checkConstraint = [...db.get('public.account').constraints.values()][0];
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
            let tempConstraintColumns = [...db.get('public.cart_line_item_audit_log').constraints
                .get('cart_line_item_has_audit_logs').columns.values()];
            expect(tempConstraintColumns[0].name).to.equal('cart_id');
            expect(tempConstraintColumns[1].name).to.equal('product_id');
            done();
        });

        it('should have columns returning null for non column based constraints.', function(done) {
            let checkConstraint = [...db.get('public.account').constraints.values()][0];
            expect(checkConstraint.name.includes('not_null'));
            expect([...checkConstraint.columns.values()]).to.deep.equal([]);
            done();
        });

        it('should have columns.get().', function(done) {
            let tempConstraintColumns = db.get('public.cart_line_item_audit_log').constraints
                .get('cart_line_item_has_audit_logs').columns;
            expect(tempConstraintColumns.get('cart_id').name).to.equal('cart_id');
            expect(tempConstraintColumns.get('product_id').name).to.equal('product_id');
            done();
        });

        it('should have referencedColumnsBy.get().', function(done) {
            let column = db.get('public.cart_line_item').constraints
                .get('cart_has_products').referencedColumnsBy.get('cart_id');
            expect(column.name).to.equal('id');
            expect(column.table.name).to.equal('cart');
            done();
        });

        it('should have commentData.', function(done) {
            expect(constraint.commentData).to.deep.equal({ o2mName: 'carts', name: "O'Reilly" });
            done();
        });

        it('should have descriptionData.', function(done) {
            expect(constraint.descriptionData).to.deep.equal({ o2mName: 'carts', name: "O'Reilly" });
            done();
        });
    };
};

describe('Constraint from Database', tests('fromDB'));
describe('Constraint from File', tests('fromFile'));
