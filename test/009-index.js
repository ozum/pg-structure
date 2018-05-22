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
var index;

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
        lab.before(done => {
            db = dbs[key];
            index = [...db.get("public.contact").indexes.values()][3];
        });

        it("should have name.", function() {
            expect(index.name).to.equal("IX_Unique_Full_Name");
        });

        it("should have fullName.", function() {
            expect(index.fullName).to.equal("public.IX_Unique_Full_Name");
        });

        it("should have fullCatalogName.", function() {
            expect(index.fullCatalogName).to.equal("pg-test-util.public.IX_Unique_Full_Name");
        });

        it("should have table.", function() {
            expect(index.table.name).to.equal("contact");
        });

        it("should have parent.", function() {
            expect(index.table.name).to.equal("contact");
        });

        it("should have schema.", function() {
            expect(index.schema.name).to.equal("public");
        });

        it("should have db.", function() {
            expect(index.db.name).to.equal("pg-test-util");
        });

        it("should have columns.", function() {
            let columns = [...index.columns.values()];
            expect(columns[0].name).to.equal("name");
            expect(columns[1].name).to.equal("surname");
        });

        it("should have columns.get().", function() {
            expect(index.columns.get("name").name).to.equal("name");
            expect(index.columns.get("surname").name).to.equal("surname");
        });
    };
};

describe("Index from Database", tests("fromDB"));
describe("Index from File", tests("fromFile"));
