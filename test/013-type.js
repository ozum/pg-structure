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
var schema;
var type;

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
            schema = db.schemas.get("public");
            type = schema.types.get('composite_udt');
        });

        it("should have name.", function() {
            expect(type.name).to.equal("composite_udt");
        });

        it("should have fullName.", function() {
            expect(type.fullName).to.equal("public.composite_udt");
        });

        it("should have fullCatalogName.", function() {
            expect(type.fullCatalogName).to.equal("pg-test-util.public.composite_udt");
        });

        it("should have comment.", function() {
            expect(type.comment).to.equal("public type comment");
        });

        it("should have description.", function() {
            expect(type.description).to.equal("public type comment");
        });

        it("should have parent.", function() {
            expect(type.parent.name).to.equal("public");
        });

        it("should have db.", function() {
            expect(type.db.name).to.equal("pg-test-util");
        });

        it("should have columns.get().", function() {
            expect(type.columns.get("company_id").name).to.equal("company_id");
        });

        it("should have columns.has().", function() {
            expect(type.columns.has("company_id")).to.equal(true);
        });
    };
};

var columnTests = function(key){
  var column;
  return function(){
    lab.before(() => {
        db = dbs[key];
        schema = db.schemas.get("public");
        type = schema.types.get('composite_udt')
        column = type.columns.get('company_id')
    });
    it("should have allowNull.", function() {
        expect(column.allowNull).to.equal(true);
    });

    it("should have arrayDimension.", function() {
        expect(column.arrayDimension).to.equal(0);
    });

    it("should have db.", function() {
        expect(column.db.name).to.equal("pg-test-util");
    });

    it("should have comment.", function() {
        expect(column.comment).to.equal("public type column comment");
    });

    it("should have description.", function() {
        expect(column.description).to.equal("public type column comment");
    });

    it("should have fullName.", function() {
        expect(column.fullName).to.equal("public.composite_udt.company_id");
    });

    it("should have fullCatalogName.", function() {
        expect(column.fullCatalogName).to.equal("pg-test-util.public.composite_udt.company_id");
    });

    it("should have length.", function() {
        expect(column.length).to.equal(null); // Int4
    });

    it("should have name.", function() {
        expect(column.name).to.equal("company_id");
    });

    it("should have notNull.", function() {
        expect(column.notNull).to.equal(false);
    });

    it("should have parent.", function() {
        expect(column.parent.name).to.equal("composite_udt");
    });

    it("should have precision.", function() {
        expect(column.precision).to.equal(32); // Int4
    });

    it("should have scale.", function() {
        expect(column.scale).to.equal(0); // Numeric
    });

    it("should have schema.", function() {
        expect(column.schema.name).to.equal("public");
    });

    it("should have type.", function() {
        expect(column.type).to.equal("integer");
    });
  }
}

describe("Type from Database", tests("fromDB"));
describe("Type from File", tests("fromFile"));
describe("Type Column from Database", columnTests("fromDB"));
describe("Type Column from File", columnTests("fromFile"));
