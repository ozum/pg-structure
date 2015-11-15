'use strict';
var Lab         = require('lab');
var Chai        = require('chai');
var pgStructure = require('../lib');

var lab         = exports.lab = Lab.script();
var describe    = lab.describe;
var it          = lab.it;
var testDB      = require('./util/test-db.js');
var expect      = Chai.expect;

var db;
var o2m;

lab.before((done) => {
    testDB.createDB('1')
        .then(() => {
            return pgStructure(testDB.credentials, ['public', 'other_schema']);
        })
        .then((result) => {
            db = result;
            o2m = db.get('public.cart').o2mRelations[0];
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

describe('o2mRelation attributes', function() {
    it('should have type.', function(done) {
        expect(o2m.type).to.equal('ONE TO MANY');
        done();
    });

    it('should have sourceTable.', function(done) {
        expect(o2m.sourceTable.name).to.equal('cart');
        done();
    });

    it('should have targetTable.', function(done) {
        expect(o2m.targetTable.name).to.equal('cart_line_item');
        done();
    });

    it('should have constraint.', function(done) {
        expect(o2m.constraint.name).to.equal('cart_has_products');
        expect(o2m.constraint.columns[0].name).to.equal('cart_id');
        done();
    });
});
