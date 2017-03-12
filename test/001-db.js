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
            done();
        });

        it('should have name.', function(done) {
            expect(db.name).to.equal('pg-test-util');
            done();
        });

        it('should have fullName.', function(done) {
            expect(db.fullName).to.equal('pg-test-util');
            done();
        });

        it('should have fullCatalogName.', function(done) {
            expect(db.fullCatalogName).to.equal('pg-test-util');
            done();
        });

        it('should have schemas.get().', function(done) {
            expect(db.schemas.get('other_schema').name).to.equal('other_schema');
            expect(db.schemas.get('public').name).to.equal('public');
            done();
        });

        it('should have schemas.has().', function(done) {
            expect(db.schemas.has('other_schema')).to.equal(true);
            done();
        });

        it('should have get().', function(done) {
            expect(db.get('public').name).to.equal('public');
            expect(db.get('public.account.id').name).to.equal('id');
            done();
        });
    }
};

describe('DB from Database', tests('fromDB'));
describe('DB from File', tests('fromFile'));
