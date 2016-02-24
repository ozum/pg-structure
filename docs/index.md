# Welcome to pg-structure

**pg-structure** is a Node.js library to get structure of a [PostgreSQL](http://www.postgresql.org) database automatically as a detailed object.


<table style="border:none; border-spacing: 10px; border-collapse: separate;">
    <tr>
        <td style="width:28%; padding:10px 10px 10px 10px; border:1px solid #CCCCCC; background:#EEEEEE;">
            <strong>Tested</strong><br>
            Every part of the library is tested.
        </td>
        <td style="width:28%; padding:10px 10px 10px 10px; border:1px solid #CCCCCC; background:#EEEEEE;">
            <strong>Documented</strong><br>
            Everything is documented, no hidden features.
        </td>
        <td style="width:28%; padding:10px 10px 10px 10px; border:1px solid #CCCCCC; background:#EEEEEE;">
            <strong>Utilitarian</strong><br>
            Beyond database objects (i.e. <a href="http://www.pg-structure.com/api/M2MRelation/">many to many relation</a>, <a href="http://www.pg-structure.com/concepts/">description data</a>).
        </td>
    </tr>
</table>

pg-structure examines given PostgreSQL database by reverse engineering and lets you easily code, analyze, operate on PostgreSQL database structure by providing details about [DB](http://www.pg-structure.com/api/DB/), [Schema](http://www.pg-structure.com/api/Schema/), [Table](http://www.pg-structure.com/api/Table/), [Column](http://www.pg-structure.com/api/Column/), [Constraint](http://www.pg-structure.com/api/Constraint/), [Relation](http://www.pg-structure.com/api/Relation/) and [Index](http://www.pg-structure.com/api/Index/).

Created object can be used to auto generate documentation or ORM models from database. It is much easier to work with JS object than working manually with database.

## Example

    var pgStructure = require('pg-structure');
           
    pgStructure({database: 'db', user: 'user', password: 'password'}, ['public', 'other_schema'])
        .then((db) => { console.log( db.get('public.account').columns.get('is_active').type ); })
        .catch(err => console.log(err.stack));

## Detailed Example

    var pgStructure = require('pg-structure');

    pgStructure({database: 'db', user: 'user', password: 'password', host: 'localhost', port: 5432}, ['public', 'other_schema'])
        .then((db) => {
            // Basic
            var tables = db.schemas.get('public').tables;  // Map of Table objects.
    
            // List of table names
            for (let table of tables.values()) {
                console.log(table.name);
            }
    
            // Long chain example for:
            // public schema -> cart table -> contact_id column -> foreign key constraints of contact_id.
            var constraints = db.get('public.cart.contact_id').foreignKeyConstraints;
            var sameName = db.schemas.get('public').tables.get('cart').columns.get('contact_id').foreignKeyConstraints;
    
            // Many to many relation. Returns cart_line_item for cart --< cart_line_item >-- product
            var joinTable = [...db.get('public.cart').m2mRelations.values()][0].joinTable;    // See JS Map  on https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Map
        })
        .catch(err => console.log(err.stack));

## Load & Save Example

You can save reverse engineered database for later to load. If you use `.zip` extension, pg-structure automatically
compresses file as zip file. 

    var pgStructure = require('pg-structure');

    pgStructure({database: 'db', user: 'user', password: 'password', host: 'localhost', port: 5432}, ['public', 'other_schema'])
        .then(db => pgStructure.save('./db.zip', db))
        .catch(err => console.log(err.stack));
    
... Later, you can load pg-structure. Loading is 10 times faster than reverse engineering database.  

    var pgStructure = require('pg-structure');
    
    pgStructure.load('./db.zip')
        .then(db => console.log(db.schemas.get('public').name))
        .catch(err => console.log(err.stack));

<img src="http://www.pg-structure.com/images/warning-24.png" style="margin-left: -26px;">**Caveat**: pgStructure cannot
load files saved by incompatible pg-structure module versions and returns `undefined`. In this case you should
fetch structure from database and create a new save file.

## Features

* Fully tested
* Fully documented with JSDOC and HTML
* Supports load, save, serialize, deserialize, toString, parse.
* All PostgreSQL data types including array, JSON and HSTore
* Support composite keys (Multiple field keys)
* Schema support
* Constraints (Primary Key, Foreign Key, Unique).
* Supports multi-column constraints.
* Identifies one to many (hasMany) relationships.
* Identifies reverse of one to many (belongsTo) relationships
* Identifies all possible many to many (belongs to many & has many through) relationships
* Objects can be accessed by name or by order. (Uses Map to save order and allow named access.)
* Objects can be iterated via callbacks.
* Allows to store and extract JSON data from Database objects. (See Description Data in <a href="http://www.pg-structure.com/concepts/">concepts</a>.)
* Very detailed column meta data:
    * Allow null
    * Description
    * Auto Increment
    * onUpdate
    * onDelete
    * etc. (Full details can be found in [Column](http://www.pg-structure.com/api/Column) doc)
* Support for:
    * DB
    * Schema
    * Table
    * Column
    * Constraint
    * Index
    * Relation

## Where to Start?

First have look at [concepts](http://localhost:63342/pg-structure3/site/concepts/) to understand a few key points.
You may want to read [examples](http://localhost:63342/pg-structure3/site/examples/) to see how **pg-structure** can be used.
To start coding read main [pg-structure](http://localhost:63342/pg-structure3/site/api/PgStructure/) module's documentation.
During development API references helps you.

## Special Thanks
**pg-structure** is developed under sponsorship of [Fortibase](http://www.fortibase.com) and released as open source. See [license](http://www.pg-structure.com/license/).

Also documentation is auto generated thanks to:

* [MkDocs](http://www.mkdocs.org/) using a [theme](https://github.com/snide/sphinx_rtd_theme) provided by [Read the Docs](https://readthedocs.org/).
* Markdown is generated by [jsdoc-to-markdown](https://www.npmjs.com/package/jsdoc-to-markdown)

## Contributions

* For contribution please send pull requests with tests on [GitHub](https://github.com/ozum/pg-structure.git).
* Send bugs and feature requests to [GitHub Issues](https://github.com/ozum/pg-structure/issues).

