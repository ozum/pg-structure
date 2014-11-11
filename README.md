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

#Index

**Modules**

* [pg-structure](#module_pg-structure)
  * [module.exports(host, database, username, password, options, callback) ⏏](#exp_module_pg-structure)
    * [class: pg-structure~Structure](#module_pg-structure..Structure)
      * [new pg-structure~Structure()](#new_module_pg-structure..Structure)
      * [structure.generate(callback)](#module_pg-structure..Structure#generate)
      * [Structure~processColumns(dbResult, next)](#module_pg-structure..Structure..processColumns)
      * [Structure~processConstraints(dbResult, next)](#module_pg-structure..Structure..processConstraints)
      * [Structure~processIndexes(dbResult, next)](#module_pg-structure..Structure..processIndexes)
      * [Structure~processRelations(next)](#module_pg-structure..Structure..processRelations)

**Functions**

* [internal(object)](#internal)

**Members**

* [objectInternal](#objectInternal)

**Typedefs**

* [callback: exportCallback](#exportCallback)
* [type: table](#table)
 
<a name="module_pg-structure"></a>
#pg-structure
**Author**: Özüm Eldoğan  
<a name="exp_module_pg-structure"></a>
##module.exports(host, database, username, password, options, callback) ⏏
Exports a PostgreSQL schema as a detailed object. Please see @see [table](#table) object for callback argument that you
will get as a result.

**Params**

- host `String` - Hostname of the database.  
- database `String` - Database name  
- username `String` - Username for connecting to db.  
- password `String` - Password to connecting to db.  
- options `Object` - Options  
  - \[schema=public\] `String` - Schema of the database.  
  - \[port=5432\] `number` - Connection port of the database server.  
- callback <code>[exportCallback](#exportCallback)</code> - Callback to handle database structure object.  

**Example**  
var pg-structure = require('pg-structure');
var util         = require('util');
pg-structure('localhost', 'db', 'user', 'password', { schema: 'public', port: 5432 }, function(result) {console.log(util.inspect(result, {depth: null}));} );
pg-structure('localhost', 'db', 'user', 'password', {}, function(result) {console.log(JSON.stringify(result));} );

<a name="internal"></a>
#internal(object)
Gets/sets internal properties of an object by storing each object's internal values to private variable.
This private variable uses object itself as key. (Similar to Perl).

**Params**

- object  - Used as key of the storage array.  

**Returns**: `internalValues`  
<a name="objectInternal"></a>
#objectInternal
**Type**: `WeakMap.<object, internalValues>`  
<a name="exportCallback"></a>
#callback: exportCallback
Callback to handle database structure object.

**Params**

- Structure `Object.<TableName, Object.<table>>` - object of the database.  

**Type**: `function`  
<a name="table"></a>
#type: table
**Properties**

- schemaName `string` - Schema name of the table.  
- name `string` - Name of the table  
- description `string` - Table description. This description is defined in database.  
- columns `object` - An object which contains column names as keys, column details as values.  
- columns.[columnName].name `string` - Name of the database column  
- columns.[columnName].default `string` - Default value of the column  
- columns.[columnName].allowNull `boolean` - Is the column allowed to contain null values?  
- columns.[columnName].type `string` - Data type of the column. Data types has PostgreSQL long style names such as 'integer', 'timestamp without time zone', 'character varying' etc.  
- columns.[columnName].special `string` - Special attribute of the column.  
- columns.[columnName].length `number` - Length of the column.  
- columns.[columnName].precision `number` - Precision of the column. Used for data types such as numeric etc. Date and datetime types also has optional precision.  
- columns.[columnName].scale `number` - Scale of the column.  
- columns.[columnName].arrayTpe `string` - (If column data type is array) Indicates what kind of data type does this array contain.  
- columns.[columnName].arrayDimension `number` - (If column data type is array). Dimension of the array.  
- columns.[columnName].description `string` - Column description. This description is defined in database.  
- columns.[columnName].isAutoIncrement `boolean` - Is the column data type one of auto incremented types such as serial, bigserial etc.  
- columns.[columnName].isPrimaryKey `boolean` - Is the column a primary key?  
- columns.[columnName].isForeignKey `boolean` - Is the column a foreign key?  
- columns.[columnName].constraintName `string` - Primary/foreign key constraint name  
- columns.[columnName].referencesTable `string` - (If column is foreign key) Table name which this column refers to.  
- columns.[columnName].referencesColumn `string` - (If column is foreign key) Column name which this column refers to.  
- columns.[columnName].onUpdate `string` - (If column is foreign key) Action which will be taken on update.  
- columns.[columnName].onDelete `string` - (If column is foreign key) Action which will be taken on delete.  
- columns.[columnName].unique `string` - (NOT BOOLEAN) If this column is unique, unique index or part of combined unique index, this column contains name of the unique index name.  
- columns.[columnName].tableName `string` - Table name of the column.  
- columns.[columnName].schemaName `string` - Schema name of the column.  
- columnsOrdered `array.<columnRef>` - An array containing references to columns. Array has same order of columns with database table.  
- primaryKeys `array.<columnRef>` - An array containing references to primary key columns of the table.  
- foreignKeys `object.<constraintName, array.<columnRef>>` - An object containing constraint names as keys and array of foreign key field references as values.  
- hasMany `object.<constraintName, object>` - An array containing details about tables which this table has many of. (Other tables which references to this table)  
- hasMany.[constraintName].tableName `string` - Name of the table which references to this table.  
- hasMany.[constraintName].constraintName `string` - Constraint name  
- hasMany.[constraintName].foreignKeys `array.<columnRef>` - Array of references to foreign key column(s) of referencing table.  
- hasManyThrough `object.<constraintName, object>` - An array containing details about tables which this table has many of through many to many relationship. (Other tables which references to this table via many to many)  
- hasMany.[constraintName].tableName `string` - Name of the table which references to this table.  
- hasMany.[constraintName].constraintName `string` - Constraint name  
- hasMany.[constraintName].foreignKeys `array.<columnRef>` - Array of references to foreign key column(s) of referencing table.  
- hasManyThrough.[constraintName].through `string` - Many to many connection table name which has references to this table and other table.  

# Global





* * *

### internal(object) 

Gets/sets internal properties of an object by storing each object's internal values to private variable.
This private variable uses object itself as key. (Similar to Perl).

**Parameters**

**object**: , Used as key of the storage array.

**Returns**: `internalValues`



* * *










# pg-structure





* * *

### pg-structure.module:pg-structure(host, database, username, password, options, options.schema, options.port, callback) 

Exports a PostgreSQL schema as a detailed object. Please see @see {@link table} object for callback argument that you
will get as a result.

**Parameters**

**host**: `String`, Hostname of the database.

**database**: `String`, Database name

**username**: `String`, Username for connecting to db.

**password**: `String`, Password to connecting to db.

**options**: `Object`, Options

**options.schema**: `String`, Schema of the database.

**options.port**: `number`, Connection port of the database server.

**callback**: `exportCallback`, Callback to handle database structure object.


**Example**:
```js
var pg-structure = require('pg-structure');
var util         = require('util');
pg-structure('localhost', 'db', 'user', 'password', { schema: 'public', port: 5432 }, function(result) {console.log(util.inspect(result, {depth: null}));} );
pg-structure('localhost', 'db', 'user', 'password', {}, function(result) {console.log(JSON.stringify(result));} );
```


## Class: Structure
Creates a Structure.

### pg-structure.Structure.generate(callback) 

Generates the structure object and executes callback.

**Parameters**

**callback**: , Generates the structure object and executes callback.


### pg-structure.Structure.processColumns(dbResult, next) 

Processes result of the column SQL and populates result object.

**Parameters**

**dbResult**: `Object`, Result of the pg module query.

**next**: `Callback`, Callback to execute after this function finishes its job.


### pg-structure.Structure.processConstraints(dbResult, next) 

Processes result of the constraint SQL and populates result object.

**Parameters**

**dbResult**: `Object`, Result of the pg module query.

**next**: `Callback`, Callback to execute after this function finishes its job.


### pg-structure.Structure.processIndexes(dbResult, next) 

Processes result of the index SQL and populates result object.

**Parameters**

**dbResult**: `Object`, Result of the pg module query.

**next**: `Callback`, Callback to execute after this function finishes its job.


### pg-structure.Structure.processRelations(next) 

Calculates relations by examining result object.

**Parameters**

**next**: `Callback`, Callback to execute after this function finishes its job.




* * *










