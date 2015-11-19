'use strict';
var Lab         = require('lab');
var Chai        = require('chai');
var pgStructure = require('../lib/pg-structure');

var lab         = exports.lab = Lab.script();
var describe    = lab.describe;
var it          = lab.it;
var testDB      = require('./util/test-db.js');
var expect      = Chai.expect;

var table;
var db;

lab.before((done) => {
    testDB.createDB('1')
        .then(() => {
            return pgStructure(testDB.credentials, ['public', 'other_table']);
        })
        .then((result) => {
            db = result;
            table = result.get('public.account');
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

describe('Table attributes', function() {
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

    it('should have columns.', function(done) {
        expect(table.columns[0].name).to.equal('id');
        expect(table.columns[1].name).to.equal('created_at');
        done();
    });

    it('should have columnsByName.', function(done) {
        expect(table.columnsByName.field1.name).to.equal('field1');
        expect(table.columnsByName.id.name).to.equal('id');
        done();
    });

    it('should have constraints.', function(done) {
        expect(table.constraints[0].name.includes('not_null')).to.equal(true);
        done();
    });

    it('should have constraintsByName.', function(done) {
        expect(table.constraintsByName.contact_has_companies.name).to.equal('contact_has_companies');
        done();
    });

    it('should have foreignKeyConstraints.', function(done) {
        expect(table.foreignKeyConstraints[0].name).to.equal('contact_has_companies');
        done();
    });

    it('should have foreignKeyConstraintsByName.', function(done) {
        expect(table.foreignKeyConstraintsByName.contact_has_companies.name).to.equal('contact_has_companies');
        done();
    });

    it('should have foreignKeyColumns.', function(done) {
        let fkColumns = db.get('public.cart_line_item_cross_composite').foreignKeyColumns;
        expect(fkColumns[0].name).to.equal('primary_cart_id');
        expect(fkColumns[1].name).to.equal('primary_product_id');
        expect(fkColumns[2].name).to.equal('secondary_cart_id');
        expect(fkColumns[3].name).to.equal('secondary_product_id');
        done();
    });

    it('should have foreignKeyColumnsByName.', function(done) {
        let fkColumns = db.get('public.cart_line_item_cross_composite').foreignKeyColumnsByName;
        expect(fkColumns['secondary_cart_id'].name).to.equal('secondary_cart_id');
        done();
    });

    it('should have primaryKeyConstraint.', function(done) {
        expect(table.primaryKeyConstraint.name).to.equal('Key2');
        expect(table.primaryKeyConstraint.columns[0].name).to.equal('id');
        done();
    });

    it('should have primaryKeyColumns.', function(done) {
        expect(table.primaryKeyColumns[0].name).to.equal('id');
        done();
    });

    it('should have primaryKeyColumnsByName.', function(done) {
        expect(table.primaryKeyColumnsByName.id.name).to.equal('id');
        done();
    });

    it('should have hasManyTables.', function(done) {
        expect(table.hasManyTables[0].name).to.equal('contact');
        done();
    });

    it('should have hasManyTablesByName.', function(done) {
        expect(table.hasManyTablesByName.contact.name).to.equal('contact');
        done();
    });

    it('should have hasManyTablesByFullName.', function(done) {
        expect(table.hasManyTablesByFullName['public.contact'].name).to.equal('contact');
        done();
    });

    it('should have belongsToTables.', function(done) {
        let contactTable = db.get('public.contact');
        expect(contactTable.belongsToTables[0].name).to.equal('account');
        done();
    });

    it('should have belongsToTablesByName.', function(done) {
        let contactTable = db.get('public.contact');
        expect(contactTable.belongsToTablesByName.account.name).to.equal('account');
        done();
    });

    it('should have belongsToTablesByFullName.', function(done) {
        let contactTable = db.get('public.contact');
        expect(contactTable.belongsToTablesByFullName['public.account'].name).to.equal('account');
        done();
    });

    it('should have belongsToManyTables.', function(done) {
        let cartTable = db.get('public.cart');
        expect(cartTable.belongsToManyTables[0].name).to.equal('product');
        done();
    });

    it('should have belongsToManyTablesByName.', function(done) {
        let cartTable = db.get('public.cart');
        expect(cartTable.belongsToManyTablesByName.product.name).to.equal('product');
        done();
    });

    it('should have belongsToManyTablesByFullName.', function(done) {
        let cartTable = db.get('public.cart');
        expect(cartTable.belongsToManyTablesByFullName['public.product'].name).to.equal('product');
        done();
    });

    it('should have m2mRelations.', function(done) {
        let cartTable = db.get('public.cart');
        let contactTable = db.get('public.contact');
        expect(cartTable.m2mRelations[0].sourceConstraint.name).to.equal('cart_has_products');
        expect(contactTable.m2mRelations).to.equal(null);
        done();
    });

    it('should have o2mRelations.', function(done) {
        let cartTable = db.get('public.cart');
        expect(cartTable.o2mRelations[0].constraint.name).to.equal('cart_has_products');
        done();
    });

    it('should have m2oRelations.', function(done) {
        let cartLineItemTable = db.get('public.cart_line_item');
        expect(cartLineItemTable.m2oRelations[0].constraint.name).to.equal('cart_has_products');
        done();
    });

    it('should have relations.', function(done) {
        let cartLineItemTable = db.get('public.cart_line_item');
        expect(cartLineItemTable.relations.length).to.equal(7);
        done();
    });

    it('should have indexes.', function(done) {
        let collection = db.get('public.contact').indexes;

        expect(collection.length).to.equal(7);
        expect(collection[0].name).to.equal('email');
        expect(collection[1].name).to.equal('IX_Relationship1');
        expect(collection[2].name).to.equal('IX_Relationship6');

        expect(collection[0].columns[0].name).to.equal('email');

        done();
    });
});

describe('Table methods', function() {
    it('should have getColumn().', function(done) {
        expect(table.getColumn('field1').name).to.equal('field1');
        done();
    });

    it('should have columnExists().', function(done) {
        expect(table.columnExists('field3')).to.equal(true);
        expect(table.columnExists('not_available')).to.equal(false);
        done();
    });

    it('should have get().', function(done) {
        expect(table.get('field3').name).to.equal('field3');
        done();
    });

    it('should have getColumns().', function(done) {
        var columns = [];
        table.getColumns((column) => {
            columns.push(column);
        });

        expect(columns[0].name).to.equal('id');
        expect(columns[1].name).to.equal('created_at');

        done();
    });

    it('should have getPrimaryKeyColumns().', function(done) {
        var primaryKeyColumns = [];
        table.getPrimaryKeyColumns((column) => {
            primaryKeyColumns.push(column);
        });

        expect(primaryKeyColumns[0].name).to.equal('id');
        done();
    });

    it('should have getForeignKeyColumns.', function(done) {
        let fkColumns = [];

        db.get('public.cart_line_item_cross_composite').getForeignKeyColumns((column) => {
            fkColumns.push(column);
        });

        expect(fkColumns[0].name).to.equal('primary_cart_id');
        expect(fkColumns[1].name).to.equal('primary_product_id');
        expect(fkColumns[2].name).to.equal('secondary_cart_id');
        expect(fkColumns[3].name).to.equal('secondary_product_id');
        done();
    });

    it('should have getPrimaryKeyConstraint().', function(done) {
        var constraints = [];
        table.getPrimaryKeyConstraint((constraint) => {
            constraints.push(constraint);
        });

        expect(constraints[0].name).to.equal('Key2');

        done();
    });

    it('should have getForeignKeyConstraints().', function(done) {
        var constraints = [];
        table.getForeignKeyConstraints((constraint) => {
            constraints.push(constraint);
        });

        expect(constraints[0].name).to.equal('contact_has_companies');

        done();
    });

    it('should have getConstraints().', function(done) {
        var constraints = [];
        table.getConstraints((constraint) => {
            constraints.push(constraint);
        });

        expect(constraints[0].name.includes('not_null'));

        done();
    });

    it('should have getHasManyTables().', function(done) {
        var hasManyTables = [];
        table.getHasManyTables((table) => {
            hasManyTables.push(table);
        });

        expect(hasManyTables[0].name).to.equal('contact');
        done();
    });

    it('should have getBelongsToTables().', function(done) {
        var belongsToTables = [];
        let contactTable = db.get('public.contact');
        contactTable.getBelongsToTables((table) => {
            belongsToTables.push(table);
        });

        expect(belongsToTables[0].name).to.equal('account');
        done();
    });

    it('should have getM2ORelations().', function(done) {
        var result  = [];
        let table   = db.get('public.cart_line_item');
        table.getM2ORelations((row) => {
            result.push(row);
        });

        expect(result[0].constraint.name).to.equal('cart_has_products');
        done();
    });

    it('should have getM2ORelations().', function(done) {
        var result  = [];
        let table   = db.get('public.cart_line_item');
        table.getM2ORelations((row) => {
            result.push(row);
        });

        expect(result[0].constraint.name).to.equal('cart_has_products');
        done();
    });

    it('should have getM2MRelations().', function(done) {
        var result  = [];
        let table   = db.get('public.cart');
        table.getM2MRelations((row) => {
            result.push(row);
        });

        expect(result[0].sourceConstraint.name).to.equal('cart_has_products');
        done();
    });

    it('should have getRelations.', function(done) {
        var result  = [];
        let table   = db.get('public.cart_line_item');
        table.getRelations((row) => {
            result.push(row);
        });

        expect(result.length).to.equal(7);
        done();
    });

    it('should have getIndexes.', function(done) {
        let collection = [];

        db.get('public.contact').getIndexes((value) => {
            collection.push(value);
        });

        expect(collection.length).to.equal(7);
        expect(collection[0].name).to.equal('email');
        expect(collection[1].name).to.equal('IX_Relationship1');
        expect(collection[2].name).to.equal('IX_Relationship6');

        done();
    });
});
