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
        .createDB("3")
        .then(() => pgStructure(testDB.credentials, ["public"]))
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
        });

        it("from join table should have name.", function() {
            let constraint = db.get("public.product").constraints.get("account_products");
            expect(constraint.name).to.equal("account_products");
        });

        it("from join table should have referenced table.", function() {
            let constraint = db.get("public.product").constraints.get("account_products");
            expect(constraint.referencedTable.name).to.equal("account");
        });

        it("from non-join table should have name.", function() {
            let constraint = db.get("public.contact").constraints.get("account_contacts");
            expect(constraint.name).to.equal("account_contacts");
        });

        it("from non-join table should have referenced table.", function() {
            let constraint = db.get("public.contact").constraints.get("account_contacts");
            expect(constraint.referencedTable.name).to.equal("account");
        });
    };
};

describe("Constraint from Database", tests("fromDB"));
describe("Constraint from File", tests("fromFile"));
