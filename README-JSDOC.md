# pg-structure

Get PostgreSQL database structure as a detailed JS Object.

## Synopsis

    var pg-structure = require('pg-structure');
    var util         = require('util');
    pg-structure('localhost', 'db', 'user', 'password', { schema: 'public', port: 5432 }, function(result) {console.log(util.inspect(result, {depth: null}));} );
    pg-structure('localhost', 'db', 'user', 'password', 'public', function(result) {console.log(JSON.stringify(result));} );

## Abstract

pg-structure creates a detailed object of a PostgreSQL database. This object may be used to auto generate
documentation or ORM models from database. It is much easier to work with JS object than working manually
with database.

## Description

pg-structure connects to a PostgreSQL database, examines its structure and creates an JS object. The passed callback
is executed with result object as parameter.

## Features

* Fully documented with JSDOC and HTML including public and private API (HTML docs are in doc directory)
* All PostgreSQL data types including array, JSON and HSTore
* Support composite keys (Multiple field keys)
* Schema support
* Primary Keys
* Foreign Keys
* Unique Keys
* Unique Indexes
* Identifies hasMany relationships
* Identifies possible many to many relationships (through relationships)
* Columns can be accessed by name or by database order. (Contains object and array referencing to this objects fileds)
* Very detailed column meta data:
    * Allow null
    * Description
    * Auto Increment
    * onUpdate
    * onDelete
    * etc. (Full details can be found in callback parameter doc)

## Contributions

All contributions are welcome. Please send bug reports with tests and small piece of code.

## Example Output (a part of)

    cart: {
        columns: {
            id: {
                schemaName: 'public',
                tableName: 'cart',
                name: 'id',
                default: 'nextval(\'cart_id_seq\'::regclass)',
                allowNull: false,
                type: 'integer',
                special: null,
                length: null,
                precision: 32,
                scale: 0,
                arrayType: null,
                arrayDimension: null,
                description: 'Kayıt no.',
                isAutoIncrement: true,
                constraintName: 'Key3',
                isPrimaryKey: true,
                unique: 'Key3'
            },

            contact_id: {
                schemaName: 'public',
                tableName: 'cart',
                name: 'contact_id',
                default: null,
                allowNull: false,
                type: 'integer',
                special: null,
                length: null,
                precision: 32,
                scale: 0,
                arrayType: null,
                arrayDimension: null,
                description: 'Alışveriş sepetinin sahibi.',
                constraintName: 'contact_has_carts',
                isForeignKey: true,
                referencesSchema: 'public',
                referencesTable: 'contact',
                referencesColumn: 'id',
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            }
        },
        columnsOrdered: [{
            schemaName: 'public',
            tableName: 'cart',
            name: 'id',
            default: 'nextval(\'cart_id_seq\'::regclass)',
            allowNull: false,
            type: 'integer',
            special: null,
            length: null,
            precision: 32,
            scale: 0,
            arrayType: null,
            arrayDimension: null,
            description: 'Kayıt no.',
            isAutoIncrement: true,
            constraintName: 'Key3',
            isPrimaryKey: true,
            unique: 'Key3'
        },

        {
            schemaName: 'public',
            tableName: 'cart',
            name: 'contact_id',
            default: null,
            allowNull: false,
            type: 'integer',
            special: null,
            length: null,
            precision: 32,
            scale: 0,
            arrayType: null,
            arrayDimension: null,
            description: 'Alışveriş sepetinin sahibi.',
            constraintName: 'contact_has_carts',
            isForeignKey: true,
            referencesSchema: 'public',
            referencesTable: 'contact',
            referencesColumn: 'id',
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        }],
        primaryKeys: [{
            schemaName: 'public',
            tableName: 'cart',
            name: 'id',
            default: 'nextval(\'cart_id_seq\'::regclass)',
            allowNull: false,
            type: 'integer',
            special: null,
            length: null,
            precision: 32,
            scale: 0,
            arrayType: null,
            arrayDimension: null,
            description: 'Kayıt no.',
            isAutoIncrement: true,
            constraintName: 'Key3',
            isPrimaryKey: true,
            unique: 'Key3'
        }],
        description: 'Alışveriş sepetlerini tutan tablo.',
        name: 'cart',
        foreignKeys: {
            contact_has_carts: [{
                schemaName: 'public',
                tableName: 'cart',
                name: 'contact_id',
                default: null,
                allowNull: false,
                type: 'integer',
                special: null,
                length: null,
                precision: 32,
                scale: 0,
                arrayType: null,
                arrayDimension: null,
                description: 'Alışveriş sepetinin sahibi.',
                constraintName: 'contact_has_carts',
                isForeignKey: true,
                referencesSchema: 'public',
                referencesTable: 'contact',
                referencesColumn: 'id',
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            }]
        },
        hasMany: {
            cart_has_products: {
                tableName: 'cart_line_item',
                foreignKeys: [{
                    schemaName: 'public',
                    tableName: 'cart_line_item',
                    name: 'cart_id',
                    default: null,
                    allowNull: false,
                    type: 'integer',
                    special: null,
                    length: null,
                    precision: 32,
                    scale: 0,
                    arrayType: null,
                    arrayDimension: null,
                    description: null,
                    constraintName: 'cart_has_products',
                    isPrimaryKey: true,
                    isForeignKey: true,
                    referencesSchema: 'public',
                    referencesTable: 'cart',
                    referencesColumn: 'id',
                    onUpdate: 'CASCADE',
                    onDelete: 'RESTRICT',
                    unique: 'Key5'
                }],
                constraintName: 'cart_has_products'
            }
        },
        hasManyThrough: {
            cart_has_products: {
                tableName: 'product',
                foreignKeys: [{
                    schemaName: 'public',
                    tableName: 'cart_line_item',
                    name: 'cart_id',
                    default: null,
                    allowNull: false,
                    type: 'integer',
                    special: null,
                    length: null,
                    precision: 32,
                    scale: 0,
                    arrayType: null,
                    arrayDimension: null,
                    description: null,
                    constraintName: 'cart_has_products',
                    isPrimaryKey: true,
                    isForeignKey: true,
                    referencesSchema: 'public',
                    referencesTable: 'cart',
                    referencesColumn: 'id',
                    onUpdate: 'CASCADE',
                    onDelete: 'RESTRICT',
                    unique: 'Key5'
                }],
                constraintName: 'cart_has_products',
                through: 'cart_line_item'
            }
        }
    },

## JSDOC Output

I added both jsdox and jsdoc2md output below

