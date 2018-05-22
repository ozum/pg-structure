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
        .createDB("4")
        .then(() => pgStructure(testDB.credentials, ["public", "nir"]))
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
    lab.before(done => {
        db = dbs[key];
    });

    return function() {
        it("should have constraint.", function() {
            expect(db.get("nir.nir_links").constraints.get("nir_links_fk3").name).to.equal("nir_links_fk3");
        });
    };
};

describe("Constraint from Database", tests("fromDB"));
describe("Constraint from File", tests("fromFile"));
