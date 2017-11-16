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
var schema;

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
            schema = db.schemas.get('public');
            done();
        });

        it('should have name.', function(done) {
            expect(schema.name).to.equal('public');
            done();
        });

        it('should have fullName.', function(done) {
            expect(schema.fullName).to.equal('public');
            done();
        });

        it('should have fullCatalogName.', function(done) {
            expect(schema.fullCatalogName).to.equal('pg-test-util.public');
            done();
        });

        it('should have comment.', function(done) {
            expect(schema.comment).to.equal('public schema comment');
            done();
        });

        it('should have description.', function(done) {
            expect(schema.description).to.equal('public schema comment');
            done();
        });

        it('should have parent.', function(done) {
            expect(schema.parent.name).to.equal('pg-test-util');
            done();
        });

        it('should have db.', function(done) {
            expect(schema.db.name).to.equal('pg-test-util');
            done();
        });

        it('should have tables.get().', function(done) {
            expect(schema.tables.get('account').name).to.equal('account');
            done();
        });

        it('should have tables.has().', function(done) {
            expect(schema.tables.has('account')).to.equal(true);
            done();
        });
    };
};

describe('Schema from Database', tests('fromDB'));
describe('Schema from File', tests('fromFile'));


describe('Non existing schema', () => {
  it('should throw exception', (done) => {

    pgStructure(testDB.credentials, ['non_existing_schema'])
      .catch(err => {
        if (err.message === 'non_existing_schema does not exists on database.') {
          done();
        } else {
          throw new Error();
        }
      });
  });
});
