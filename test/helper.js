/*jslint node: true */
/*global describe, it, before, beforeEach, after, afterEach */
"use strict";

var assert      = require('chai').assert;
var helper      = require('../lib/util/helper.js');

describe('objectsByName function', function () {
    it('should throw error for non-validated parameters.', function () {
        assert.throw(function () { helper.objectsByName(0); }, /attribute is required/);
    });
});

describe('objectsByOrder function', function () {
    it('should throw error for non-validated parameters.', function () {
        assert.throw(function () { helper.objectsByOrder(0); }, /attribute is required/);
    });
});

describe('objectsByName function', function () {
    it('should throw error for non-validated parameters.', function () {
        assert.throw(function () { helper.objectsByOrder(0); }, /attribute is required/);
    });
});

describe('accessor function', function () {
    it('should throw error for non-validated parameters.', function () {
        assert.throw(function () { helper.accessor(0); }, /attribute is required/);
    });
});

describe('getObject function', function () {
    it('should throw error for non-validated parameters.', function () {
        assert.throw(function () { helper.getObject(0); }, /ValidationError:/);
    });
});



