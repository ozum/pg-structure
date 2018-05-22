"use strict";
var Lab = require("lab");
var Chai = require("chai");
var pgStructure = require("../index");
var path = require("path");
var fs = require("fs-extra");

var lab = (exports.lab = Lab.script());
var describe = lab.describe;
var it = lab.it;
var testDB = require("./util/test-db.js");
var expect = Chai.expect;

var db;

lab.before(() =>
    testDB
        .createDB("1")
        .then(() => pgStructure(testDB.credentials, ["public", "other_schema"]))
        .then(result => {
            db = result;
        })
        .catch(err => {
            console.log(err.stack);
        })
);

lab.after(() => testDB.dropDB());

describe("pgStructure", () => {
    it("should save db to file as a json file", () => {
        const file = path.join(__dirname, "./util/structure.json");
        return pgStructure
            .save(file, db)
            .then(() => pgStructure.load(file))
            .then(db => expect(db.schemas.get("public").name).to.equal("public"))
            .then(() => fs.unlink(file));
    });
    it("should save db to file as a zip file", () => {
        const file = path.join(__dirname, "./util/structure.zip");
        return pgStructure
            .save(file, db)
            .then(() => pgStructure.load(file))
            .then(db => expect(db.schemas.get("public").name).to.equal("public"))
            .then(() => fs.unlink(file));
    });
});
