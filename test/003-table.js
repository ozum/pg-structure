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
var table;

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
            table = db.get('public.account');
            done();
        });

        it('should have name.', function(done) {
            expect(table.name).to.equal('account');
            done();
        });

        it('should have fullName.', function(done) {
            expect(table.fullName).to.equal('public.account');
            done();
        });

        it('should have fullCatalogName.', function(done) {
            expect(table.fullCatalogName).to.equal('pg-test-util.public.account');
            done();
        });

        it('should have db.', function(done) {
            expect(table.db.name).to.equal('pg-test-util');
            done();
        });

        it('should have parent.', function(done) {
            expect(table.parent.name).to.equal('public');
            done();
        });

        it('should have schema.', function(done) {
            expect(table.schema.name).to.equal('public');
            done();
        });

        it('should have columns.get().', function(done) {
            expect(table.columns.get('id').name).to.equal('id');
            done();
        });

        it('should have comment.', function(done) {
            expect(table.comment).to.equal('Firma bilgilerinin tutulduğu tablo.');
            done();
        });

        it('should have constraints.', function(done) {
            expect([...table.constraints.values()][0].name.includes('not_null')).to.equal(true);
            done();
        });

        it('should have constraintsByName.', function(done) {
            expect(table.constraints.get('contact_has_companies').name).to.equal('contact_has_companies');
            done();
        });

        it('should have description.', function(done) {
            expect(table.description).to.equal('Firma bilgilerinin tutulduğu tablo.');
            done();
        });

        it('should have foreignKeyConstraints.', function(done) {
            expect([...table.foreignKeyConstraints.values()][0].name).to.equal('contact_has_companies');
            expect(table.foreignKeyConstraints.size).to.equal(1);
            expect(db.get('public.cart_line_item').foreignKeyConstraints.size).to.equal(2);
            expect(db.get('public.cart_line_item_cross_composite').foreignKeyConstraints.size).to.equal(2);
            expect(db.get('public.message').foreignKeyConstraints.size).to.equal(2);
            done();
        });

        it('should have foreignKeyConstraints.get().', function(done) {
            expect(table.foreignKeyConstraints.get('contact_has_companies').name).to.equal('contact_has_companies');
            done();
        });

        it('should have foreignKeyColumns.', function(done) {
            let fkColumns = [...db.get('public.cart_line_item_cross_composite').foreignKeyColumns.values()];
            expect(fkColumns[0].name).to.equal('primary_cart_id');
            expect(fkColumns[1].name).to.equal('primary_product_id');
            expect(fkColumns[2].name).to.equal('secondary_cart_id');
            expect(fkColumns[3].name).to.equal('secondary_product_id');
            done();
        });

        it('should have foreignKeyColumns.get().', function(done) {
            let fkColumns = db.get('public.cart_line_item_cross_composite').foreignKeyColumns;
            expect(fkColumns.get('secondary_cart_id').name).to.equal('secondary_cart_id');
            done();
        });

        it('should have primaryKeyConstraint.', function(done) {
            expect(table.primaryKeyConstraint.name).to.equal('Key2');
            expect([...table.primaryKeyConstraint.columns.values()][0].name).to.equal('id');
            done();
        });

        it('should have primaryKeyColumns.', function(done) {
            expect([...table.primaryKeyColumns.values()][0].name).to.equal('id');
            done();
        });

        it('should have primaryKeyColumns.get().', function(done) {
            expect(table.primaryKeyColumns.get('id').name).to.equal('id');
            done();
        });

        it('should have hasManyTables.', function(done) {
            expect([...table.hasManyTables.values()][0].name).to.equal('contact');
            expect(db.get('public.cart').hasManyTables.size).to.equal(1);
            done();
        });

        it('should have hasManyTables.get().', function(done) {
            expect(table.hasManyTables.get('contact').name).to.equal('contact');
            done();
        });

        it('should have belongsToTables.', function(done) {
            let contactTable = db.get('public.contact');
            expect([...contactTable.belongsToTables.values()][0].name).to.equal('account');
            expect(db.get('public.cart_line_item_cross_composite').belongsToTables.size).to.equal(1);
            expect(db.get('public.class_register').belongsToTables.size).to.equal(2);
            done();
        });

        it('should have belongsToTables.get().', function(done) {
            let contactTable = db.get('public.contact');
            expect(contactTable.belongsToTables.get('account').name).to.equal('account');
            done();
        });

        it('should have belongsToManyTables.', function(done) {
            let cartTable = db.get('public.cart');
            expect([...cartTable.belongsToManyTables.values()][0].name).to.equal('product');
            expect(db.get('public.student').belongsToManyTables.size).to.equal(2);
            expect(db.get('public.cart_line_item').belongsToManyTables.size).to.equal(1);
            done();
        });

        it('should have belongsToManyTablesPk.', function(done) {
            let cartTable = db.get('public.cart');
            expect([...cartTable.belongsToManyTablesPk.values()][0].name).to.equal('product');
            expect(db.get('public.student').belongsToManyTablesPk.size).to.equal(1);
            expect(db.get('public.cart_line_item').belongsToManyTablesPk.size).to.equal(0);
            done();
        });

        it('should have belongsToManyTables.get().', function(done) {
            let cartTable = db.get('public.cart');
            expect(cartTable.belongsToManyTables.get('product').name).to.equal('product');
            done();
        });

        it('should have m2mRelations.', function(done) {
            let cartTable = db.get('public.cart');
            let contactTable = db.get('public.contact');
            expect([...cartTable.m2mRelations.values()][0].sourceConstraint.name).to.equal('cart_has_products');
            expect([...contactTable.m2mRelations.values()]).to.deep.equal([]);
            expect(db.get('public.student').m2mRelations.size).to.equal(3);
            expect(db.get('public.cart').m2mRelations.size).to.equal(1);
            expect(db.get('public.cart_line_item').m2mRelations.size).to.equal(2);
            done();
        });

        it('should have m2mRelationsPk.', function(done) {
            let cartTable = db.get('public.cart');
            let contactTable = db.get('public.contact');
            expect([...cartTable.m2mRelationsPk.values()][0].sourceConstraint.name).to.equal('cart_has_products');
            expect([...contactTable.m2mRelationsPk.values()]).to.deep.equal([]);
            expect(db.get('public.student').m2mRelationsPk.size).to.equal(1);
            expect(db.get('public.cart').m2mRelationsPk.size).to.equal(1);
            expect(db.get('public.cart_line_item').m2mRelationsPk.size).to.equal(0);
            done();
        });

        it('should have o2mRelations.', function(done) {
            let cartTable = db.get('public.cart');
            expect([...cartTable.o2mRelations.values()][0].constraint.name).to.equal('cart_has_products');
            expect(db.get('public.account').o2mRelations.size).to.equal(3);
            expect(db.get('public.cart_line_item').o2mRelations.size).to.equal(3);
            done();
        });

        it('should have m2oRelations.', function(done) {
            let cartLineItemTable = db.get('public.cart_line_item');
            expect([...cartLineItemTable.m2oRelations.values()][0].constraint.name).to.equal('cart_has_products');
            expect(db.get('public.cart_line_item_cross_composite').m2oRelations.size).to.equal(2);
            expect(db.get('public.class_register').m2oRelations.size).to.equal(2);
            expect(db.get('public.cart_line_item').m2oRelations.size).to.equal(2);

            done();
        });

        it('should have relations.', function(done) {
            let cartLineItemTable = db.get('public.cart_line_item');
            expect(cartLineItemTable.relations.size).to.equal(7);
            expect([...db.get('public.type_table').relations.values()]).to.deep.equal([]);
            done();
        });

        it('should have indexes.', function(done) {
            let collection = [...db.get('public.contact').indexes.values()];
            expect(collection.length).to.equal(7);
            expect(collection[0].name).to.equal('email');
            expect(collection[1].name).to.equal('IX_Relationship1');
            expect(collection[2].name).to.equal('IX_Relationship6');
            expect([...collection[0].columns.values()][0].name).to.equal('email');

            done();
        });

        it('should have get().', function(done) {
            expect(table.get('field3').name).to.equal('field3');
            done();
        });
    };
};

describe('Table from Database', tests('fromDB'));
describe('Table from File', tests('fromFile'));
