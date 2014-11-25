/*jslint node: true */
/*global describe, it, before, beforeEach, after, afterEach */
"use strict";

var assert              = require('chai').assert;
var constraintModule    = require('../lib/util/constraint.js');


describe('Constraint function', function () {
    it('should throw error if no args provided.', function () {
        assert.throw(function () { constraintModule(); }, /constraint arguments are required/);
    });
    it('should throw error if arguments are not validated.', function () {
        assert.throw(function () { constraintModule({ corruptParam: true }); }, /constraint\. ValidationError: name is required/);
    });
});
