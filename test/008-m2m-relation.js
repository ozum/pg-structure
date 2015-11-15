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
var m2m;

lab.before((done) => {
    testDB.createDB('1')
        .then(() => {
            return pgStructure(testDB.credentials, ['public', 'other_schema']);
        })
        .then((result) => {
            db = result;
            m2m = db.get('public.cart').m2mRelations[0];
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

describe('O2MRelation attributes', function() {
    it('should have type.', function(done) {
        expect(m2m.type).to.equal('MANY TO MANY');
        done();
    });

    it('should have sourceTable.', function(done) {
        expect(m2m.sourceTable.name).to.equal('cart');
        done();
    });

    it('should have joinTable.', function(done) {
        expect(m2m.joinTable.name).to.equal('cart_line_item');
        done();
    });

    it('should have targetTable.', function(done) {
        expect(m2m.targetTable.name).to.equal('product');
        done();
    });

    it('should have sourceConstraint.', function(done) {
        expect(m2m.sourceConstraint.name).to.equal('cart_has_products');
        expect(m2m.sourceConstraint.columns[0].name).to.equal('cart_id');
        done();
    });

    it('should have targetConstraint.', function(done) {
        expect(m2m.targetConstraint.name).to.equal('product_has_carts');
        expect(m2m.targetConstraint.columns[0].name).to.equal('product_id');
        done();
    });
});
