# pg-structure

Get PostgreSQL database structure as a detailed JS Object.

## Synopsis

    var pgs     = require('pg-structure');
    var util    = require('util');

    pgs('127.0.0.1', 'node', 'user', 'password', { schema: ['public', 'other_schema'] }, function (err, db) {
        console.log(db.schema('public').name());
        db.schema('public').tables(function (table) {
            console.log(table.name());
        });
        console.log(db.schema('public').table('cart').column('contact_id').foreignKeyConstraint().referencesTable().name());
    });

## Abstract

pg-structure creates a detailed object of a PostgreSQL database. This object may be used to auto generate
documentation or ORM models from database. It is much easier to work with JS object than working manually
with database.

## Description

pg-structure connects to a PostgreSQL database, examines its structure and creates an JS object. The passed callback
is executed with result object as parameter.

## Features

* Fully tested (Istanbul-JS coverage reports are in coverage folder)
* Fully documented with JSDOC and HTML (HTML docs are in doc directory)
* All PostgreSQL data types including array, JSON and HSTore
* Support composite keys (Multiple field keys)
* Schema support
* Primary Keys
* Foreign Keys
* Unique Keys
* Unique Indexes
* Identifies hasMany relationships
* Identifies possible many to many relationships (through relationships)
* Columns can be accessed by name or by order. (Contains object and array referencing to this objects fields)
* Very detailed column meta data:
    * Allow null
    * Description
    * Auto Increment
    * onUpdate
    * onDelete
    * etc. (Full details can be found in callback parameter doc)

## Contributions

All contributions are welcome. Please send bug reports with tests and small piece of code.

## JSDOC Output

