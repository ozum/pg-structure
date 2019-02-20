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
        .createDB("5")
        .then(() => pgStructure(testDB.credentials, ["a", "b"]))
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
            constraint = db.get("b.child").constraints.get("child_root_id_fkey");
        });

        it("should have name.", function() {
            expect(constraint.name).to.equal("child_root_id_fkey");
        });

        it("should have table.", function() {
            expect(constraint.table.name).to.equal("child");
        });

        it("should have schema.", function() {
            expect(constraint.schema.name).to.equal("b");
        });

        it("should have referencedTable.", function() {
            expect(constraint.referencedTable.fullName).to.equal("a.parent");
        });

        it("should have parent.", function() {
            expect(constraint.parent.fullName).to.equal("a.parent");
        });
    };
};

describe("Constraint from Database", tests("fromDB"));
describe("Constraint from File", tests("fromFile"));
