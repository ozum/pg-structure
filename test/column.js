/*jslint node: true */
/*global describe, it, before, beforeEach, after, afterEach */
"use strict";

var assert          = require('chai').assert;
var dbModule        = require('../lib/util/db.js');
var columnModule    = require('../lib/util/column.js');
var table, column, columnNumeric, columnAutoInc, columnUdt, columnChar, columnArrayDate, columnDate;

beforeEach(function (done) {
    table = dbModule({name: 'db'}).addSchema({name: 'public'}).addTable({name: 'account'});
    column = table.addColumn({
        name                : 'scores',
        default             : undefined,
        allowNull           : false,
        type                : 'array',
        enumValues          : undefined,
        length              : 32,
        precision           : undefined,
        scale               : undefined,
        arrayType           : 'integer',
        arrayDimension      : 2,
        description         : 'Last 2 scores'
    });
    columnArrayDate = table.addColumn({
        name                : 'date_list',
        default             : undefined,
        allowNull           : false,
        type                : 'array',
        enumValues          : undefined,
        length              : 0,
        precision           : undefined,
        scale               : undefined,
        arrayType           : 'date',
        arrayDimension      : 2,
        description         : 'Last 2 dates'
    });
    columnDate = table.addColumn({
        name                : 'birth_date',
        type                : 'date',
        length              : 0
    });
    columnNumeric = table.addColumn({
        name                : 'success_ratio',
        default             : undefined,
        allowNull           : false,
        type                : 'numeric',
        enumValues          : undefined,
        precision           : 4,
        scale               : 2,
        description         : 'Success percentage'
    });
    columnAutoInc = table.addColumn({
        name                : 'id',
        default             : "nextval('account_id_seq'::regclass)",
        allowNull           : false,
        type                : 'integer',
        description         : 'Auto increment'
    });
    columnUdt = table.addColumn({
        name                : 'column_udt',
        type                : 'user-defined',
        udType              : 'tax_number'
    });
    columnChar = table.addColumn({
        name                : 'surname',
        type                : 'character',
        length              : 25
    });
    done();
});

describe('Column function', function () {
    it('should throw error if no args provided', function () {
        assert.throw(function () { columnModule(); }, /column arguments are required/);
    });
    it('should throw error if arguments are not validated', function () {
        assert.throw(function () { columnModule({ corruptParam: true }); }, /column\. ValidationError/);
    });
});

describe('Attribute functions', function () {
    it('should get name', function () {
        assert.equal(column.name(), 'scores');
    });
    it('should get default', function () {
        assert.equal(column.default(), undefined);
    });
    it('should get allowNull', function () {
        assert.equal(column.allowNull(), false);
    });
    it('should get type', function () {
        assert.equal(column.type(), 'array');
    });
    it('should get enumValues', function () {
        assert.equal(column.enumValues(), undefined);
    });
    it('should get length', function () {
        assert.equal(column.length(), 32);
    });
    it('should get precision', function () {
        assert.equal(column.precision(), undefined);
    });
    it('should get scale', function () {
        assert.equal(column.scale(), undefined);
    });
    it('should get arrayType', function () {
        assert.equal(column.arrayType(), 'integer');
    });
    it('should get arrayDimension', function () {
        assert.equal(column.arrayDimension(), 2);
    });
    it('should get description', function () {
        assert.equal(column.description(), 'Last 2 scores');
    });
    it('should get isAutoIncrement', function () {
        assert.equal(column.isAutoIncrement(), false);
        assert.equal(columnAutoInc.isAutoIncrement(), true);
    });
    it('should get isPrimaryKey', function () {
        assert.equal(column.isPrimaryKey(), undefined);
    });
    it('should get isForeignKey', function () {
        assert.equal(column.isForeignKey(), undefined);
    });
    it('should get unique', function () {
        assert.equal(column.unique(), undefined);
    });
    it('should get sequelizeType', function () {
        assert.equal(columnNumeric.sequelizeType(), 'DataTypes.DECIMAL(4,2)');
        assert.equal(columnChar.sequelizeType(), 'DataTypes.CHAR(25)');
        assert.equal(column.sequelizeType(), 'DataTypes.ARRAY(DataTypes.ARRAY(DataTypes.INTEGER(32)))');
        assert.equal(columnArrayDate.sequelizeType(), 'DataTypes.ARRAY(DataTypes.ARRAY(DataTypes.DATEONLY))');
        assert.equal(columnDate.sequelizeType(), 'DataTypes.DATEONLY');
    });
    it('should get precision', function () {
        assert.equal(columnNumeric.precision(), 4);
    });
    it('should get scale', function () {
        assert.equal(columnNumeric.scale(), 2);
    });
    it('should get user defined type', function () {
        assert.equal(columnUdt.udType(), 'tax_number');
    });

});