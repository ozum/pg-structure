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
        });

        it("should have name.", function() {
            expect(db.name).to.equal("pg-test-util");
        });

        it("should have fullName.", function() {
            expect(db.fullName).to.equal("pg-test-util");
        });

        it("should have fullCatalogName.", function() {
            expect(db.fullCatalogName).to.equal("pg-test-util");
        });

        it("should have schemas.get().", function() {
            expect(db.schemas.get("other_schema").name).to.equal("other_schema");
            expect(db.schemas.get("public").name).to.equal("public");
        });

        it("should have schemas.has().", function() {
            expect(db.schemas.has("other_schema")).to.equal(true);
        });

        it("should have get().", function() {
            expect(db.get("public").name).to.equal("public");
            expect(db.get("public.account.id").name).to.equal("id");
        });
    };
};

describe("DB from Database", tests("fromDB"));
describe("DB from File", tests("fromFile"));
