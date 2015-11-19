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
var m2o;

lab.before((done) => {
    testDB.createDB('1')
        .then(() => {
            return pgStructure(testDB.credentials, ['public', 'other_schema']);
        })
        .then((result) => {
            db = result;
            m2o = db.get('public.cart_line_item').m2oRelations[0];
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

describe('m2oRelation attributes', function() {
    it('should have type.', function(done) {
        expect(m2o.type).to.equal('MANY TO ONE');
        done();
    });

    it('should have sourceTable.', function(done) {
        expect(m2o.sourceTable.name).to.equal('cart_line_item');
        done();
    });

    it('should have targetTable.', function(done) {
        expect(m2o.targetTable.name).to.equal('cart');
        done();
    });

    it('should have constraint.', function(done) {
        expect(m2o.constraint.name).to.equal('cart_has_products');
        expect(m2o.constraint.columns[0].name).to.equal('cart_id');
        done();
    });
});
