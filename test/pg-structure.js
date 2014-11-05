var assert          = require('chai').assert;
var structure       = require('../lib/pg-structure.js');
var controlObject    = require('./util/result.js');
var fs              = require('fs');
var path            = require('path');
var pg              = require('pg');
var async           = require('async');
var dbConfig        = { host: 'localhost', port:5432, user: 'user', password: 'password'  };

var conStringTest       = 'postgres://user:password@127.0.0.1:5432/pg_generator_test_724839'; //'postgres://user:pass@host:port/db'
var conStringTemplate   = 'postgres://user:password@127.0.0.1:5432/node'; //'postgres://user:pass@host:port/db'

var sql = {
    createDB        : "CREATE DATABASE pg_generator_test_724839 WITH ENCODING = 'UTF8' TEMPLATE = template0;",
    dropDB          : "DROP DATABASE IF EXISTS pg_generator_test_724839;",
    createSchema    : fs.readFileSync(path.join(__dirname, 'util/create-test-db.sql')).toString(),
    dropConnection  : "SELECT pg_terminate_backend(pid) FROM pg_stat_activity where datname='pg_generator_test_724839';"
};

pg.on('error', function (err) {
    // Do nothing on termination due to admin. We do this to drop previously created test db.
    if (! err.message.match('terminating connection due to administrator command')) { console.log('Database error!', err); }
});

function resetDB(callback) {
    var client = new pg.Client(conStringTemplate);

    client.connect(function(err) {
        async.series([
            client.query.bind(client, sql.dropConnection),
            client.query.bind(client, sql.dropDB),
            client.query.bind(client, sql.createDB),
            function(next) {
                var clientTest = new pg.Client(conStringTest);
                clientTest.connect(function(err) {
                    clientTest.query(sql.createSchema, function(err, result) {
                        clientTest.end();
                        next();
                    });
                });
            }
        ], function(err, result) {
            if (err) { throw err; }
            client.end();
            callback();
        });
    });
}

function dropDB(callback) {
    var client = new pg.Client(conStringTemplate);

    client.connect(function(err) {
        async.series([
            client.query.bind(client, sql.dropConnection),
            client.query.bind(client, sql.dropDB),
        ], function(err, result) {
            if (err) { throw new Error('jj');  }
            client.end();
            callback();
        });
    });
}



describe('Module', function() {
    before(function(done) {
        resetDB(done)
    });

    after(function(done) {
        dropDB(done);
        done();
    })

    it('should process db schema & generate structure', function (done) {
        structure('localhost', 'pg_generator_test_724839', dbConfig.user, dbConfig.password, 'public', function(err, result) {
            //fs.writeFileSync('deneme.json', require('util').inspect(result, {depth:null}) );
            assert.deepEqual(result, controlObject);
            done();
        });
    });

});



