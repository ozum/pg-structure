"use strict";
var Lab = require("lab");
var Chai = require("chai");
var pgStructure = require("../index");

var lab = (exports.lab = Lab.script());
var describe = lab.describe;
var it = lab.it;
var testDB = require("./util/test-db.js");
var expect = Chai.expect;

var dbs = {};
var db;
var table;
var table2;
var view;
var view2;
var view3;

lab.before(() =>
    testDB
        .createDB("1")
        .then(() => pgStructure(testDB.credentials, ["public", "other_schema"]))
        .then(result => {
            dbs.fromDB = result;
            dbs.fromFile = pgStructure.deserialize(pgStructure.serialize(result));
        })
        .catch(err => {
            console.log(err.stack);
        })
);

lab.after(() => testDB.dropDB());

var tests = function(key) {
    return function() {
        lab.before(() => {
            db = dbs[key];
            table = db.get("public.account");
            table2 = db.get("public.contact");
            view = db.get("public.v_contacts_with_account");
            view2 = db.get("other_schema.v_contacts_with_account");
            view3 = db.get("other_schema.contact");
        });

        it("should have name.", function() {
            expect(table.name).to.equal("account");
        });

        it("should have table2 name.", function() {
            expect(table2.name).to.equal("contact");
        });

        it("should have fullName.", function() {
            expect(table.fullName).to.equal("public.account");
        });

        it("should have kind of table if it is a table.", function() {
            expect(table.kind).to.equal("table");
        });

        it("should have kind of view if it is a view.", function() {
            expect(view.kind).to.equal("view");
        });

        it("should have view name.", function() {
            expect(view.name).to.equal("v_contacts_with_account");
        });

        it("should have view2 name.", function() {
            expect(view2.name).to.equal("v_contacts_with_account");
        });

        it("should have view3 name.", function() {
            expect(view3.name).to.equal("contact");
        });

        it("should have fullCatalogName.", function() {
            expect(table.fullCatalogName).to.equal("pg-test-util.public.account");
        });

        it("should have db.", function() {
            expect(table.db.name).to.equal("pg-test-util");
        });

        it("should have parent.", function() {
            expect(table.parent.name).to.equal("public");
        });

        it("should have schema.", function() {
            expect(table.schema.name).to.equal("public");
        });

        it("should have columns.get().", function() {
            expect(table.columns.get("id").name).to.equal("id");
        });

        it("should have comment.", function() {
            expect(table.comment).to.equal("Firma bilgilerinin tutulduğu tablo.");
        });

        it("should have constraints.", function() {
            expect([...table.constraints.values()][0].name.includes("not_null")).to.equal(true);
        });

        it("should have constraintsByName.", function() {
            expect(table.constraints.get("contact_has_companies").name).to.equal("contact_has_companies");
        });

        it("should have description.", function() {
            expect(table.description).to.equal("Firma bilgilerinin tutulduğu tablo.");
        });

        it("should have foreignKeyConstraints.", function() {
            expect([...table.foreignKeyConstraints.values()][0].name).to.equal("contact_has_companies");
            expect(table.foreignKeyConstraints.size).to.equal(1);
            expect(db.get("public.cart_line_item").foreignKeyConstraints.size).to.equal(2);
            expect(db.get("public.cart_line_item_cross_composite").foreignKeyConstraints.size).to.equal(2);
            expect(db.get("public.message").foreignKeyConstraints.size).to.equal(2);
        });

        it("should have foreignKeyConstraints.get().", function() {
            expect(table.foreignKeyConstraints.get("contact_has_companies").name).to.equal("contact_has_companies");
        });

        it("should have foreignKeyColumns.", function() {
            let fkColumns = [...db.get("public.cart_line_item_cross_composite").foreignKeyColumns.values()];
            expect(fkColumns[0].name).to.equal("primary_cart_id");
            expect(fkColumns[1].name).to.equal("primary_product_id");
            expect(fkColumns[2].name).to.equal("secondary_cart_id");
            expect(fkColumns[3].name).to.equal("secondary_product_id");
        });

        it("should have foreignKeyColumns.get().", function() {
            let fkColumns = db.get("public.cart_line_item_cross_composite").foreignKeyColumns;
            expect(fkColumns.get("secondary_cart_id").name).to.equal("secondary_cart_id");
        });

        it("should have primaryKeyConstraint.", function() {
            expect(table.primaryKeyConstraint.name).to.equal("Key2");
            expect([...table.primaryKeyConstraint.columns.values()][0].name).to.equal("id");
        });

        it("should have primaryKeyColumns.", function() {
            expect([...table.primaryKeyColumns.values()][0].name).to.equal("id");
        });

        it("without primary key should return empty set for primaryKeyColumns.", function() {
            expect([...db.get("public.v_contacts_with_account").primaryKeyColumns.values()]).to.deep.equal([]);
        });

        it("should have primaryKeyColumns.get().", function() {
            expect(table.primaryKeyColumns.get("id").name).to.equal("id");
        });

        it("should have hasManyTables.", function() {
            expect([...table.hasManyTables.values()][0].name).to.equal("contact");
            expect(db.get("public.cart").hasManyTables.size).to.equal(1);
        });

        it("should have hasManyTables.get().", function() {
            expect(table.hasManyTables.get("contact").name).to.equal("contact");
        });

        it("without hasMany relation should return empty set for hasManyTables.", function() {
            expect([...db.get("public.v_contacts_with_account").hasManyTables.values()]).to.deep.equal([]);
        });

        it("should have belongsToTables.", function() {
            let contactTable = db.get("public.contact");
            expect([...contactTable.belongsToTables.values()][0].name).to.equal("account");
            expect(db.get("public.cart_line_item_cross_composite").belongsToTables.size).to.equal(1);
            expect(db.get("public.class_register").belongsToTables.size).to.equal(2);
        });

        it("should have belongsToTables.get().", function() {
            let contactTable = db.get("public.contact");
            expect(contactTable.belongsToTables.get("account").name).to.equal("account");
        });

        it("should have belongsToManyTables.", function() {
            let cartTable = db.get("public.cart");
            expect([...cartTable.belongsToManyTables.values()][0].name).to.equal("product");
            expect(db.get("public.student").belongsToManyTables.size).to.equal(2);
            expect(db.get("public.cart_line_item").belongsToManyTables.size).to.equal(1);
        });

        it("should have belongsToManyTablesPk.", function() {
            let cartTable = db.get("public.cart");
            expect([...cartTable.belongsToManyTablesPk.values()][0].name).to.equal("product");
            expect(db.get("public.student").belongsToManyTablesPk.size).to.equal(1);
            expect(db.get("public.cart_line_item").belongsToManyTablesPk.size).to.equal(0);
        });

        it("should have belongsToManyTables.get().", function() {
            let cartTable = db.get("public.cart");
            expect(cartTable.belongsToManyTables.get("product").name).to.equal("product");
        });

        it("should have m2mRelations.", function() {
            let cartTable = db.get("public.cart");
            let contactTable = db.get("public.contact");
            expect([...cartTable.m2mRelations.values()][0].sourceConstraint.name).to.equal("cart_has_products");
            expect([...contactTable.m2mRelations.values()]).to.deep.equal([]);
            expect(db.get("public.student").m2mRelations.size).to.equal(3);
            expect(db.get("public.cart").m2mRelations.size).to.equal(1);
            expect(db.get("public.cart_line_item").m2mRelations.size).to.equal(2);
        });

        it("should have m2mRelationsPk.", function() {
            let cartTable = db.get("public.cart");
            let contactTable = db.get("public.contact");
            expect([...cartTable.m2mRelationsPk.values()][0].sourceConstraint.name).to.equal("cart_has_products");
            expect([...contactTable.m2mRelationsPk.values()]).to.deep.equal([]);
            expect(db.get("public.student").m2mRelationsPk.size).to.equal(1);
            expect(db.get("public.cart").m2mRelationsPk.size).to.equal(1);
            expect(db.get("public.cart_line_item").m2mRelationsPk.size).to.equal(0);
        });

        it("should have o2mRelations.", function() {
            let cartTable = db.get("public.cart");
            expect([...cartTable.o2mRelations.values()][0].constraint.name).to.equal("cart_has_products");
            expect(db.get("public.account").o2mRelations.size).to.equal(3);
            expect(db.get("public.cart_line_item").o2mRelations.size).to.equal(3);
        });

        it("should have m2oRelations.", function() {
            let cartLineItemTable = db.get("public.cart_line_item");
            expect([...cartLineItemTable.m2oRelations.values()][0].constraint.name).to.equal("cart_has_products");
            expect(db.get("public.cart_line_item_cross_composite").m2oRelations.size).to.equal(2);
            expect(db.get("public.class_register").m2oRelations.size).to.equal(2);
            expect(db.get("public.cart_line_item").m2oRelations.size).to.equal(2);
        });

        it("should have relations.", function() {
            let cartLineItemTable = db.get("public.cart_line_item");
            expect(cartLineItemTable.relations.size).to.equal(7);
            expect([...db.get("public.type_table").relations.values()]).to.deep.equal([]);
        });

        it("should have indexes.", function() {
            let collection = [...db.get("public.contact").indexes.values()];
            expect(collection.length).to.equal(7);
            expect(collection[0].name).to.equal("email");
            expect(collection[1].name).to.equal("IX_Relationship1");
            expect(collection[2].name).to.equal("IX_Relationship6");
            expect([...collection[0].columns.values()][0].name).to.equal("email");
        });

        it("should have get().", function() {
            expect(table.get("field3").name).to.equal("field3");
        });

        it("should have commentData.", function() {
            expect(table.commentData).to.deep.equal({ jsonkey: "jsonvalue" });
        });

        it("should have descriptionData.", function() {
            expect(table.descriptionData).to.deep.equal({ jsonkey: "jsonvalue" });
        });
    };
};

describe("Table from Database", tests("fromDB"));
describe("Table from File", tests("fromFile"));
