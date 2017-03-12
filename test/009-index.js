'use strict';
var Lab         = require('lab');
var Chai        = require('chai');
var pgStructure = require('../index');

var lab         = exports.lab = Lab.script();
var describe    = lab.describe;
var it          = lab.it;
var testDB      = require('./util/test-db.js');
var expect      = Chai.expect;

var dbs = {};
var db;
var index;

lab.before((done) => {
    testDB.createDB('1')
        .then(() => pgStructure(testDB.credentials, ['public', 'other_schema']))
        .then((result) => {
            dbs.fromDB      = result;
            dbs.fromFile    = pgStructure.deserialize(pgStructure.serialize(result));
            done();
        })
        .catch((err) => {
            console.log(err.stack);
        });
});

lab.after((done) => {
    testDB.dropDB().then(() => {
        done();
    });
});

var tests = function(key) {
    return function() {
        lab.before((done) => {
            db = dbs[key];
            index = [...db.get('public.contact').indexes.values()][3];
            done();
        });

        it('should have name.', function(done) {
            expect(index.name).to.equal('IX_Unique_Full_Name');
            done();
        });

        it('should have fullName.', function(done) {
            expect(index.fullName).to.equal('public.IX_Unique_Full_Name');
            done();
        });

        it('should have fullCatalogName.', function(done) {
            expect(index.fullCatalogName).to.equal('pg-test-util.public.IX_Unique_Full_Name');
            done();
        });

        it('should have table.', function(done) {
            expect(index.table.name).to.equal('contact');
            done();
        });

        it('should have parent.', function(done) {
            expect(index.table.name).to.equal('contact');
            done();
        });

        it('should have schema.', function(done) {
            expect(index.schema.name).to.equal('public');
            done();
        });

        it('should have db.', function(done) {
            expect(index.db.name).to.equal('pg-test-util');
            done();
        });

        it('should have columns.', function(done) {
            let columns = [...index.columns.values()];
            expect(columns[0].name).to.equal('name');
            expect(columns[1].name).to.equal('surname');
            done();
        });

        it('should have columns.get().', function(done) {
            expect(index.columns.get('name').name).to.equal('name');
            expect(index.columns.get('surname').name).to.equal('surname');
            done();
        });

    };
};

describe('Index from Database', tests('fromDB'));
describe('Index from File', tests('fromFile'));
