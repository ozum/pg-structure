'use strict';
var Lab         = require('lab');
var Chai        = require('chai');
var pgStructure = require('../lib/pg-structure');

var lab         = exports.lab = Lab.script();
var describe    = lab.describe;
var it          = lab.it;
var testDB      = require('./util/test-db.js');
var expect      = Chai.expect;

var db;

lab.before((done) => {
    testDB.createDB('1')
        .then(() => {
            return pgStructure(testDB.credentials, ['public', 'other_schema']);
        })
        .then((result) => {
            db = result;
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

describe('DB attributes', function() {
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

    it('should have schemas.', function(done) {
        expect(db.schemas[0].name).to.equal('other_schema');
        expect(db.schemas[1].name).to.equal('public');
        done();
    });

    it('should have schemasByName.', function(done) {
        let schema = 'other_schema';
        expect(db.schemasByName[schema].name).to.equal('other_schema');
        expect(db.schemasByName.public.name).to.equal('public');
        done();
    });
});

describe('DB methods', function() {
    it('should have getSchema().', function(done) {
        expect(db.getSchema('public').name).to.equal('public');
        done();
    });

    it('should have schemaExists().', function(done) {
        expect(db.schemaExists('public')).to.equal(true);
        expect(db.schemaExists('not_available')).to.equal(false);
        done();
    });

    it('should have get().', function(done) {
        expect(db.get('public').name).to.equal('public');
        expect(db.get('public.account.id').name).to.equal('id');
        done();
    });

    it('should have getSchemas().', function(done) {
        var schemas = [];
        db.getSchemas((schema) => {
            schemas.push(schema);
        });

        expect(schemas[0].name).to.equal('other_schema');
        expect(schemas[1].name).to.equal('public');

        done();
    });
});
