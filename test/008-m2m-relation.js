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
var m2m;

lab.before(done => {
    testDB
        .createDB("1")
        .then(() => pgStructure(testDB.credentials, ["public", "other_schema"]))
        .then(result => {
            dbs.fromDB = result;
            dbs.fromFile = pgStructure.deserialize(pgStructure.serialize(result));
            done();
        })
        .catch(err => {
            console.log(err.stack);
        });
});

lab.after(done => {
    testDB.dropDB().then(() => {
        done();
    });
});

var tests = function(key) {
    return function() {
        lab.before(done => {
            db = dbs[key];
            m2m = [...db.get("public.cart").m2mRelations.values()][0];
            done();
        });

        it("should have type.", function(done) {
            expect(m2m.type).to.equal("MANY TO MANY");
            done();
        });

        it("should have sourceTable.", function(done) {
            expect(m2m.sourceTable.name).to.equal("cart");
            done();
        });

        it("should have joinTable.", function(done) {
            expect(m2m.joinTable.name).to.equal("cart_line_item");
            done();
        });

        it("should have targetTable.", function(done) {
            expect(m2m.targetTable.name).to.equal("product");
            done();
        });

        it("should have sourceConstraint.", function(done) {
            expect(m2m.sourceConstraint.name).to.equal("cart_has_products");
            expect([...m2m.sourceConstraint.columns.values()][0].name).to.equal("cart_id");
            done();
        });

        it("should have targetConstraint.", function(done) {
            expect(m2m.targetConstraint.name).to.equal("cst_cart_line_items, cst_product, cst_product");
            expect([...m2m.targetConstraint.columns.values()][0].name).to.equal("product_id");
            done();
        });

        it("should have generateName().", function(done) {
            let rel = [...db.get("public.cart").m2mRelations.values()];
            expect(rel[0].generateName("simple")).to.equal("products"); // Simple name
            expect(rel[0].generateName("complex")).to.equal("cart_line_item_products"); // Complex name
            expect(rel[0].generateName()).to.equal("products"); // No multiple relation to same table. Result is simple name.

            let relStudent = [...db.get("public.student").m2mRelations.values()];
            expect(relStudent[1].generateName("simple")).to.equal("students"); // Simple name
            expect(relStudent[1].generateName("complex")).to.equal("message_related_sender_first_names"); // Complex name
            expect(relStudent[1].generateName()).to.equal("json_sender_students"); // Result is from descriptionData.

            expect(relStudent[2].generateName("simple")).to.equal("students"); // Simple name
            expect(relStudent[2].generateName("complex")).to.equal("message_related_receiver_first_names"); // Complex name
            expect(relStudent[2].generateName()).to.equal("message_related_receiver_first_names"); // Multiple relation to same table. Result is complex name.

            let relProduct = [...db.get("public.product").m2mRelations.values()];
            expect(relProduct[0].generateName("simple")).to.equal("carts"); // Simple name
            expect(relProduct[0].generateName()).to.equal("cst_product_carts"); // Result is from constraint name parsed.

            done();
        });
    };
};

describe("M2MConstraint from Database", tests("fromDB"));
describe("M2MConstraint from File", tests("fromFile"));
