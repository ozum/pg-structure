/*jslint node: true */
/*global describe, it, before, beforeEach, after, afterEach */
"use strict";

var assert          = require('chai').assert;
var dbModule        = require('../lib/util/db.js');
var db, schema, tableCart, tableProduct, tableLineItem;

beforeEach(function (done) {
    db              = dbModule({ name: 'shop' });
    schema          = db.addSchema({ name: 'public' });
    tableCart       = schema.addTable({ name: 'cart' });
    tableProduct    = schema.addTable({ name: 'product' });
    tableLineItem   = schema.addTable({ name: 'line_item' });
    tableCart.addColumn({ name: 'id', type: 'integer' }).isPrimaryKey(true);
    tableCart.addColumn({ name: 'name', type: 'character varying', length: 20 });
    tableProduct.addColumn({ name: 'id', type: 'integer' }).isPrimaryKey(true);
    tableProduct.addColumn({ name: 'name', type: 'character varying', length: 20 });
    tableLineItem.addColumn({ name: 'product_id', type: 'integer' });
    tableLineItem.addColumn({ name: 'cart_id', type: 'integer' });
    tableLineItem.addForeignKey({
        constraintName      : 'product_has_line_items',
        columnName          : 'product_id',
        foreignColumnName   : 'id',
        foreignSchemaName   : 'public',
        foreignTableName    : 'product'
    });
    tableLineItem.addForeignKey({
        constraintName      : 'cart_has_line_items',
        columnName          : 'cart_id',
        foreignColumnName   : 'id',
        foreignSchemaName   : 'public',
        foreignTableName    : 'cart'
    });

    done();
});

describe('addForeignKey', function () {
    it('should add has many through both to tables.', function () {
        assert.equal(tableCart.hasManyThrough('cart_has_line_items&product_has_line_items').name(), 'cart_has_line_items&product_has_line_items');
        assert.equal(tableProduct.hasManyThrough('product_has_line_items&cart_has_line_items').name(), 'product_has_line_items&cart_has_line_items');
    });
});

describe('hasManyThrough constraint', function () {
    it('should have referencing table', function () {
        assert.equal(tableCart.hasManyThrough('cart_has_line_items&product_has_line_items').referencesTable().name(), 'product');
        assert.equal(tableProduct.hasManyThrough('product_has_line_items&cart_has_line_items').referencesTable().name(), 'cart');
    });
    it('should have through table', function () {
        assert.equal(tableCart.hasManyThrough('cart_has_line_items&product_has_line_items').through().name(), 'line_item');
        assert.equal(tableProduct.hasManyThrough('product_has_line_items&cart_has_line_items').through().name(), 'line_item');
    });
    it('should have parent table', function () {
        assert.equal(tableCart.hasManyThrough('cart_has_line_items&product_has_line_items').table().name(), 'cart');
        assert.equal(tableProduct.hasManyThrough('product_has_line_items&cart_has_line_items').table().name(), 'product');

    });
    it('should have foreign keys', function () {
        assert.equal(tableCart.hasManyThrough('cart_has_line_items&product_has_line_items').foreignKey('cart_id').table().name(), 'line_item');
        assert.equal(tableProduct.hasManyThrough('product_has_line_items&cart_has_line_items').foreignKey('product_id').table().name(), 'line_item');
    });
});

describe('hasManyThrough constraint\'s foreign keys', function () {
    it('should be same object of original foreign key constraint', function () {
        assert.isTrue(tableCart.hasManyThrough('cart_has_line_items&product_has_line_items').internalObjectForeignKeys === tableLineItem.foreignKeyConstraint('cart_has_line_items').internalObjectForeignKeys);
    });
});

describe('hasManyThroughs function', function () {
    it('should get has many through constraints by order without callback.', function () {
        assert.equal(tableCart.hasManyThroughs()[0].name(), 'cart_has_line_items&product_has_line_items');
    });
});

describe('hasManyThroughsByName function', function () {
    it('should get has many through constraints by order without callback.', function () {
        assert.equal(tableCart.hasManyThroughsByName()['cart_has_line_items&product_has_line_items'].name(), 'cart_has_line_items&product_has_line_items');
    });
});
