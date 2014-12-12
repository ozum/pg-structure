/*jslint node: true */
/*global describe, it, before, beforeEach, after, afterEach */
"use strict";

var assert          = require('chai').assert;
var structure       = require('../lib/pg-structure.js');
var testDB          = require('./util/db.js');
var db;

before(function (done) {
    testDB.resetDB(1, function () {
        structure('localhost', 'pg_generator_test_724839', testDB.dbConfig.user, testDB.dbConfig.password, {schema: ['public', 'other_schema']}, function (err, result) {
            if (err) { throw err; }
            db = result;
            done();
        });
    });
});

after(function (done) {
    testDB.dropDB(done);
});

describe('DB Object', function () {
    it('should be defined', function () {
        assert.equal(db.name(), 'pg_generator_test_724839');
    });
    it('should have "public" schema', function () {
        assert.equal(db.schema('public').name(), 'public');
    });
    it('should have "other_schema" schema', function () {
        assert.equal(db.schema('other_schema').name(), 'other_schema');
    });
});

describe('Inter-Schema Relationship', function () {
    it('should work', function () {
        assert.equal(db.schema('other_schema').table('other_schema_table').column('account_id').foreignKeyConstraint().referencesTable().name(), 'account');
    });
});

describe('User Defined Type', function () {
    it('should have udtType', function () {
        assert.equal(db.schema('public').table('type_table').column('company').type(), 'user-defined');
        assert.equal(db.schema('public').table('type_table').column('company').udType(), 'composite_udt');

    });
    it('should have Sequelize Type', function () {
        assert.equal(db.schema('public').table('type_table').column('company').sequelizeType(), 'DataTypes.STRING');
    });
});

describe('Column Default:', function () {
    it('contact should have some default values.', function () {
        assert.equal(db.schema('public').table('contact').column('name').default(), '\'oz\'');
        assert.equal(db.schema('public').table('contact').column('surname').default(), '\'O\'\'Reilly\'');
        assert.equal(db.schema('public').table('contact').column('birth_date').default(), '\'2010-01-01\'');
        assert.equal(db.schema('public').table('contact').column('is_active').default(), 'true');
        assert.equal(db.schema('public').table('contact').column('email').default(), '\'x"x@x.com\'');
    });
    it('contact should have some default values with typecast.', function () {
        assert.equal(db.schema('public').table('contact').column('name').defaultWithTypeCast(), '\'oz\'::character varying');
        assert.equal(db.schema('public').table('contact').column('surname').defaultWithTypeCast(), '\'O\'\'Reilly\'::character varying');
        assert.equal(db.schema('public').table('contact').column('birth_date').defaultWithTypeCast(), '\'2010-01-01\'::date');
        assert.equal(db.schema('public').table('contact').column('is_active').defaultWithTypeCast(), 'true');
        assert.equal(db.schema('public').table('contact').column('email').defaultWithTypeCast(), '\'x"x@x.com\'::character varying');
    });

    it('cart_line_item should have some default values.', function () {
        assert.equal(db.schema('public').table('cart_line_item').column('quantity').default(), 1);
    });
});

describe('Description:', function () {
    it('cart_line_item_audit_log should have some description.', function () {
        assert.equal(db.schema('public').table('cart_line_item_audit_log').column('created_at').description(), 'Kaydın oluşturulduğu zaman.');
        assert.equal(db.schema('public').table('cart_line_item_audit_log').column('cart_id').description(), 'Sepet atılan ürünün sepet id\'si.');
    });
});

describe('type_table options column', function () {
    it('should have sequelize type enum.', function () {
        assert.equal(db.schema('public').table('type_table').column('options').sequelizeType(), "DataTypes.ENUM('option_a', 'option_b')");
    });
    it('should have enumValues.', function () {
        assert.equal(db.schema('public').table('type_table').column('options').enumValues(), "{option_a,option_b}");
    });
});

describe('account.account_has_other_schema_tables has many constraint', function () {
    it('should have onDelete and onUpdate', function () {
        assert.equal(db.schema('public').table('account').hasMany('account_has_second_contacts').onDelete(), 'SET NULL');
        assert.equal(db.schema('public').table('account').hasMany('account_has_second_contacts').onUpdate(), 'CASCADE');
        assert.equal(db.schema('public').table('account').hasMany('account_has_contacts').onDelete(), 'NO ACTION');
        assert.equal(db.schema('public').table('account').hasMany('account_has_contacts').onUpdate(), 'NO ACTION');
    });
});

describe('contact Table', function () {
    it('should have foreign key in cart table.', function () {
        assert.equal(db.schema('public').table('cart').foreignKeyConstraint('contact_has_carts').name(), 'contact_has_carts');
        assert.equal(db.schema('public').table('cart').foreignKeyConstraint('contact_has_carts').foreignKey(0).name(), 'contact_id');
    });
    it('should have many contacts.', function () {
        assert.equal(db.schema('public').table('contact').hasMany('contact_has_carts').name(), 'contact_has_carts');
        assert.equal(db.schema('public').table('contact').hasMany('contact_has_carts').foreignKey(0).name(), 'contact_id');
    });
});

describe('cart Table', function () {
    it('should have many products through cart line items.', function () {
        assert.equal(db.schema('public').table('cart').hasManyThrough('cart_has_products').name(), 'cart_has_products');
        assert.equal(db.schema('public').table('cart').hasManyThrough('cart_has_products').foreignKey(0).name(), 'cart_id');
    });
});

describe('product Table', function () {
    it('should have many carts through cart line items.', function () {
        assert.equal(db.schema('public').table('product').hasManyThrough('product_has_carts').name(), 'product_has_carts');
        assert.equal(db.schema('public').table('product').hasManyThrough('product_has_carts').foreignKey(0).name(), 'product_id');
    });
});

describe('db.get function', function () {
    it('should get schema', function () {
        assert.equal(db.get('public').name(), 'public');
    });
    it('should get table', function () {
        assert.equal(db.get('public.product').name(), 'product');
    });
    it('should get column', function () {
        assert.equal(db.get('public.product.name').name(), 'name');
    });
});

describe('schema.get function', function () {
    it('should get table', function () {
        assert.equal(db.schema('public').get('product').name(), 'product');
    });
    it('should get column', function () {
        assert.equal(db.schema('public').get('product.name').name(), 'name');
    });
});

describe('column.get function', function () {
    it('should get column', function () {
        assert.equal(db.schema('public').table('product').get('name').name(), 'name');
    });
});

describe('account.field4', function () {
    it('should have correct sequelizeType', function () {
        assert.equal(db.get('public.account.field4').sequelizeType(), 'DataTypes.ARRAY(DataTypes.ARRAY(DataTypes.DATE))');
    });
});

describe('cart', function() {
    it('should access own foreign key in through table', function () {
        assert.equal(db.get('public.cart').hasManyThrough('cart_has_products').foreignKey(0).name(), 'cart_id');
    });
    it('should access through foreign key in through table', function () {
        assert.equal(db.get('public.cart').hasManyThrough('cart_has_products').throughForeignKeyConstraint().foreignKey(0).name(), 'product_id');
    });

});