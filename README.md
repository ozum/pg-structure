# pg-structure

Get PostgreSQL database structure as a detailed JS Object.

## History
[History & Release Notes](#History)

## Synopsis

    var pgs     = require('pg-structure');
    var util    = require('util');
    pgs('127.0.0.1', 'node', 'user', 'password', { schema: ['public', 'other_schema'] }, function (err, db) {
        if (err) { throw err; }
        console.log(db.schema('public').name());

        // Callback style
        db.schema('public').tables(function (table) {
            console.log(table.name());
        });

        // Array Style
        console.log(schema('public').tables());

        // Long access chain:
        // public schema -> cart table -> contact_id columns -> foreign key constraint of contact_id
        // -> table of the constraint -> name of the referenced table
        console.log(db.schema('public').table('cart').column('contact_id').foreignKeyConstraint().referencesTable().name());
    });

## Abstract

pg-structure creates a detailed object of a PostgreSQL database. This object may be used to auto generate
documentation or ORM models from database. It is much easier to work with JS object than working manually
with database.

## Description

pg-structure connects to a PostgreSQL database, examines its structure and creates an JS object. The passed callback
is executed with result object as parameter.

## Special Thanks
This module is developed with sponsorship of Fortibase.

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

## Classes
<dl>
<dt><a href="#Column">Column</a></dt>
<dd></dd>
<dt><a href="#Constraint">Constraint</a></dt>
<dd></dd>
<dt><a href="#DB">DB</a></dt>
<dd></dd>
<dt><a href="#Schema">Schema</a></dt>
<dd></dd>
<dt><a href="#Table">Table</a></dt>
<dd></dd>
</dl>
## Members
<dl>
<dt><a href="#columnAttributes">columnAttributes</a> : <code>Object</code></dt>
<dd><p>Allowed column attributes and validations.</p>
</dd>
<dt><a href="#constraintAttributes">constraintAttributes</a> : <code>Object</code></dt>
<dd><p>Allowed column attributes and validations.</p>
</dd>
<dt><a href="#schemaAttributes">schemaAttributes</a> : <code>Object</code></dt>
<dd><p>Allowed schema attributes and validations.</p>
</dd>
</dl>
## Typedefs
<dl>
<dt><a href="#columnCallback">columnCallback</a> : <code>function</code></dt>
<dd></dd>
<dt><a href="#schemaCallback">schemaCallback</a> : <code>function</code></dt>
<dd></dd>
<dt><a href="#tableCallback">tableCallback</a> : <code>function</code></dt>
<dd></dd>
<dt><a href="#columnCallback">columnCallback</a> : <code>function</code></dt>
<dd></dd>
<dt><a href="#constraintCallback">constraintCallback</a> : <code>function</code></dt>
<dd></dd>
</dl>
<a name="Column"></a>
## Column
**Kind**: global class  

* [Column](#Column)
  * [new Column(args, [options])](#new_Column_new)
  * [.fullName](#Column+fullName)
  * [.name([value])](#Column+name) ⇒ <code>string</code>
  * [.defaultWithTypeCast([value])](#Column+defaultWithTypeCast) ⇒ <code>string</code>
  * [.default([value])](#Column+default) ⇒ <code>string</code>
  * [.allowNull([value])](#Column+allowNull) ⇒ <code>boolean</code>
  * [.type([value])](#Column+type) ⇒ <code>string</code>
  * [.special([value])](#Column+special) ⇒ <code>string</code>
  * [.enumValues([value])](#Column+enumValues) ⇒ <code>string</code>
  * [.length([value])](#Column+length) ⇒ <code>integer</code>
  * [.precision([value])](#Column+precision) ⇒ <code>integer</code>
  * [.scale([value])](#Column+scale) ⇒ <code>integer</code>
  * [.arrayType([value])](#Column+arrayType) ⇒ <code>string</code>
  * [.arrayDimension([value])](#Column+arrayDimension) ⇒ <code>integer</code>
  * [.description([value])](#Column+description) ⇒ <code>string</code>
  * [.isAutoIncrement([value])](#Column+isAutoIncrement) ⇒ <code>boolean</code>
  * [.isPrimaryKey([value])](#Column+isPrimaryKey) ⇒ <code>boolean</code>
  * [.isForeignKey([value])](#Column+isForeignKey) ⇒ <code>boolean</code>
  * [.referencesColumn([value])](#Column+referencesColumn) ⇒ <code>[Table](#Table)</code>
  * [.onUpdate([value])](#Column+onUpdate) ⇒ <code>string</code>
  * [.onDelete([value])](#Column+onDelete) ⇒ <code>string</code>
  * [.unique([value])](#Column+unique) ⇒ <code>string</code>
  * [.table([value])](#Column+table) ⇒ <code>[Table](#Table)</code>
  * [.parent([value])](#Column+parent) ⇒ <code>[Table](#Table)</code>
  * [.foreignKeyConstraint([value])](#Column+foreignKeyConstraint) ⇒ <code>[Constraint](#Constraint)</code>
  * [.udType([value])](#Column+udType) ⇒ <code>string</code>
  * [.sequelizeType([varName])](#Column+sequelizeType) ⇒ <code>string</code>

<a name="new_Column_new"></a>
### new Column(args, [options])

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| args | <code>Object</code> |  | Column arguments |
| args.name | <code>string</code> |  | Name of the column |
| [args.default] | <code>string</code> |  | Default value of the column |
| args.allowNull | <code>boolean</code> |  | Is this column allowed to contain null values? |
| args.type | <code>string</code> |  | Data type of the column. |
| [args.enumValues] | <code>string</code> |  | Special attributes of the column. |
| [args.length] | <code>number</code> |  | Length of the column. |
| [args.precision] | <code>number</code> |  | Precision of the column. |
| [args.scale] | <code>number</code> |  | Scale of the column. |
| [args.arrayType] | <code>string</code> |  | If column is array. Data type of the array. |
| [args.arrayDimension] | <code>number</code> |  | array dimension of the column. |
| [args.udType] | <code>string</code> |  | User defined type of the column if the column type is user defined |
| [args.description] | <code>String</code> |  | Description of the table |
| args.table | <code>[Table](#Table)</code> |  | [Table](#Table) of the class |
| [options] | <code>Object</code> |  | Options |
| [options.allowUnknown] | <code>boolean</code> | <code>true</code> | If true, unknown parameters passed to constructor does not throw error while creating object. |

<a name="Column+fullName"></a>
### column.fullName
Gets full name of the object in database . notation.

**Kind**: instance property of <code>[Column](#Column)</code>  
<a name="Column+name"></a>
### column.name([value]) ⇒ <code>string</code>
**Kind**: instance method of <code>[Column](#Column)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [value] | <code>string</code> | New value |

<a name="Column+defaultWithTypeCast"></a>
### column.defaultWithTypeCast([value]) ⇒ <code>string</code>
Returns default value with type cast.

**Kind**: instance method of <code>[Column](#Column)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [value] | <code>string</code> | New value |

<a name="Column+default"></a>
### column.default([value]) ⇒ <code>string</code>
Returns default value without type cast.

**Kind**: instance method of <code>[Column](#Column)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [value] | <code>string</code> | New value |

**Example**  
```js
var column = db('crm').schema('public').table('contact').column('name');
console.log(column.defaultWithTypeCast());  // 'George'::character varying
console.log(column.default());              // George
```
<a name="Column+allowNull"></a>
### column.allowNull([value]) ⇒ <code>boolean</code>
**Kind**: instance method of <code>[Column](#Column)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [value] | <code>boolean</code> | New value |

<a name="Column+type"></a>
### column.type([value]) ⇒ <code>string</code>
**Kind**: instance method of <code>[Column](#Column)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [value] | <code>string</code> | New value |

<a name="Column+special"></a>
### column.special([value]) ⇒ <code>string</code>
DEPRECATED: use enumValues method instead.

**Kind**: instance method of <code>[Column](#Column)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [value] | <code>string</code> | New value |

<a name="Column+enumValues"></a>
### column.enumValues([value]) ⇒ <code>string</code>
**Kind**: instance method of <code>[Column](#Column)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [value] | <code>string</code> | New value |

<a name="Column+length"></a>
### column.length([value]) ⇒ <code>integer</code>
**Kind**: instance method of <code>[Column](#Column)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [value] | <code>integer</code> | New value |

<a name="Column+precision"></a>
### column.precision([value]) ⇒ <code>integer</code>
**Kind**: instance method of <code>[Column](#Column)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [value] | <code>integer</code> | New value |

<a name="Column+scale"></a>
### column.scale([value]) ⇒ <code>integer</code>
**Kind**: instance method of <code>[Column](#Column)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [value] | <code>integer</code> | New value |

<a name="Column+arrayType"></a>
### column.arrayType([value]) ⇒ <code>string</code>
**Kind**: instance method of <code>[Column](#Column)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [value] | <code>string</code> | New value |

<a name="Column+arrayDimension"></a>
### column.arrayDimension([value]) ⇒ <code>integer</code>
**Kind**: instance method of <code>[Column](#Column)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [value] | <code>integer</code> | New value |

<a name="Column+description"></a>
### column.description([value]) ⇒ <code>string</code>
**Kind**: instance method of <code>[Column](#Column)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [value] | <code>string</code> | New value |

<a name="Column+isAutoIncrement"></a>
### column.isAutoIncrement([value]) ⇒ <code>boolean</code>
**Kind**: instance method of <code>[Column](#Column)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [value] | <code>boolean</code> | New value |

<a name="Column+isPrimaryKey"></a>
### column.isPrimaryKey([value]) ⇒ <code>boolean</code>
**Kind**: instance method of <code>[Column](#Column)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [value] | <code>boolean</code> | New value |

<a name="Column+isForeignKey"></a>
### column.isForeignKey([value]) ⇒ <code>boolean</code>
**Kind**: instance method of <code>[Column](#Column)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [value] | <code>boolean</code> | New value |

<a name="Column+referencesColumn"></a>
### column.referencesColumn([value]) ⇒ <code>[Table](#Table)</code>
**Kind**: instance method of <code>[Column](#Column)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [value] | <code>[Table](#Table)</code> | New value |

<a name="Column+onUpdate"></a>
### column.onUpdate([value]) ⇒ <code>string</code>
**Kind**: instance method of <code>[Column](#Column)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [value] | <code>string</code> | New value |

<a name="Column+onDelete"></a>
### column.onDelete([value]) ⇒ <code>string</code>
**Kind**: instance method of <code>[Column](#Column)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [value] | <code>string</code> | New value |

<a name="Column+unique"></a>
### column.unique([value]) ⇒ <code>string</code>
**Kind**: instance method of <code>[Column](#Column)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [value] | <code>string</code> | New value |

<a name="Column+table"></a>
### column.table([value]) ⇒ <code>[Table](#Table)</code>
**Kind**: instance method of <code>[Column](#Column)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [value] | <code>[Table](#Table)</code> | New value |

<a name="Column+parent"></a>
### column.parent([value]) ⇒ <code>[Table](#Table)</code>
**Kind**: instance method of <code>[Column](#Column)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [value] | <code>[Table](#Table)</code> | New value |

<a name="Column+foreignKeyConstraint"></a>
### column.foreignKeyConstraint([value]) ⇒ <code>[Constraint](#Constraint)</code>
Gets/sets foreign key constraint of the column, if column is a foreign key.

**Kind**: instance method of <code>[Column](#Column)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [value] | <code>[Constraint](#Constraint)</code> | New value |

<a name="Column+udType"></a>
### column.udType([value]) ⇒ <code>string</code>
Gets/sets user defined type of the column, if column is a user defined type.

**Kind**: instance method of <code>[Column](#Column)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [value] | <code>string</code> | New value |

<a name="Column+sequelizeType"></a>
### column.sequelizeType([varName]) ⇒ <code>string</code>
Returns Sequelize ORM datatype for column.

**Kind**: instance method of <code>[Column](#Column)</code>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [varName] | <code>String</code> | <code>DataTypes</code> | Variable name to use in sequelize data type. ie. 'DataTypes' for DataTypes.INTEGER |

**Example**  
```js
var typeA = column.sequelizeType();              // DataTypes.INTEGER(3)
var typeB = column.sequelizeType('Sequelize');   // Sequelize.INTEGER(3)
```
<a name="Constraint"></a>
## Constraint
**Kind**: global class  

* [Constraint](#Constraint)
  * [new Constraint(args, [options])](#new_Constraint_new)
  * [.fullName](#Constraint+fullName)
  * [.name([value])](#Constraint+name) ⇒ <code>string</code>
  * [.onUpdate([value])](#Constraint+onUpdate) ⇒ <code>string</code>
  * [.onDelete([value])](#Constraint+onDelete) ⇒ <code>string</code>
  * [.table([value])](#Constraint+table) ⇒ <code>string</code>
  * [.parent([value])](#Constraint+parent) ⇒ <code>string</code>
  * [.referencesSchema([value])](#Constraint+referencesSchema) ⇒ <code>[Schema](#Schema)</code>
  * [.referencesTable([value])](#Constraint+referencesTable) ⇒ <code>[Table](#Table)</code>
  * [.through([value])](#Constraint+through) ⇒ <code>[Table](#Table)</code>
  * [.throughForeignKeyConstraint([value])](#Constraint+throughForeignKeyConstraint) ⇒ <code>[Table](#Table)</code>
  * [.throughForeignKeyConstraintToSelf([value])](#Constraint+throughForeignKeyConstraintToSelf) ⇒ <code>[Table](#Table)</code>
  * [.foreignKey(nameOrPos)](#Constraint+foreignKey) ⇒ <code>[Column](#Column)</code>
  * [.foreignKeyExist(nameOrPos)](#Constraint+foreignKeyExist) ⇒ <code>boolean</code>
  * [.foreignKeysByName([callback])](#Constraint+foreignKeysByName) ⇒ <code>object.&lt;string, Column&gt;</code> &#124; <code>undefined</code>
  * [.foreignKeys([callback])](#Constraint+foreignKeys) ⇒ <code>object.&lt;string, Column&gt;</code> &#124; <code>undefined</code>

<a name="new_Constraint_new"></a>
### new Constraint(args, [options])

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| args | <code>Object</code> |  | Constraint arguments |
| args.name | <code>string</code> |  | Name of the constraint |
| args.referencesSchema | <code>[Schema](#Schema)</code> |  | [Schema](#Schema) containing table which this constraint references to. |
| args.referencesTable | <code>[Table](#Table)</code> |  | [Table](#Table) which this constraint references to. |
| [args.onUpdate] | <code>string</code> |  | Action taken on update. One of: 'NO ACTION', 'CASCADE', 'SET NULL', 'RESTRICT' |
| [args.onUpdate] | <code>string</code> |  | Action taken on delete. One of: 'NO ACTION', 'CASCADE', 'SET NULL', 'RESTRICT' |
| args.table | <code>[Table](#Table)</code> |  | [Table](#Table) object which contains this constraint. |
| args.through | <code>[Table](#Table)</code> |  | [Table](#Table) object which this constraint references through. |
| args.throughForeignKeyConstraint | <code>[Table](#Table)</code> |  | [Constraint](#Constraint) object in through table referencing to other table. |
| args.throughForeignKeyConstraintToSelf | <code>[Table](#Table)</code> |  | [Constraint](#Constraint) object in through table referencing to this table. |
| [options] | <code>Object</code> |  | Options |
| [options.allowUnknown] | <code>boolean</code> | <code>true</code> | If true, unknown parameters passed to constructor does not throw error while creating object. |

<a name="Constraint+fullName"></a>
### constraint.fullName
Gets full name of the object in database . notation.

**Kind**: instance property of <code>[Constraint](#Constraint)</code>  
<a name="Constraint+name"></a>
### constraint.name([value]) ⇒ <code>string</code>
**Kind**: instance method of <code>[Constraint](#Constraint)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [value] | <code>string</code> | New value |

<a name="Constraint+onUpdate"></a>
### constraint.onUpdate([value]) ⇒ <code>string</code>
**Kind**: instance method of <code>[Constraint](#Constraint)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [value] | <code>string</code> | New value |

<a name="Constraint+onDelete"></a>
### constraint.onDelete([value]) ⇒ <code>string</code>
**Kind**: instance method of <code>[Constraint](#Constraint)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [value] | <code>string</code> | New value |

<a name="Constraint+table"></a>
### constraint.table([value]) ⇒ <code>string</code>
**Kind**: instance method of <code>[Constraint](#Constraint)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [value] | <code>string</code> | New value |

<a name="Constraint+parent"></a>
### constraint.parent([value]) ⇒ <code>string</code>
**Kind**: instance method of <code>[Constraint](#Constraint)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [value] | <code>string</code> | New value |

<a name="Constraint+referencesSchema"></a>
### constraint.referencesSchema([value]) ⇒ <code>[Schema](#Schema)</code>
Returns [Schema](#Schema) object this constraint refers to.

**Kind**: instance method of <code>[Constraint](#Constraint)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [value] | <code>[Schema](#Schema)</code> | New value |

<a name="Constraint+referencesTable"></a>
### constraint.referencesTable([value]) ⇒ <code>[Table](#Table)</code>
Returns [Table](#Table) object this constraint refers to.

**Kind**: instance method of <code>[Constraint](#Constraint)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [value] | <code>[Table](#Table)</code> | New value |

<a name="Constraint+through"></a>
### constraint.through([value]) ⇒ <code>[Table](#Table)</code>
Returns [Table](#Table) object this constraint refers through.

**Kind**: instance method of <code>[Constraint](#Constraint)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [value] | <code>[Table](#Table)</code> | New value |

<a name="Constraint+throughForeignKeyConstraint"></a>
### constraint.throughForeignKeyConstraint([value]) ⇒ <code>[Table](#Table)</code>
Returns [Constraint](#Constraint) (foreign key constraint) this constraint referring to other table through join table.
With this method it is possible to learn how this table is connected to other table.

**Kind**: instance method of <code>[Constraint](#Constraint)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [value] | <code>[Table](#Table)</code> | New value |

**Example**  
```js
// Assume there are three tables for many to many relation:  cart ----< line_item >---- product
db.get('public.cart').hasManyThrough('cart_has_products').foreignKey(0).name(); // equals 'cart_id'
db.get('public.cart').hasManyThrough('cart_has_products').throughForeignKeyConstraint().foreignKey(0).name() // equals 'product_id'
```
<a name="Constraint+throughForeignKeyConstraintToSelf"></a>
### constraint.throughForeignKeyConstraintToSelf([value]) ⇒ <code>[Table](#Table)</code>
Returns [Constraint](#Constraint) (foreign key constraint) this constraint referring to itself through join table.
With this method it is possible to learn how this table is connected to other table.

**Kind**: instance method of <code>[Constraint](#Constraint)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [value] | <code>[Table](#Table)</code> | New value |

<a name="Constraint+foreignKey"></a>
### constraint.foreignKey(nameOrPos) ⇒ <code>[Column](#Column)</code>
Returns foreign key as a [Column](#Column) object with given name or order number.

**Kind**: instance method of <code>[Constraint](#Constraint)</code>  
**Throws**:

- Will throw error if foreign key does not exists.


| Param | Type | Description |
| --- | --- | --- |
| nameOrPos | <code>string</code> &#124; <code>integer</code> | Name or order number of the foreign key |

<a name="Constraint+foreignKeyExist"></a>
### constraint.foreignKeyExist(nameOrPos) ⇒ <code>boolean</code>
Returns true if foreign key object with given name or order number exists.

**Kind**: instance method of <code>[Constraint](#Constraint)</code>  

| Param | Type | Description |
| --- | --- | --- |
| nameOrPos | <code>string</code> &#124; <code>integer</code> | Name or order number of the foreign key |

<a name="Constraint+foreignKeysByName"></a>
### constraint.foreignKeysByName([callback]) ⇒ <code>object.&lt;string, Column&gt;</code> &#124; <code>undefined</code>
Retrieves all foreign keys in the constraint. If callback is provided, it is executed for each foreign key column.
Callback is passed [Column](#Column) object as parameter. If no callback is provided, returns a plain object. Object keys are column names,
values are [Column](#Column) objects.

**Kind**: instance method of <code>[Constraint](#Constraint)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [callback] | <code>[columnCallback](#columnCallback)</code> | Callback to be executed for each column. |

<a name="Constraint+foreignKeys"></a>
### constraint.foreignKeys([callback]) ⇒ <code>object.&lt;string, Column&gt;</code> &#124; <code>undefined</code>
Retrieves all foreign keys in the constraint. If callback is provided, it is executed for each foreign key column.
Callback is passed [Column](#Column) object as parameter. If no callback is provided, returns an array which
contains foreign key [Column](#Column) objects.

**Kind**: instance method of <code>[Constraint](#Constraint)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [callback] | <code>[columnCallback](#columnCallback)</code> | Callback to be executed for each column. |

<a name="DB"></a>
## DB
**Kind**: global class  

* [DB](#DB)
  * [new DB(args, [options])](#new_DB_new)
  * [.fullName](#DB+fullName)
  * [.name([value])](#DB+name) ⇒ <code>string</code>
  * [.addSchema(args)](#DB+addSchema) ⇒ <code>[Schema](#Schema)</code>
  * [.schema(name)](#DB+schema) ⇒ <code>[Schema](#Schema)</code>
  * [.get(path)](#DB+get) ⇒ <code>[Schema](#Schema)</code> &#124; <code>[Table](#Table)</code> &#124; <code>[Column](#Column)</code>
  * [.schemaExist(name)](#DB+schemaExist) ⇒ <code>boolean</code>
  * [.schemaIncluded(schemaName)](#DB+schemaIncluded) ⇒ <code>boolean</code>
  * [.includedSchemas()](#DB+includedSchemas) ⇒ <code>Array</code>
  * [.schemas([callback])](#DB+schemas) ⇒ <code>object.&lt;string, Schema&gt;</code> &#124; <code>undefined</code>

<a name="new_DB_new"></a>
### new DB(args, [options])

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| args | <code>Object</code> |  | Database arguments. |
| args.name | <code>String</code> |  | Name of the database. |
| [options] | <code>Object</code> |  | Options |
| [options.schemas] | <code>array</code> &#124; <code>string</code> |  | Requested schemas. Information purposes only. |
| [options.allowUnknown] | <code>boolean</code> | <code>true</code> | If true, unknown parameters passed to constructor does not throw error while creating object. |

<a name="DB+fullName"></a>
### dB.fullName
Gets full name of the object in database . notation.

**Kind**: instance property of <code>[DB](#DB)</code>  
<a name="DB+name"></a>
### dB.name([value]) ⇒ <code>string</code>
Returns name of the db

**Kind**: instance method of <code>[DB](#DB)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [value] | <code>string</code> | New value |

<a name="DB+addSchema"></a>
### dB.addSchema(args) ⇒ <code>[Schema](#Schema)</code>
Adds schema to the schema and returns schema created newly.

**Kind**: instance method of <code>[DB](#DB)</code>  
**Throws**:

- Will throw if existing schema tried to be added.


| Param | Type | Description |
| --- | --- | --- |
| args | <code>[Schema](#Schema)</code> &#124; <code>object</code> | Schema object or general object to create column object |
| args.name | <code>string</code> | Name of the schema. |

<a name="DB+schema"></a>
### dB.schema(name) ⇒ <code>[Schema](#Schema)</code>
Returns the [Schema](#Schema) object with given name.

**Kind**: instance method of <code>[DB](#DB)</code>  
**Throws**:

- Will throw error if schema does not exists.


| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Name of the schema |

<a name="DB+get"></a>
### dB.get(path) ⇒ <code>[Schema](#Schema)</code> &#124; <code>[Table](#Table)</code> &#124; <code>[Column](#Column)</code>
Shortcut function which returns object based on path.

**Kind**: instance method of <code>[DB](#DB)</code>  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | Database path of the requested item. |

**Example**  
```js
var schema = db.get('public'),                   // Returns public schema.
    table  = db.get('public.contact'),           // Returns contact table in public schema.
    column = db.get('public.contact.name');      // Returns name column of the contact table in public schema.
```
<a name="DB+schemaExist"></a>
### dB.schemaExist(name) ⇒ <code>boolean</code>
Returns true if object with given name exist.

**Kind**: instance method of <code>[DB](#DB)</code>  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Name of the schema |

<a name="DB+schemaIncluded"></a>
### dB.schemaIncluded(schemaName) ⇒ <code>boolean</code>
Returns if given schema is one of the requested schemas to be parsed.

**Kind**: instance method of <code>[DB](#DB)</code>  

| Param | Type | Description |
| --- | --- | --- |
| schemaName | <code>string</code> | Name of the schema to check |

<a name="DB+includedSchemas"></a>
### dB.includedSchemas() ⇒ <code>Array</code>
Returns the list of requested schemas to be parsed.

**Kind**: instance method of <code>[DB](#DB)</code>  
<a name="DB+schemas"></a>
### dB.schemas([callback]) ⇒ <code>object.&lt;string, Schema&gt;</code> &#124; <code>undefined</code>
Retrieves all schemas in the schema. If callback is provided, it is executed for each schema. Callback is passed [Schema](#Schema)
object as parameter. If no callback is provided, returns a plain object. Object keys are schema names,
values are [Schema](#Schema) objects.

**Kind**: instance method of <code>[DB](#DB)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [callback] | <code>[schemaCallback](#schemaCallback)</code> | Callback to be executed for each schema. |

<a name="Schema"></a>
## Schema
**Kind**: global class  

* [Schema](#Schema)
  * [new Schema(args, [options])](#new_Schema_new)
  * [.fullName](#Schema+fullName)
  * [.name([value])](#Schema+name) ⇒ <code>string</code>
  * [.db([value])](#Schema+db) ⇒ <code>[DB](#DB)</code>
  * [.parent([value])](#Schema+parent) ⇒ <code>[DB](#DB)</code>
  * [.table(name)](#Schema+table) ⇒ <code>[Table](#Table)</code>
  * [.get(path)](#Schema+get) ⇒ <code>[Table](#Table)</code> &#124; <code>[Column](#Column)</code>
  * [.tables([callback])](#Schema+tables) ⇒ <code>object.&lt;string, Table&gt;</code> &#124; <code>undefined</code>

<a name="new_Schema_new"></a>
### new Schema(args, [options])

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| args | <code>Object</code> |  | Schema arguments. |
| args.name | <code>string</code> |  | Name of the schema. |
| args.db | <code>[DB](#DB)</code> |  | [DB](#DB) of the schema. |
| [options] | <code>Object</code> |  | Options |
| [options.allowUnknown] | <code>boolean</code> | <code>true</code> | If true, unknown parameters passed to constructor does not throw error while creating object. |

<a name="Schema+fullName"></a>
### schema.fullName
Gets full name of the object in database . notation.

**Kind**: instance property of <code>[Schema](#Schema)</code>  
<a name="Schema+name"></a>
### schema.name([value]) ⇒ <code>string</code>
Returns name of the schema

**Kind**: instance method of <code>[Schema](#Schema)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [value] | <code>string</code> | New value |

<a name="Schema+db"></a>
### schema.db([value]) ⇒ <code>[DB](#DB)</code>
Retrieves [DB](#DB) object of the schema.

**Kind**: instance method of <code>[Schema](#Schema)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [value] | <code>[DB](#DB)</code> | New value |

<a name="Schema+parent"></a>
### schema.parent([value]) ⇒ <code>[DB](#DB)</code>
Retrieves [DB](#DB) object of the schema.

**Kind**: instance method of <code>[Schema](#Schema)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [value] | <code>[DB](#DB)</code> | New value |

<a name="Schema+table"></a>
### schema.table(name) ⇒ <code>[Table](#Table)</code>
Returns the [Table](#Table) object with given name.

**Kind**: instance method of <code>[Schema](#Schema)</code>  
**Throws**:

- Will throw error if table does not exists.


| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Name of the table |

<a name="Schema+get"></a>
### schema.get(path) ⇒ <code>[Table](#Table)</code> &#124; <code>[Column](#Column)</code>
Shortcut function which returns object based on path.

**Kind**: instance method of <code>[Schema](#Schema)</code>  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | Database path of the requested item. |

**Example**  
```js
var table  = db.get('contact'),           // Returns contact table in public schema.
    column = db.get('contact.name');      // Returns name column of the contact table in public schema.
```
<a name="Schema+tables"></a>
### schema.tables([callback]) ⇒ <code>object.&lt;string, Table&gt;</code> &#124; <code>undefined</code>
Retrieves all tables in the schema. If callback is provided, it is executed for each table. Callback is passed [Table](#Table)
object as parameter. If no callback is provided, returns a plain object. Object keys are table names,
values are [Table](#Table) objects.

**Kind**: instance method of <code>[Schema](#Schema)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [callback] | <code>[tableCallback](#tableCallback)</code> | Callback to be executed for each table. |

<a name="Table"></a>
## Table
**Kind**: global class  

* [Table](#Table)
  * [new Table(args, [options])](#new_Table_new)
  * [.fullName](#Table+fullName)
  * [.name([value])](#Table+name) ⇒ <code>string</code>
  * [.description([value])](#Table+description) ⇒ <code>string</code>
  * [.schema([value])](#Table+schema) ⇒ <code>[Schema](#Schema)</code>
  * [.parent([value])](#Table+parent) ⇒ <code>[Schema](#Schema)</code>
  * [.column(nameOrPos)](#Table+column) ⇒ <code>[Column](#Column)</code>
  * [.columns([callback])](#Table+columns) ⇒ <code>[Array.&lt;Column&gt;](#Column)</code> &#124; <code>undefined</code>
  * [.columnsByName([callback])](#Table+columnsByName) ⇒ <code>Object.&lt;string, Column&gt;</code> &#124; <code>undefined</code>
  * [.primaryKeys([callback])](#Table+primaryKeys) ⇒ <code>[Array.&lt;Column&gt;](#Column)</code>
  * [.foreignKeyConstraint(name)](#Table+foreignKeyConstraint) ⇒ <code>[Constraint](#Constraint)</code>
  * [.foreignKeyConstraintExist(name)](#Table+foreignKeyConstraintExist) ⇒ <code>boolean</code>
  * [.foreignKeyConstraints([callback])](#Table+foreignKeyConstraints) ⇒ <code>[Array.&lt;Constraint&gt;](#Constraint)</code>
  * [.foreignKeyConstraintsByName([callback])](#Table+foreignKeyConstraintsByName) ⇒ <code>Object.&lt;string, Constraint&gt;</code> &#124; <code>undefined</code>
  * [.hasMany(name)](#Table+hasMany) ⇒ <code>[Constraint](#Constraint)</code>
  * [.hasManies([callback])](#Table+hasManies) ⇒ <code>[Array.&lt;Constraint&gt;](#Constraint)</code>
  * [.hasManiesByName([callback])](#Table+hasManiesByName) ⇒ <code>Object.&lt;string, Constraint&gt;</code> &#124; <code>undefined</code>
  * [.hasManyThrough(name)](#Table+hasManyThrough) ⇒ <code>[Constraint](#Constraint)</code>
  * [.hasManyThroughs([callback])](#Table+hasManyThroughs) ⇒ <code>[Array.&lt;Constraint&gt;](#Constraint)</code>
  * [.hasManyThroughsByName([callback])](#Table+hasManyThroughsByName) ⇒ <code>Object.&lt;string, Constraint&gt;</code> &#124; <code>undefined</code>
  * [.get(path)](#Table+get) ⇒ <code>[Column](#Column)</code>

<a name="new_Table_new"></a>
### new Table(args, [options])

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| args | <code>Object</code> |  | Table arguments. |
| args.name | <code>String</code> |  | Name of the table. |
| [args.description] | <code>String</code> |  | Description of the table. |
| args.schema | <code>[Schema](#Schema)</code> |  | [Schema](#Schema) of the table. |
| [options] | <code>Object</code> |  | Options |
| [options.allowUnknown] | <code>boolean</code> | <code>true</code> | If true, unknown parameters passed to constructor does not throw error while creating object. |

<a name="Table+fullName"></a>
### table.fullName
Gets full name of the object in database . notation.

**Kind**: instance property of <code>[Table](#Table)</code>  
<a name="Table+name"></a>
### table.name([value]) ⇒ <code>string</code>
Retrieves name of the table.

**Kind**: instance method of <code>[Table](#Table)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [value] | <code>string</code> | New value |

<a name="Table+description"></a>
### table.description([value]) ⇒ <code>string</code>
Retrieves description of the table.

**Kind**: instance method of <code>[Table](#Table)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [value] | <code>string</code> | New value |

<a name="Table+schema"></a>
### table.schema([value]) ⇒ <code>[Schema](#Schema)</code>
Retrieves [Schema](#Schema) object of the table.

**Kind**: instance method of <code>[Table](#Table)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [value] | <code>[Schema](#Schema)</code> | New value |

<a name="Table+parent"></a>
### table.parent([value]) ⇒ <code>[Schema](#Schema)</code>
Retrieves [Schema](#Schema) object of the table.

**Kind**: instance method of <code>[Table](#Table)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [value] | <code>[Schema](#Schema)</code> | New value |

<a name="Table+column"></a>
### table.column(nameOrPos) ⇒ <code>[Column](#Column)</code>
Returns [Column](#Column) object with given name or order number.

**Kind**: instance method of <code>[Table](#Table)</code>  
**Throws**:

- Will throw error if column does not exists.


| Param | Type | Description |
| --- | --- | --- |
| nameOrPos | <code>string</code> &#124; <code>integer</code> | Name or order number of the column |

<a name="Table+columns"></a>
### table.columns([callback]) ⇒ <code>[Array.&lt;Column&gt;](#Column)</code> &#124; <code>undefined</code>
Retrieves all columns in the table in an ordered list. If callback is provided, it is executed for each column. Callback is passed [Column](#Column)
object as parameter. If no callback is provided, returns array of [Column](#Column) objects.

**Kind**: instance method of <code>[Table](#Table)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [callback] | <code>[columnCallback](#columnCallback)</code> | Callback to be executed for each column. |

<a name="Table+columnsByName"></a>
### table.columnsByName([callback]) ⇒ <code>Object.&lt;string, Column&gt;</code> &#124; <code>undefined</code>
Retrieves all columns in the table. If callback is provided, it is executed for each column. Callback is passed [Column](#Column)
object as parameter. If no callback is provided, returns a plain Object. Object keys are column names,
values are [Column](#Column) objects.

**Kind**: instance method of <code>[Table](#Table)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [callback] | <code>[columnCallback](#columnCallback)</code> | Callback to be executed for each column. |

<a name="Table+primaryKeys"></a>
### table.primaryKeys([callback]) ⇒ <code>[Array.&lt;Column&gt;](#Column)</code>
Retrieves all primary key columns in the table. If callback is provided, it is executed for each primary key.
Callback is passed [Column](#Column) object as parameter.
If no callback is provided, returns an array of [Column](#Column) objects.

**Kind**: instance method of <code>[Table](#Table)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [callback] | <code>[columnCallback](#columnCallback)</code> | Callback to be executed for each primary key column. |

<a name="Table+foreignKeyConstraint"></a>
### table.foreignKeyConstraint(name) ⇒ <code>[Constraint](#Constraint)</code>
Returns foreign key [Constraint](#Constraint) object with given name.

**Kind**: instance method of <code>[Table](#Table)</code>  
**Throws**:

- Will throw error if foreign key constraint does not exists.


| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Name of the foreign key constraint |

<a name="Table+foreignKeyConstraintExist"></a>
### table.foreignKeyConstraintExist(name) ⇒ <code>boolean</code>
Returns true if foreign key object with given name exists.

**Kind**: instance method of <code>[Table](#Table)</code>  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Name of the foreign key constraint |

<a name="Table+foreignKeyConstraints"></a>
### table.foreignKeyConstraints([callback]) ⇒ <code>[Array.&lt;Constraint&gt;](#Constraint)</code>
Retrieves all foreign key constraints in the table. If callback is provided, it is executed for each one.
Callback is passed [Constraint](#Constraint) object as parameter.
If no callback is provided, returns a plain Object. Plain object keys are names of [Constraint](#Constraint) objects and values are [Constraint](#Constraint) objects.

**Kind**: instance method of <code>[Table](#Table)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [callback] | <code>[constraintCallback](#constraintCallback)</code> | Callback to be executed for each constraint. |

<a name="Table+foreignKeyConstraintsByName"></a>
### table.foreignKeyConstraintsByName([callback]) ⇒ <code>Object.&lt;string, Constraint&gt;</code> &#124; <code>undefined</code>
Retrieves all foreign key constraints in the table. If callback is provided, it is executed for each one.
Callback is passed [Constraint](#Constraint) object as parameter.
If no callback is provided, returns an array of [Constraint](#Constraint) objects.

**Kind**: instance method of <code>[Table](#Table)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [callback] | <code>[constraintCallback](#constraintCallback)</code> | Callback to be executed for each constrained. |

<a name="Table+hasMany"></a>
### table.hasMany(name) ⇒ <code>[Constraint](#Constraint)</code>
Returns has many [Constraint](#Constraint) object with given name.

**Kind**: instance method of <code>[Table](#Table)</code>  
**Throws**:

- Will throw error if has many constraint does not exists.


| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Name of the has many constraint |

<a name="Table+hasManies"></a>
### table.hasManies([callback]) ⇒ <code>[Array.&lt;Constraint&gt;](#Constraint)</code>
Retrieves all has many constraints in the table. If callback is provided, it is executed for each one.
Callback is passed [Constraint](#Constraint) object as parameter.
If no callback is provided, returns a plain Object. Plain object keys are names of [Constraint](#Constraint) objects and values are [Constraint](#Constraint) objects.

**Kind**: instance method of <code>[Table](#Table)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [callback] | <code>[constraintCallback](#constraintCallback)</code> | Callback to be executed for each constraint. |

<a name="Table+hasManiesByName"></a>
### table.hasManiesByName([callback]) ⇒ <code>Object.&lt;string, Constraint&gt;</code> &#124; <code>undefined</code>
Retrieves all has many constraints in the table. If callback is provided, it is executed for one.
Callback is passed [Constraint](#Constraint) object as parameter.
If no callback is provided, returns an array of [Constraint](#Constraint) objects.

**Kind**: instance method of <code>[Table](#Table)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [callback] | <code>[constraintCallback](#constraintCallback)</code> | Callback to be executed for each constraint. |

<a name="Table+hasManyThrough"></a>
### table.hasManyThrough(name) ⇒ <code>[Constraint](#Constraint)</code>
Returns has many through [Constraint](#Constraint) object with given name.

**Kind**: instance method of <code>[Table](#Table)</code>  
**Throws**:

- Will throw error if has many through constraint does not exists.


| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Name of the has many through constraint |

<a name="Table+hasManyThroughs"></a>
### table.hasManyThroughs([callback]) ⇒ <code>[Array.&lt;Constraint&gt;](#Constraint)</code>
Retrieves all has many through constraints in the table. If callback is provided, it is executed for each one.
Callback is passed [Constraint](#Constraint) object as parameter.
If no callback is provided, returns a plain Object. Plain object keys are names of [Constraint](#Constraint) objects and values are [Constraint](#Constraint) objects.

**Kind**: instance method of <code>[Table](#Table)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [callback] | <code>[constraintCallback](#constraintCallback)</code> | Callback to be executed for each constraint. |

<a name="Table+hasManyThroughsByName"></a>
### table.hasManyThroughsByName([callback]) ⇒ <code>Object.&lt;string, Constraint&gt;</code> &#124; <code>undefined</code>
Retrieves all has many through constraints in the table. If callback is provided, it is executed for one.
Callback is passed [Constraint](#Constraint) object as parameter.
If no callback is provided, returns an array of [Constraint](#Constraint) objects.

**Kind**: instance method of <code>[Table](#Table)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [callback] | <code>[constraintCallback](#constraintCallback)</code> | Callback to be executed for each constraint. |

<a name="Table+get"></a>
### table.get(path) ⇒ <code>[Column](#Column)</code>
Shortcut function which returns object based on path.

**Kind**: instance method of <code>[Table](#Table)</code>  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | Database path of the requested item. |

**Example**  
```js
var column = db.get('name');      // Returns name column of the contact table in public schema.
```
<a name="columnAttributes"></a>
## columnAttributes : <code>Object</code>
Allowed column attributes and validations.

**Kind**: global variable  
<a name="constraintAttributes"></a>
## constraintAttributes : <code>Object</code>
Allowed column attributes and validations.

**Kind**: global variable  
<a name="schemaAttributes"></a>
## schemaAttributes : <code>Object</code>
Allowed schema attributes and validations.

**Kind**: global variable  
<a name="columnCallback"></a>
## columnCallback : <code>function</code>
**Kind**: global typedef  

| Param | Type | Description |
| --- | --- | --- |
| column | <code>[Column](#Column)</code> | Column object |

<a name="schemaCallback"></a>
## schemaCallback : <code>function</code>
**Kind**: global typedef  

| Param | Type | Description |
| --- | --- | --- |
| schema | <code>[Schema](#Schema)</code> | Schema object |

<a name="tableCallback"></a>
## tableCallback : <code>function</code>
**Kind**: global typedef  

| Param | Type | Description |
| --- | --- | --- |
| table | <code>[Table](#Table)</code> | Table object |

<a name="columnCallback"></a>
## columnCallback : <code>function</code>
**Kind**: global typedef  

| Param | Type | Description |
| --- | --- | --- |
| column | <code>[Column](#Column)</code> | Column object |

<a name="constraintCallback"></a>
## constraintCallback : <code>function</code>
**Kind**: global typedef  

| Param | Type | Description |
| --- | --- | --- |
| constraint | <code>[Constraint](#Constraint)</code> | Constraint object |


---------------------------------------

<a name="History"></a>
History & Release Notes
=======================

Note
----
Version history for minimal documentation updates are not listed here to prevent cluttering.
Important documentation changes are included anyway.

1.11.1 / 2015-06-16
===================
* Added: JSONB support. Contributed by: viniciuspinto (https://github.com/viniciuspinto)

1.11.0 / 2014-12-30
===================
* Added: Constraint.throughForeignKeyConstraintToSelf() method added.
* Added: Winston logging.
* Fixed: Many to Many relations has name collisions if join table connects more than one table and one of the tables has more than one connection to join table. Naming of many to many relations changed.

1.10.0 / 2014-12-23
==================
* Added: db.includedSchemas method to get list of requested schemas to be parsed.
* Added: db.schemaIncluded method to determine if given schema name is one of the requested schemas to be parsed.
* Fix: If a table has a reference to not included schema, throws exception. Should not include its foreign key.
* Doc update.

1.9.0 / 2014-12-12
==================
* Added: table.hasManyThrough.throughForeignKeyConstraint method added to constraint class.

1.8.3 / 2014-12-10
==================
* Fix: Sequelize type length, precision.

1.8.2 / 2014-12-10
==================
* Fix: Sequelize type date, time etc. has no length property.
* Fix: Sequelize type dateonly added.
* Tests added.

1.8.0 / 2014-12-10
==================
* Added: Shortcut function 'get' added to db, schema and table classes.
* Fix: hasManyThrough does not return foreign keys.

1.7.0 / 2014-12-10
==================
* Added: onDelete and onUpdate added to hasMany and hasManyThrough relations.

1.6.0 / 2014-12-10
==================
* DEPRECATED: column.special function. Use column.enumValues instead.
* Added: Tests for enum values.
* Added: Enum support for column.sequelizeType function.
* Updated: Documentation

1.5.1 / 2014-12-04
==================
* Fix: Test db does not destroyed after tests.

1.5.0 / 2014-12-04
==================
* Fix: column.default() method returns default value with type cast. From now on yype cast part is stripped.
* Added column.defaultWithTypeCast() method for getting default values with type cast part.
* Tests added for default values.

1.4.0 / 2014-11-28
==================
* Added support for user-defined types.
* Added column.udType() method to get user defined type name.
* Added necessary tests.

1.3.1 / 2014-11-27
==================
* Added history to readme.
* Fix: Major error: Single schema or default 'public' schema databases throw error.
* Fix: Databases without any table throw error.
* Added tests of this fixes and table without any column.


1.3.0 / 2014-11-27
==================
* Parameter validation added to pg-structure main function. This would ease debugging.
* Fix: pg-structure.generate function was throwing error, now it calls its callback with error
if database connection error occurs.

1.2.1 / 2014-11-26
==================
* Fix: Documentation updated for 1.2

1.2.0 / 2014-11-26
==================
* Fix: pg-structure callback does not get error object. Instead error is thrown. Now callback gets error object as its first parameter as expected.
* db.schema() function now throws more informative error if referenced schema is not found in db and also not in the options of requested schemas.
* db.schemaExist() function added.
* History.md file added. (This file)

1.1.0 / 2014-11-25
==================
* table.foreignKeyConstraintExist() function added.

1.0.0 / 2014-11-25
==================
* Completely rewritten to migrate from plain object to object oriented design.
* column.sequelizeType() method added. This method gets sequelize compatible type of the column.

The MIT License (MIT)

Copyright (c) 2014 Ozum Eldogan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

