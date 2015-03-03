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

#Index

**Classes**

* [class: Column](#Column)
  * [new Column(args, [options])](#new_Column)
  * [column.fullName](#Column#fullName)
  * [column.name([value])](#Column#name)
  * [column.defaultWithTypeCast([value])](#Column#defaultWithTypeCast)
  * [column.default([value])](#Column#default)
  * [column.allowNull([value])](#Column#allowNull)
  * [column.type([value])](#Column#type)
  * [column.special([value])](#Column#special)
  * [column.enumValues([value])](#Column#enumValues)
  * [column.length([value])](#Column#length)
  * [column.precision([value])](#Column#precision)
  * [column.scale([value])](#Column#scale)
  * [column.arrayType([value])](#Column#arrayType)
  * [column.arrayDimension([value])](#Column#arrayDimension)
  * [column.description([value])](#Column#description)
  * [column.isAutoIncrement([value])](#Column#isAutoIncrement)
  * [column.isPrimaryKey([value])](#Column#isPrimaryKey)
  * [column.isForeignKey([value])](#Column#isForeignKey)
  * [column.referencesColumn([value])](#Column#referencesColumn)
  * [column.onUpdate([value])](#Column#onUpdate)
  * [column.onDelete([value])](#Column#onDelete)
  * [column.unique([value])](#Column#unique)
  * [column.table([value])](#Column#table)
  * [column.parent([value])](#Column#parent)
  * [column.foreignKeyConstraint([value])](#Column#foreignKeyConstraint)
  * [column.udType([value])](#Column#udType)
  * [column.sequelizeType([varName])](#Column#sequelizeType)
* [class: Constraint](#Constraint)
  * [new Constraint(args, [options])](#new_Constraint)
  * [constraint.fullName](#Constraint#fullName)
  * [constraint.name([value])](#Constraint#name)
  * [constraint.onUpdate([value])](#Constraint#onUpdate)
  * [constraint.onDelete([value])](#Constraint#onDelete)
  * [constraint.table([value])](#Constraint#table)
  * [constraint.parent([value])](#Constraint#parent)
  * [constraint.referencesSchema([value])](#Constraint#referencesSchema)
  * [constraint.referencesTable([value])](#Constraint#referencesTable)
  * [constraint.through([value])](#Constraint#through)
  * [constraint.throughForeignKeyConstraint([value])](#Constraint#throughForeignKeyConstraint)
  * [constraint.throughForeignKeyConstraintToSelf([value])](#Constraint#throughForeignKeyConstraintToSelf)
  * [constraint.foreignKey(nameOrPos)](#Constraint#foreignKey)
  * [constraint.foreignKeyExist(nameOrPos)](#Constraint#foreignKeyExist)
  * [constraint.foreignKeysByName([callback])](#Constraint#foreignKeysByName)
  * [constraint.foreignKeys([callback])](#Constraint#foreignKeys)
* [class: DB](#DB)
  * [new DB(args, [options])](#new_DB)
  * [dB.fullName](#DB#fullName)
  * [dB.name([value])](#DB#name)
  * [dB.addSchema(args)](#DB#addSchema)
  * [dB.schema(name)](#DB#schema)
  * [dB.get(path)](#DB#get)
  * [dB.schemaExist(name)](#DB#schemaExist)
  * [dB.schemaIncluded(schemaName)](#DB#schemaIncluded)
  * [dB.includedSchemas()](#DB#includedSchemas)
  * [dB.schemas([callback])](#DB#schemas)
* [class: Schema](#Schema)
  * [new Schema(args, [options])](#new_Schema)
  * [schema.fullName](#Schema#fullName)
  * [schema.name([value])](#Schema#name)
  * [schema.db([value])](#Schema#db)
  * [schema.parent([value])](#Schema#parent)
  * [schema.table(name)](#Schema#table)
  * [schema.get(path)](#Schema#get)
  * [schema.tables([callback])](#Schema#tables)
* [class: Table](#Table)
  * [new Table(args, [options])](#new_Table)
  * [table.fullName](#Table#fullName)
  * [table.name([value])](#Table#name)
  * [table.description([value])](#Table#description)
  * [table.schema([value])](#Table#schema)
  * [table.parent([value])](#Table#parent)
  * [table.column(nameOrPos)](#Table#column)
  * [table.columns([callback])](#Table#columns)
  * [table.columnsByName([callback])](#Table#columnsByName)
  * [table.primaryKeys([callback])](#Table#primaryKeys)
  * [table.foreignKeyConstraint(name)](#Table#foreignKeyConstraint)
  * [table.foreignKeyConstraintExist(name)](#Table#foreignKeyConstraintExist)
  * [table.foreignKeyConstraints([callback])](#Table#foreignKeyConstraints)
  * [table.foreignKeyConstraintsByName([callback])](#Table#foreignKeyConstraintsByName)
  * [table.hasMany(name)](#Table#hasMany)
  * [table.hasManies([callback])](#Table#hasManies)
  * [table.hasManiesByName([callback])](#Table#hasManiesByName)
  * [table.hasManyThrough(name)](#Table#hasManyThrough)
  * [table.hasManyThroughs([callback])](#Table#hasManyThroughs)
  * [table.hasManyThroughsByName([callback])](#Table#hasManyThroughsByName)
  * [table.get(path)](#Table#get)

**Members**

* [columnAttributes](#columnAttributes)
* [constraintAttributes](#constraintAttributes)
* [schemaAttributes](#schemaAttributes)

**Typedefs**

* [callback: columnCallback](#columnCallback)
* [callback: schemaCallback](#schemaCallback)
* [callback: tableCallback](#tableCallback)
* [callback: columnCallback](#columnCallback)
* [callback: constraintCallback](#constraintCallback)
 
<a name="Column"></a>
#class: Column
**Members**

* [class: Column](#Column)
  * [new Column(args, [options])](#new_Column)
  * [column.fullName](#Column#fullName)
  * [column.name([value])](#Column#name)
  * [column.defaultWithTypeCast([value])](#Column#defaultWithTypeCast)
  * [column.default([value])](#Column#default)
  * [column.allowNull([value])](#Column#allowNull)
  * [column.type([value])](#Column#type)
  * [column.special([value])](#Column#special)
  * [column.enumValues([value])](#Column#enumValues)
  * [column.length([value])](#Column#length)
  * [column.precision([value])](#Column#precision)
  * [column.scale([value])](#Column#scale)
  * [column.arrayType([value])](#Column#arrayType)
  * [column.arrayDimension([value])](#Column#arrayDimension)
  * [column.description([value])](#Column#description)
  * [column.isAutoIncrement([value])](#Column#isAutoIncrement)
  * [column.isPrimaryKey([value])](#Column#isPrimaryKey)
  * [column.isForeignKey([value])](#Column#isForeignKey)
  * [column.referencesColumn([value])](#Column#referencesColumn)
  * [column.onUpdate([value])](#Column#onUpdate)
  * [column.onDelete([value])](#Column#onDelete)
  * [column.unique([value])](#Column#unique)
  * [column.table([value])](#Column#table)
  * [column.parent([value])](#Column#parent)
  * [column.foreignKeyConstraint([value])](#Column#foreignKeyConstraint)
  * [column.udType([value])](#Column#udType)
  * [column.sequelizeType([varName])](#Column#sequelizeType)

<a name="new_Column"></a>
##new Column(args, [options])
**Params**

- args `Object` - Column arguments  
  - name `string` - Name of the column  
  - \[default\] `string` - Default value of the column  
  - allowNull `boolean` - Is this column allowed to contain null values?  
  - type `string` - Data type of the column.  
  - \[enumValues\] `string` - Special attributes of the column.  
  - \[length\] `number` - Length of the column.  
  - \[precision\] `number` - Precision of the column.  
  - \[scale\] `number` - Scale of the column.  
  - \[arrayType\] `string` - If column is array. Data type of the array.  
  - \[arrayDimension\] `number` - array dimension of the column.  
  - \[udType\] `string` - User defined type of the column if the column type is user defined  
  - \[description\] `String` - Description of the table  
  - table <code>[Table](#Table)</code> - [Table](#Table) of the class  
- \[options\] `Object` - Options  
  - \[allowUnknown=true\] `boolean` - If true, unknown parameters passed to constructor does not throw error while creating object.  

<a name="Column#fullName"></a>
##column.fullName
Gets full name of the object in database . notation.

<a name="Column#name"></a>
##column.name([value])
**Params**

- \[value\] `string` - New value  

**Returns**: `string`  
<a name="Column#defaultWithTypeCast"></a>
##column.defaultWithTypeCast([value])
Returns default value with type cast.

**Params**

- \[value\] `string` - New value  

**Returns**: `string`  
<a name="Column#default"></a>
##column.default([value])
Returns default value without type cast.

**Params**

- \[value\] `string` - New value  

**Returns**: `string`  
**Example**  
var column = db('crm').schema('public').table('contact').column('name');
console.log(column.defaultWithTypeCast());  // 'George'::character varying
console.log(column.default());              // George

<a name="Column#allowNull"></a>
##column.allowNull([value])
**Params**

- \[value\] `boolean` - New value  

**Returns**: `boolean`  
<a name="Column#type"></a>
##column.type([value])
**Params**

- \[value\] `string` - New value  

**Returns**: `string`  
<a name="Column#special"></a>
##column.special([value])
DEPRECATED: use enumValues method instead.

**Params**

- \[value\] `string` - New value  

**Returns**: `string`  
<a name="Column#enumValues"></a>
##column.enumValues([value])
**Params**

- \[value\] `string` - New value  

**Returns**: `string`  
<a name="Column#length"></a>
##column.length([value])
**Params**

- \[value\] `integer` - New value  

**Returns**: `integer`  
<a name="Column#precision"></a>
##column.precision([value])
**Params**

- \[value\] `integer` - New value  

**Returns**: `integer`  
<a name="Column#scale"></a>
##column.scale([value])
**Params**

- \[value\] `integer` - New value  

**Returns**: `integer`  
<a name="Column#arrayType"></a>
##column.arrayType([value])
**Params**

- \[value\] `string` - New value  

**Returns**: `string`  
<a name="Column#arrayDimension"></a>
##column.arrayDimension([value])
**Params**

- \[value\] `integer` - New value  

**Returns**: `integer`  
<a name="Column#description"></a>
##column.description([value])
**Params**

- \[value\] `string` - New value  

**Returns**: `string`  
<a name="Column#isAutoIncrement"></a>
##column.isAutoIncrement([value])
**Params**

- \[value\] `boolean` - New value  

**Returns**: `boolean`  
<a name="Column#isPrimaryKey"></a>
##column.isPrimaryKey([value])
**Params**

- \[value\] `boolean` - New value  

**Returns**: `boolean`  
<a name="Column#isForeignKey"></a>
##column.isForeignKey([value])
**Params**

- \[value\] `boolean` - New value  

**Returns**: `boolean`  
<a name="Column#referencesColumn"></a>
##column.referencesColumn([value])
**Params**

- \[value\] <code>[Table](#Table)</code> - New value  

**Returns**: [Table](#Table)  
<a name="Column#onUpdate"></a>
##column.onUpdate([value])
**Params**

- \[value\] `string` - New value  

**Returns**: `string`  
<a name="Column#onDelete"></a>
##column.onDelete([value])
**Params**

- \[value\] `string` - New value  

**Returns**: `string`  
<a name="Column#unique"></a>
##column.unique([value])
**Params**

- \[value\] `string` - New value  

**Returns**: `string`  
<a name="Column#table"></a>
##column.table([value])
**Params**

- \[value\] <code>[Table](#Table)</code> - New value  

**Returns**: [Table](#Table)  
<a name="Column#parent"></a>
##column.parent([value])
**Params**

- \[value\] <code>[Table](#Table)</code> - New value  

**Returns**: [Table](#Table)  
<a name="Column#foreignKeyConstraint"></a>
##column.foreignKeyConstraint([value])
Gets/sets foreign key constraint of the column, if column is a foreign key.

**Params**

- \[value\] <code>[Constraint](#Constraint)</code> - New value  

**Returns**: [Constraint](#Constraint)  
<a name="Column#udType"></a>
##column.udType([value])
Gets/sets user defined type of the column, if column is a user defined type.

**Params**

- \[value\] `string` - New value  

**Returns**: `string`  
<a name="Column#sequelizeType"></a>
##column.sequelizeType([varName])
Returns Sequelize ORM datatype for column.

**Params**

- \[varName=DataTypes\] `String` - Variable name to use in sequelize data type. ie. 'DataTypes' for DataTypes.INTEGER  

**Returns**: `string`  
**Example**  
var typeA = column.sequelizeType();              // DataTypes.INTEGER(3)
var typeB = column.sequelizeType('Sequelize');   // Sequelize.INTEGER(3)

<a name="Constraint"></a>
#class: Constraint
**Members**

* [class: Constraint](#Constraint)
  * [new Constraint(args, [options])](#new_Constraint)
  * [constraint.fullName](#Constraint#fullName)
  * [constraint.name([value])](#Constraint#name)
  * [constraint.onUpdate([value])](#Constraint#onUpdate)
  * [constraint.onDelete([value])](#Constraint#onDelete)
  * [constraint.table([value])](#Constraint#table)
  * [constraint.parent([value])](#Constraint#parent)
  * [constraint.referencesSchema([value])](#Constraint#referencesSchema)
  * [constraint.referencesTable([value])](#Constraint#referencesTable)
  * [constraint.through([value])](#Constraint#through)
  * [constraint.throughForeignKeyConstraint([value])](#Constraint#throughForeignKeyConstraint)
  * [constraint.throughForeignKeyConstraintToSelf([value])](#Constraint#throughForeignKeyConstraintToSelf)
  * [constraint.foreignKey(nameOrPos)](#Constraint#foreignKey)
  * [constraint.foreignKeyExist(nameOrPos)](#Constraint#foreignKeyExist)
  * [constraint.foreignKeysByName([callback])](#Constraint#foreignKeysByName)
  * [constraint.foreignKeys([callback])](#Constraint#foreignKeys)

<a name="new_Constraint"></a>
##new Constraint(args, [options])
**Params**

- args `Object` - Constraint arguments  
  - name `string` - Name of the constraint  
  - referencesSchema <code>[Schema](#Schema)</code> - [Schema](#Schema) containing table which this constraint references to.  
  - referencesTable <code>[Table](#Table)</code> - [Table](#Table) which this constraint references to.  
  - \[onUpdate\] `string` - Action taken on update. One of: 'NO ACTION', 'CASCADE', 'SET NULL', 'RESTRICT'  
  - \[onUpdate\] `string` - Action taken on delete. One of: 'NO ACTION', 'CASCADE', 'SET NULL', 'RESTRICT'  
  - table <code>[Table](#Table)</code> - [Table](#Table) object which contains this constraint.  
  - through <code>[Table](#Table)</code> - [Table](#Table) object which this constraint references through.  
  - throughForeignKeyConstraint <code>[Table](#Table)</code> - [Constraint](#Constraint) object in through table referencing to other table.  
  - throughForeignKeyConstraintToSelf <code>[Table](#Table)</code> - [Constraint](#Constraint) object in through table referencing to this table.  
- \[options\] `Object` - Options  
  - \[allowUnknown=true\] `boolean` - If true, unknown parameters passed to constructor does not throw error while creating object.  

<a name="Constraint#fullName"></a>
##constraint.fullName
Gets full name of the object in database . notation.

<a name="Constraint#name"></a>
##constraint.name([value])
**Params**

- \[value\] `string` - New value  

**Returns**: `string`  
<a name="Constraint#onUpdate"></a>
##constraint.onUpdate([value])
**Params**

- \[value\] `string` - New value  

**Returns**: `string`  
<a name="Constraint#onDelete"></a>
##constraint.onDelete([value])
**Params**

- \[value\] `string` - New value  

**Returns**: `string`  
<a name="Constraint#table"></a>
##constraint.table([value])
**Params**

- \[value\] `string` - New value  

**Returns**: `string`  
<a name="Constraint#parent"></a>
##constraint.parent([value])
**Params**

- \[value\] `string` - New value  

**Returns**: `string`  
<a name="Constraint#referencesSchema"></a>
##constraint.referencesSchema([value])
Returns [Schema](#Schema) object this constraint refers to.

**Params**

- \[value\] <code>[Schema](#Schema)</code> - New value  

**Returns**: [Schema](#Schema)  
<a name="Constraint#referencesTable"></a>
##constraint.referencesTable([value])
Returns [Table](#Table) object this constraint refers to.

**Params**

- \[value\] <code>[Table](#Table)</code> - New value  

**Returns**: [Table](#Table)  
<a name="Constraint#through"></a>
##constraint.through([value])
Returns [Table](#Table) object this constraint refers through.

**Params**

- \[value\] <code>[Table](#Table)</code> - New value  

**Returns**: [Table](#Table)  
<a name="Constraint#throughForeignKeyConstraint"></a>
##constraint.throughForeignKeyConstraint([value])
Returns [Constraint](#Constraint) (foreign key constraint) this constraint referring to other table through join table.
With this method it is possible to learn how this table is connected to other table.

**Params**

- \[value\] <code>[Table](#Table)</code> - New value  

**Returns**: [Table](#Table)  
**Example**  
// Assume there are three tables for many to many relation:  cart ----< line_item >---- product
db.get('public.cart').hasManyThrough('cart_has_products').foreignKey(0).name(); // equals 'cart_id'
db.get('public.cart').hasManyThrough('cart_has_products').throughForeignKeyConstraint().foreignKey(0).name() // equals 'product_id'

<a name="Constraint#throughForeignKeyConstraintToSelf"></a>
##constraint.throughForeignKeyConstraintToSelf([value])
Returns [Constraint](#Constraint) (foreign key constraint) this constraint referring to itself through join table.
With this method it is possible to learn how this table is connected to other table.

**Params**

- \[value\] <code>[Table](#Table)</code> - New value  

**Returns**: [Table](#Table)  
<a name="Constraint#foreignKey"></a>
##constraint.foreignKey(nameOrPos)
Returns foreign key as a [Column](#Column) object with given name or order number.

**Params**

- nameOrPos `string` | `integer` - Name or order number of the foreign key  

**Returns**: [Column](#Column)  
<a name="Constraint#foreignKeyExist"></a>
##constraint.foreignKeyExist(nameOrPos)
Returns true if foreign key object with given name or order number exists.

**Params**

- nameOrPos `string` | `integer` - Name or order number of the foreign key  

**Returns**: `boolean`  
<a name="Constraint#foreignKeysByName"></a>
##constraint.foreignKeysByName([callback])
Retrieves all foreign keys in the constraint. If callback is provided, it is executed for each foreign key column.
Callback is passed [Column](#Column) object as parameter. If no callback is provided, returns a plain object. Object keys are column names,
values are [Column](#Column) objects.

**Params**

- \[callback\] <code>[columnCallback](#columnCallback)</code> - Callback to be executed for each column.  

**Returns**: `object.<string, Column>` | `undefined`  
<a name="Constraint#foreignKeys"></a>
##constraint.foreignKeys([callback])
Retrieves all foreign keys in the constraint. If callback is provided, it is executed for each foreign key column.
Callback is passed [Column](#Column) object as parameter. If no callback is provided, returns an array which
contains foreign key [Column](#Column) objects.

**Params**

- \[callback\] <code>[columnCallback](#columnCallback)</code> - Callback to be executed for each column.  

**Returns**: `object.<string, Column>` | `undefined`  
<a name="DB"></a>
#class: DB
**Members**

* [class: DB](#DB)
  * [new DB(args, [options])](#new_DB)
  * [dB.fullName](#DB#fullName)
  * [dB.name([value])](#DB#name)
  * [dB.addSchema(args)](#DB#addSchema)
  * [dB.schema(name)](#DB#schema)
  * [dB.get(path)](#DB#get)
  * [dB.schemaExist(name)](#DB#schemaExist)
  * [dB.schemaIncluded(schemaName)](#DB#schemaIncluded)
  * [dB.includedSchemas()](#DB#includedSchemas)
  * [dB.schemas([callback])](#DB#schemas)

<a name="new_DB"></a>
##new DB(args, [options])
**Params**

- args `Object` - Database arguments.  
  - name `String` - Name of the database.  
- \[options\] `Object` - Options  
  - \[schemas\] `array` | `string` - Requested schemas. Information purposes only.  
  - \[allowUnknown=true\] `boolean` - If true, unknown parameters passed to constructor does not throw error while creating object.  

<a name="DB#fullName"></a>
##dB.fullName
Gets full name of the object in database . notation.

<a name="DB#name"></a>
##dB.name([value])
Returns name of the db

**Params**

- \[value\] `string` - New value  

**Returns**: `string`  
<a name="DB#addSchema"></a>
##dB.addSchema(args)
Adds schema to the schema and returns schema created newly.

**Params**

- args <code>[Schema](#Schema)</code> | `object` - Schema object or general object to create column object  
  - name `string` - Name of the schema.  

**Returns**: [Schema](#Schema)  
<a name="DB#schema"></a>
##dB.schema(name)
Returns the [Schema](#Schema) object with given name.

**Params**

- name `string` - Name of the schema  

**Returns**: [Schema](#Schema)  
<a name="DB#get"></a>
##dB.get(path)
Shortcut function which returns object based on path.

**Params**

- path `string` - Database path of the requested item.  

**Returns**: [Schema](#Schema) | [Table](#Table) | [Column](#Column)  
**Example**  
var schema = db.get('public'),                   // Returns public schema.
    table  = db.get('public.contact'),           // Returns contact table in public schema.
    column = db.get('public.contact.name');      // Returns name column of the contact table in public schema.

<a name="DB#schemaExist"></a>
##dB.schemaExist(name)
Returns true if object with given name exist.

**Params**

- name `string` - Name of the schema  

**Returns**: `boolean`  
<a name="DB#schemaIncluded"></a>
##dB.schemaIncluded(schemaName)
Returns if given schema is one of the requested schemas to be parsed.

**Params**

- schemaName `string` - Name of the schema to check  

**Returns**: `boolean`  
<a name="DB#includedSchemas"></a>
##dB.includedSchemas()
Returns the list of requested schemas to be parsed.

**Returns**: `Array`  
<a name="DB#schemas"></a>
##dB.schemas([callback])
Retrieves all schemas in the schema. If callback is provided, it is executed for each schema. Callback is passed [Schema](#Schema)
object as parameter. If no callback is provided, returns a plain object. Object keys are schema names,
values are [Schema](#Schema) objects.

**Params**

- \[callback\] <code>[schemaCallback](#schemaCallback)</code> - Callback to be executed for each schema.  

**Returns**: `object.<string, Schema>` | `undefined`  
<a name="Schema"></a>
#class: Schema
**Members**

* [class: Schema](#Schema)
  * [new Schema(args, [options])](#new_Schema)
  * [schema.fullName](#Schema#fullName)
  * [schema.name([value])](#Schema#name)
  * [schema.db([value])](#Schema#db)
  * [schema.parent([value])](#Schema#parent)
  * [schema.table(name)](#Schema#table)
  * [schema.get(path)](#Schema#get)
  * [schema.tables([callback])](#Schema#tables)

<a name="new_Schema"></a>
##new Schema(args, [options])
**Params**

- args `Object` - Schema arguments.  
  - name `string` - Name of the schema.  
  - db <code>[DB](#DB)</code> - [DB](#DB) of the schema.  
- \[options\] `Object` - Options  
  - \[allowUnknown=true\] `boolean` - If true, unknown parameters passed to constructor does not throw error while creating object.  

<a name="Schema#fullName"></a>
##schema.fullName
Gets full name of the object in database . notation.

<a name="Schema#name"></a>
##schema.name([value])
Returns name of the schema

**Params**

- \[value\] `string` - New value  

**Returns**: `string`  
<a name="Schema#db"></a>
##schema.db([value])
Retrieves [DB](#DB) object of the schema.

**Params**

- \[value\] <code>[DB](#DB)</code> - New value  

**Returns**: [DB](#DB)  
<a name="Schema#parent"></a>
##schema.parent([value])
Retrieves [DB](#DB) object of the schema.

**Params**

- \[value\] <code>[DB](#DB)</code> - New value  

**Returns**: [DB](#DB)  
<a name="Schema#table"></a>
##schema.table(name)
Returns the [Table](#Table) object with given name.

**Params**

- name `string` - Name of the table  

**Returns**: [Table](#Table)  
<a name="Schema#get"></a>
##schema.get(path)
Shortcut function which returns object based on path.

**Params**

- path `string` - Database path of the requested item.  

**Returns**: [Table](#Table) | [Column](#Column)  
**Example**  
var table  = db.get('contact'),           // Returns contact table in public schema.
    column = db.get('contact.name');      // Returns name column of the contact table in public schema.

<a name="Schema#tables"></a>
##schema.tables([callback])
Retrieves all tables in the schema. If callback is provided, it is executed for each table. Callback is passed [Table](#Table)
object as parameter. If no callback is provided, returns a plain object. Object keys are table names,
values are [Table](#Table) objects.

**Params**

- \[callback\] <code>[tableCallback](#tableCallback)</code> - Callback to be executed for each table.  

**Returns**: `object.<string, Table>` | `undefined`  
<a name="Table"></a>
#class: Table
**Members**

* [class: Table](#Table)
  * [new Table(args, [options])](#new_Table)
  * [table.fullName](#Table#fullName)
  * [table.name([value])](#Table#name)
  * [table.description([value])](#Table#description)
  * [table.schema([value])](#Table#schema)
  * [table.parent([value])](#Table#parent)
  * [table.column(nameOrPos)](#Table#column)
  * [table.columns([callback])](#Table#columns)
  * [table.columnsByName([callback])](#Table#columnsByName)
  * [table.primaryKeys([callback])](#Table#primaryKeys)
  * [table.foreignKeyConstraint(name)](#Table#foreignKeyConstraint)
  * [table.foreignKeyConstraintExist(name)](#Table#foreignKeyConstraintExist)
  * [table.foreignKeyConstraints([callback])](#Table#foreignKeyConstraints)
  * [table.foreignKeyConstraintsByName([callback])](#Table#foreignKeyConstraintsByName)
  * [table.hasMany(name)](#Table#hasMany)
  * [table.hasManies([callback])](#Table#hasManies)
  * [table.hasManiesByName([callback])](#Table#hasManiesByName)
  * [table.hasManyThrough(name)](#Table#hasManyThrough)
  * [table.hasManyThroughs([callback])](#Table#hasManyThroughs)
  * [table.hasManyThroughsByName([callback])](#Table#hasManyThroughsByName)
  * [table.get(path)](#Table#get)

<a name="new_Table"></a>
##new Table(args, [options])
**Params**

- args `Object` - Table arguments.  
  - name `String` - Name of the table.  
  - \[description\] `String` - Description of the table.  
  - schema <code>[Schema](#Schema)</code> - [Schema](#Schema) of the table.  
- \[options\] `Object` - Options  
  - \[allowUnknown=true\] `boolean` - If true, unknown parameters passed to constructor does not throw error while creating object.  

<a name="Table#fullName"></a>
##table.fullName
Gets full name of the object in database . notation.

<a name="Table#name"></a>
##table.name([value])
Retrieves name of the table.

**Params**

- \[value\] `string` - New value  

**Returns**: `string`  
<a name="Table#description"></a>
##table.description([value])
Retrieves description of the table.

**Params**

- \[value\] `string` - New value  

**Returns**: `string`  
<a name="Table#schema"></a>
##table.schema([value])
Retrieves [Schema](#Schema) object of the table.

**Params**

- \[value\] <code>[Schema](#Schema)</code> - New value  

**Returns**: [Schema](#Schema)  
<a name="Table#parent"></a>
##table.parent([value])
Retrieves [Schema](#Schema) object of the table.

**Params**

- \[value\] <code>[Schema](#Schema)</code> - New value  

**Returns**: [Schema](#Schema)  
<a name="Table#column"></a>
##table.column(nameOrPos)
Returns [Column](#Column) object with given name or order number.

**Params**

- nameOrPos `string` | `integer` - Name or order number of the column  

**Returns**: [Column](#Column)  
<a name="Table#columns"></a>
##table.columns([callback])
Retrieves all columns in the table in an ordered list. If callback is provided, it is executed for each column. Callback is passed [Column](#Column)
object as parameter. If no callback is provided, returns array of [Column](#Column) objects.

**Params**

- \[callback\] <code>[columnCallback](#columnCallback)</code> - Callback to be executed for each column.  

**Returns**: [Array.&lt;Column&gt;](#Column) | `undefined`  
<a name="Table#columnsByName"></a>
##table.columnsByName([callback])
Retrieves all columns in the table. If callback is provided, it is executed for each column. Callback is passed [Column](#Column)
object as parameter. If no callback is provided, returns a plain Object. Object keys are column names,
values are [Column](#Column) objects.

**Params**

- \[callback\] <code>[columnCallback](#columnCallback)</code> - Callback to be executed for each column.  

**Returns**: `Object.<string, Column>` | `undefined`  
<a name="Table#primaryKeys"></a>
##table.primaryKeys([callback])
Retrieves all primary key columns in the table. If callback is provided, it is executed for each primary key.
Callback is passed [Column](#Column) object as parameter.
If no callback is provided, returns an array of [Column](#Column) objects.

**Params**

- \[callback\] <code>[columnCallback](#columnCallback)</code> - Callback to be executed for each primary key column.  

**Returns**: [Array.&lt;Column&gt;](#Column)  
<a name="Table#foreignKeyConstraint"></a>
##table.foreignKeyConstraint(name)
Returns foreign key [Constraint](#Constraint) object with given name.

**Params**

- name `string` - Name of the foreign key constraint  

**Returns**: [Constraint](#Constraint)  
<a name="Table#foreignKeyConstraintExist"></a>
##table.foreignKeyConstraintExist(name)
Returns true if foreign key object with given name exists.

**Params**

- name `string` - Name of the foreign key constraint  

**Returns**: `boolean`  
<a name="Table#foreignKeyConstraints"></a>
##table.foreignKeyConstraints([callback])
Retrieves all foreign key constraints in the table. If callback is provided, it is executed for each one.
Callback is passed [Constraint](#Constraint) object as parameter.
If no callback is provided, returns a plain Object. Plain object keys are names of [Constraint](#Constraint) objects and values are [Constraint](#Constraint) objects.

**Params**

- \[callback\] <code>[constraintCallback](#constraintCallback)</code> - Callback to be executed for each constraint.  

**Returns**: [Array.&lt;Constraint&gt;](#Constraint)  
<a name="Table#foreignKeyConstraintsByName"></a>
##table.foreignKeyConstraintsByName([callback])
Retrieves all foreign key constraints in the table. If callback is provided, it is executed for each one.
Callback is passed [Constraint](#Constraint) object as parameter.
If no callback is provided, returns an array of [Constraint](#Constraint) objects.

**Params**

- \[callback\] <code>[constraintCallback](#constraintCallback)</code> - Callback to be executed for each constrained.  

**Returns**: `Object.<string, Constraint>` | `undefined`  
<a name="Table#hasMany"></a>
##table.hasMany(name)
Returns has many [Constraint](#Constraint) object with given name.

**Params**

- name `string` - Name of the has many constraint  

**Returns**: [Constraint](#Constraint)  
<a name="Table#hasManies"></a>
##table.hasManies([callback])
Retrieves all has many constraints in the table. If callback is provided, it is executed for each one.
Callback is passed [Constraint](#Constraint) object as parameter.
If no callback is provided, returns a plain Object. Plain object keys are names of [Constraint](#Constraint) objects and values are [Constraint](#Constraint) objects.

**Params**

- \[callback\] <code>[constraintCallback](#constraintCallback)</code> - Callback to be executed for each constraint.  

**Returns**: [Array.&lt;Constraint&gt;](#Constraint)  
<a name="Table#hasManiesByName"></a>
##table.hasManiesByName([callback])
Retrieves all has many constraints in the table. If callback is provided, it is executed for one.
Callback is passed [Constraint](#Constraint) object as parameter.
If no callback is provided, returns an array of [Constraint](#Constraint) objects.

**Params**

- \[callback\] <code>[constraintCallback](#constraintCallback)</code> - Callback to be executed for each constraint.  

**Returns**: `Object.<string, Constraint>` | `undefined`  
<a name="Table#hasManyThrough"></a>
##table.hasManyThrough(name)
Returns has many through [Constraint](#Constraint) object with given name.

**Params**

- name `string` - Name of the has many through constraint  

**Returns**: [Constraint](#Constraint)  
<a name="Table#hasManyThroughs"></a>
##table.hasManyThroughs([callback])
Retrieves all has many through constraints in the table. If callback is provided, it is executed for each one.
Callback is passed [Constraint](#Constraint) object as parameter.
If no callback is provided, returns a plain Object. Plain object keys are names of [Constraint](#Constraint) objects and values are [Constraint](#Constraint) objects.

**Params**

- \[callback\] <code>[constraintCallback](#constraintCallback)</code> - Callback to be executed for each constraint.  

**Returns**: [Array.&lt;Constraint&gt;](#Constraint)  
<a name="Table#hasManyThroughsByName"></a>
##table.hasManyThroughsByName([callback])
Retrieves all has many through constraints in the table. If callback is provided, it is executed for one.
Callback is passed [Constraint](#Constraint) object as parameter.
If no callback is provided, returns an array of [Constraint](#Constraint) objects.

**Params**

- \[callback\] <code>[constraintCallback](#constraintCallback)</code> - Callback to be executed for each constraint.  

**Returns**: `Object.<string, Constraint>` | `undefined`  
<a name="Table#get"></a>
##table.get(path)
Shortcut function which returns object based on path.

**Params**

- path `string` - Database path of the requested item.  

**Returns**: [Column](#Column)  
**Example**  
var column = db.get('name');      // Returns name column of the contact table in public schema.

<a name="columnAttributes"></a>
#columnAttributes
Allowed column attributes and validations.

**Type**: `Object`  
<a name="constraintAttributes"></a>
#constraintAttributes
Allowed column attributes and validations.

**Type**: `Object`  
<a name="schemaAttributes"></a>
#schemaAttributes
Allowed schema attributes and validations.

**Type**: `Object`  
<a name="columnCallback"></a>
#callback: columnCallback
**Params**

- column <code>[Column](#Column)</code> - Column object  

**Type**: `function`  
<a name="schemaCallback"></a>
#callback: schemaCallback
**Params**

- schema <code>[Schema](#Schema)</code> - Schema object  

**Type**: `function`  
<a name="tableCallback"></a>
#callback: tableCallback
**Params**

- table <code>[Table](#Table)</code> - Table object  

**Type**: `function`  
<a name="columnCallback"></a>
#callback: columnCallback
**Params**

- column <code>[Column](#Column)</code> - Column object  

**Type**: `function`  
<a name="constraintCallback"></a>
#callback: constraintCallback
**Params**

- constraint <code>[Constraint](#Constraint)</code> - Constraint object  

**Type**: `function`  

---------------------------------------

<a name="History"></a>
History & Release Notes
=======================

Note
----
Version history for minimal documentation updates are not listed here to prevent cluttering.
Important documentation changes are included anyway.

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

