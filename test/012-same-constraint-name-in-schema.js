'use strict';
var Lab         = require('lab');
var Chai        = require('chai');
var pgStructure = require('../lib/pg-structure');

var lab         = exports.lab = Lab.script();
var describe    = lab.describe;
var it          = lab.it;
var testDB      = require('./util/test-db.js');
var expect      = Chai.expect;

var dbs = {};
var db;
var constraint;

lab.before((done) => {
    testDB.createDB('4')
        .then(() => pgStructure(testDB.credentials, ['public', 'nir']))
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
    return done();
});

let tests = function(key) {
    lab.before((done) => {
        db = dbs[key];
        done();
    });

    return function() {
        it('should have constraint.', function(done) {
            expect(db.get('nir.nir_links').constraints.get('nir_links_fk3').name).to.equal('nir_links_fk3');
            done();
        });
    };
};

describe('Constraint from Database', tests('fromDB'));
describe('Constraint from File', tests('fromFile'));
