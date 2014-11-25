/*jslint node: true, nomen: true, stupid: true */
/*global describe, it, before, beforeEach, after, afterEach, on */

"use strict";

var assert          = require('chai').assert;
var structure       = require('../lib/pg-structure-plain-object.js');
var controlObject   = require('./util/result.js');
var testDB          = require('./util/db.js');


describe('Module', function () {
    before(function (done) {
        testDB.resetDB(done);
    });

    after(function (done) {
        testDB.dropDB(done);
    });

    it('should process db schema & generate structure', function (done) {
        structure('localhost', 'pg_generator_test_724839', testDB.dbConfig.user, testDB.dbConfig.password, {schema: ['public', 'other_schema']}, function (err, result) {
            if (err) { throw err; }
            //require('fs').writeFileSync('deneme.json', require('util').inspect(result, {depth:null}) );
            assert.deepEqual(result, controlObject);
            done();
        });
    });
});



