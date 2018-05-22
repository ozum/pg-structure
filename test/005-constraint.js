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
var constraint;

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

let tests = function(key) {
    return function() {
        lab.before(done => {
            db = dbs[key];
            constraint = db.get("public.cart").constraints.get("contact_has_carts");
        });

        it("should have name.", function() {
            expect(constraint.name).to.equal("contact_has_carts");
        });

        it("should have fullName.", function() {
            expect(constraint.fullName).to.equal("public.contact_has_carts");
        });

        it("should have fullCatalogName.", function() {
            expect(constraint.fullCatalogName).to.equal("pg-test-util.public.contact_has_carts");
        });

        it("should have type.", function() {
            expect(constraint.type).to.equal("FOREIGN KEY");
        });

        it("should have description.", function() {
            expect(constraint.description).to.equal("Constraint description.");
        });

        it("should have comment.", function() {
            expect(constraint.comment).to.equal("Constraint description.");
        });

        it("should have table.", function() {
            expect(constraint.table.name).to.equal("cart");
        });

        it("should have child.", function() {
            expect(constraint.child.name).to.equal("cart");
        });

        it("should have schema.", function() {
            expect(constraint.schema.name).to.equal("public");
        });

        it("should have db.", function() {
            expect(constraint.db.name).to.equal("pg-test-util");
        });

        it("should have onUpdate.", function() {
            expect(constraint.onUpdate).to.equal("CASCADE");
        });

        it("should have onDelete.", function() {
            expect(constraint.onDelete).to.equal("CASCADE");
        });

        it("should have matchOption.", function() {
            expect(constraint.matchOption).to.equal("NONE");
        });

        it("should have referencedTable.", function() {
            let checkConstraint = [...db.get("public.account").constraints.values()][0];
            expect(constraint.referencedTable.name).to.equal("contact");
            expect(checkConstraint.name.includes("not_null"));
            expect(checkConstraint.referencedTable).to.equal(null);
        });

        it("should have parent.", function() {
            expect(constraint.parent.name).to.equal("contact");
        });

        it("should have columns.", function() {
            let tempConstraintColumns = [
                ...db
                    .get("public.cart_line_item_audit_log")
                    .constraints.get("cart_line_item_has_audit_logs")
                    .columns.values()
            ];
            expect(tempConstraintColumns[0].name).to.equal("cart_id");
            expect(tempConstraintColumns[1].name).to.equal("product_id");
        });

        it("should have columns returning null for non column based constraints.", function() {
            let checkConstraint = [...db.get("public.account").constraints.values()][0];
            expect(checkConstraint.name.includes("not_null"));
            expect([...checkConstraint.columns.values()]).to.deep.equal([]);
        });

        it("should have columns.get().", function() {
            let tempConstraintColumns = db
                .get("public.cart_line_item_audit_log")
                .constraints.get("cart_line_item_has_audit_logs").columns;
            expect(tempConstraintColumns.get("cart_id").name).to.equal("cart_id");
            expect(tempConstraintColumns.get("product_id").name).to.equal("product_id");
        });

        it("should have referencedColumnsBy.get().", function() {
            let column = db
                .get("public.cart_line_item")
                .constraints.get("cart_has_products")
                .referencedColumnsBy.get("cart_id");
            expect(column.name).to.equal("id");
            expect(column.table.name).to.equal("cart");
        });

        it("should have commentData.", function() {
            expect(constraint.commentData).to.deep.equal({ o2mName: "carts", name: "O'Reilly" });
        });

        it("should have descriptionData.", function() {
            expect(constraint.descriptionData).to.deep.equal({ o2mName: "carts", name: "O'Reilly" });
        });
    };
};

describe("Constraint from Database", tests("fromDB"));
describe("Constraint from File", tests("fromFile"));
