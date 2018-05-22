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
        });

        it("should have name.", function() {
            expect(schema.name).to.equal("public");
        });

        it("should have fullName.", function() {
            expect(schema.fullName).to.equal("public");
        });

        it("should have fullCatalogName.", function() {
            expect(schema.fullCatalogName).to.equal("pg-test-util.public");
        });

        it("should have comment.", function() {
            expect(schema.comment).to.equal("public schema comment");
        });

        it("should have description.", function() {
            expect(schema.description).to.equal("public schema comment");
        });

        it("should have parent.", function() {
            expect(schema.parent.name).to.equal("pg-test-util");
        });

        it("should have db.", function() {
            expect(schema.db.name).to.equal("pg-test-util");
        });

        it("should have tables.get().", function() {
            expect(schema.tables.get("account").name).to.equal("account");
        });

        it("should have tables.has().", function() {
            expect(schema.tables.has("account")).to.equal(true);
        });
    };
};

describe("Schema from Database", tests("fromDB"));
describe("Schema from File", tests("fromFile"));

describe("Non existing schema", () => {
    it("should throw exception", () => {
        return pgStructure(testDB.credentials, ["non_existing_schema"]).catch(err => {
            if (err.message === "non_existing_schema does not exists on database.") {
            } else {
                throw new Error();
            }
        });
    });
});
