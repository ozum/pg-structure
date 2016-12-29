<a name="Table"></a>

## Table
Class which represent a table. Provides attributes and methods for details of the table. Tables have relationships
with other tables.

<span id="exampleSchema"></span>Below is a database schema which is used in code examples.
```
size -------------------
id (PK)                |  ---------------------------< line_item >------------ cart
name                   |  |                            product_id (PFK)        id (PK)
                       |  |                            cart_id    (PFK)        name
                       ^  |
color -------------< product >------------- vendor
id (PK)              id        (PK)         id (PK)
name                 name                   name
                     color_id  (FK)
                     size_id   (FK)
                     vendor_id (FK)
```
Below is the same schema as image:
![Database Schema](../../images/schema-through.png)

**Kind**: global class  

* [Table](#Table)
    * [new Table(args)](#new_Table_new)
    * [.name](#Table+name) : <code>string</code>
    * [.fullName](#Table+fullName) : <code>string</code>
    * [.fullCatalogName](#Table+fullCatalogName) : <code>string</code>
    * [.schema](#Table+schema) : <code>Schema</code>
    * [.parent](#Table+parent) : <code>Schema</code>
    * [.comment](#Table+comment) : <code>string</code>
    * [.commentData](#Table+commentData) : <code>Object</code>
    * [.description](#Table+description) : <code>string</code>
    * [.descriptionData](#Table+descriptionData) : <code>Object</code>
    * [.columns](#Table+columns) : <code>Map.&lt;Column&gt;</code>
    * [.constraints](#Table+constraints) : <code>Map.&lt;Constraint&gt;</code>
    * [.db](#Table+db) : <code>Db</code>
    * [.foreignKeyConstraints](#Table+foreignKeyConstraints) : <code>Map.&lt;Constraint&gt;</code>
    * [.foreignKeyColumns](#Table+foreignKeyColumns) : <code>Map.&lt;Column&gt;</code>
    * [.foreignKeyConstraintsToThis](#Table+foreignKeyConstraintsToThis) : <code>Map.&lt;Constraint&gt;</code>
    * [.primaryKeyConstraint](#Table+primaryKeyConstraint) : <code>Constraint</code> &#124; <code>undefined</code>
    * [.primaryKeyColumns](#Table+primaryKeyColumns) : <code>Map.&lt;Column&gt;</code>
    * [.hasManyTables](#Table+hasManyTables) : <code>[Map.&lt;Table&gt;](#Table)</code>
    * [.belongsToTables](#Table+belongsToTables) : <code>[Map.&lt;Table&gt;](#Table)</code>
    * [.belongsToManyTables](#Table+belongsToManyTables) : <code>[Map.&lt;Table&gt;](#Table)</code>
    * [.belongsToManyTablesPk](#Table+belongsToManyTablesPk) : <code>[Map.&lt;Table&gt;](#Table)</code>
    * [.m2mRelations](#Table+m2mRelations) : <code>Set.&lt;M2MRelation&gt;</code>
    * [.m2mRelationsPk](#Table+m2mRelationsPk) : <code>Set.&lt;M2MRelation&gt;</code>
    * [.o2mRelations](#Table+o2mRelations) : <code>Set.&lt;O2MRelation&gt;</code>
    * [.m2oRelations](#Table+m2oRelations) : <code>Set.&lt;M2ORelation&gt;</code>
    * [.relations](#Table+relations) : <code>Array.&lt;(O2MRelation\|M2ORelation\|M2MRelation)&gt;</code>
    * [.get(path)](#Table+get) ⇒ <code>Column</code> &#124; <code>undefined</code>

<a name="new_Table_new"></a>

### new Table(args)
Constructor function. You don't need to call constructor manually. pg-structure handles this.


| Param | Type | Description |
| --- | --- | --- |
| args | <code>Object</code> | Attributes of the [Table](#Table) instance to be created. |
| args.parent | <code>Schema</code> | Parent [Schema](Schema) of the Table. |
| args.name | <code>string</code> | Name of the Table. |
| args.description | <code>string</code> | Description of the Table. |
| args.descriptionData | <code>Object</code> | Extra data to store in object. |

<a name="Table+name"></a>

### table.name : <code>string</code>
Name of the table.

**Kind**: instance property of <code>[Table](#Table)</code>  
**Read only**: true  
<a name="Table+fullName"></a>

### table.fullName : <code>string</code>
Full name of the [Table](#Table) with (.) notation.

**Kind**: instance property of <code>[Table](#Table)</code>  
**Read only**: true  
**Example**  
```js
var fullName = table.fullName; // public.account
```
<a name="Table+fullCatalogName"></a>

### table.fullCatalogName : <code>string</code>
Full name of the [Table](#Table) with (.) notation including catalog name.

**Kind**: instance property of <code>[Table](#Table)</code>  
**Read only**: true  
**Example**  
```js
var fullName = table.fullName; // crm.public.account
```
<a name="Table+schema"></a>

### table.schema : <code>Schema</code>
[Schema](Schema) this table belongs to.

**Kind**: instance property of <code>[Table](#Table)</code>  
**Read only**: true  
**See**: Aliases [parent](#Table+parent)  
**Example**  
```js
var schema = table.schema; // Schema instance
```
<a name="Table+parent"></a>

### table.parent : <code>Schema</code>
[Schema](Schema) this table belongs to.

**Kind**: instance property of <code>[Table](#Table)</code>  
**Read only**: true  
**See**: Aliases [schema](#Table+schema)  
**Example**  
```js
var schema = table.parent; // Schema instance
```
<a name="Table+comment"></a>

### table.comment : <code>string</code>
Comment of the table.

**Kind**: instance property of <code>[Table](#Table)</code>  
**Read only**: true  
**See**: Aliases [description](#Table+description)  
<a name="Table+commentData"></a>

### table.commentData : <code>Object</code>
JS Object extracted from table description. Object is expected as JSON data between `[PG-STRUCTURE]` and `[/PG-STRUCTURE]`
tags in description. Tags are case-insensitive.
For maximum comfort JSON parsing is made by [jsonic](https://www.npmjs.com/package/jsonic). It is a non-strict JSON parser. It is possible
to ommit quotes etc. Please see [jsonic](https://www.npmjs.com/package/jsonic) for details.

**Kind**: instance property of <code>[Table](#Table)</code>  
**Read only**: true  
**See**: Aliases [descriptionData](#Table+descriptionData)  
**Example**  
```js
let description = table.comment;             // -> 'This table holds account details. [PG-STRUCTURE]{ extraData: 2 }[/PGEN]'
let extra = table.commentData;               // -> { extraData: 2 }
console.log(table.commentData.extraData);    // -> 2
```
<a name="Table+description"></a>

### table.description : <code>string</code>
Comment of the table.

**Kind**: instance property of <code>[Table](#Table)</code>  
**Read only**: true  
**See**: Aliases [comment](#Table+comment)  
<a name="Table+descriptionData"></a>

### table.descriptionData : <code>Object</code>
JS Object extracted from table description. Object is expected as JSON data between `[PG-STRUCTURE]` and `[/PG-STRUCTURE]`
tags in description. Tags are case-insensitive.
For maximum comfort JSON parsing is made by [jsonic](https://www.npmjs.com/package/jsonic). It is a non-strict JSON parser. It is possible
to ommit quotes etc.
* You don't need to quote property names: { foo:"bar baz", red:255 }
* You don't need the top level braces: foo:"bar baz", red:255
* You don't need to quote strings with spaces: foo:bar baz, red:255
* You do need to quote strings if they contain a comma or closing brace or square bracket: icky:",}]"
* You can use single quotes for strings: Jules:'Cry "Havoc," and let slip the dogs of war!'
* You can have trailing commas: foo:bar, red:255,
For details, please see [jsonic](https://www.npmjs.com/package/jsonic).

**Kind**: instance property of <code>[Table](#Table)</code>  
**Read only**: true  
**See**: Aliases [commentData](#Table+commentData)  
**Example**  
```js
let description = table.description;             // -> 'This table holds account details. [PG-STRUCTURE]{ "extraData": 2 }[/PGEN]'
let extra = table.descriptionData;               // -> { extraData: 2 }
console.log(table.descriptionData.extraData);    // -> 2
```
<a name="Table+columns"></a>

### table.columns : <code>Map.&lt;Column&gt;</code>
All [Column](Column) instances in the table as a [Map](Map). They are ordered same order as they are
defined in database table.

**Kind**: instance property of <code>[Table](#Table)</code>  
**Read only**: true  
**See**: [Map](Map)  
**Example**  
```js
var isAvailable  = table.columns.has('id');
var columnNames  = Array.from(schema.columns.keys());       // Use spread operator to get column names as an array.
var column       = table.columns.get('user_id');
var name         = column.name;

for (let column of table.columns.values()) {
    console.log(column.name);
}

for (let [name, column] of table.columns) {
    console.log(name, column.name);
}
```
<a name="Table+constraints"></a>

### table.constraints : <code>Map.&lt;Constraint&gt;</code>
All [Constraint](Constraint) instances in the table as a [Map](Map). They are ordered by name.

**Kind**: instance property of <code>[Table](#Table)</code>  
**Read only**: true  
<a name="Table+db"></a>

### table.db : <code>Db</code>
[Db](Db) this table belongs to.

**Kind**: instance property of <code>[Table](#Table)</code>  
**Read only**: true  
<a name="Table+foreignKeyConstraints"></a>

### table.foreignKeyConstraints : <code>Map.&lt;Constraint&gt;</code>
All [Constraint](Constraint) instances which are foreign key constraints in the table as a [Map](Map).

**Kind**: instance property of <code>[Table](#Table)</code>  
**Read only**: true  
**See**: [o2mRelations](#Table+o2mRelations), [m2oRelations](#Table+m2oRelations), [m2mRelations](#Table+m2mRelations) to get more details about relations.  
<a name="Table+foreignKeyColumns"></a>

### table.foreignKeyColumns : <code>Map.&lt;Column&gt;</code>
All foreign key [columns](Column) of all [foreignKeyConstraints](#Table+foreignKeyConstraints) as a [Map](Map).
Foreign key [constraints](Constraint) may contain more than one column. To get foreign key columns of a specific foreign key constraint
use [foreignKeyConstraints](#Table+foreignKeyConstraints).[columns](Constraint#columns)

**Kind**: instance property of <code>[Table](#Table)</code>  
**Read only**: true  
<a name="Table+foreignKeyConstraintsToThis"></a>

### table.foreignKeyConstraintsToThis : <code>Map.&lt;Constraint&gt;</code>
All foreign key [Constraint](Constraint) instances which are referring to this table as a [Map](Map).

**Kind**: instance property of <code>[Table](#Table)</code>  
**Read only**: true  
**See**: [o2mRelations](#Table+o2mRelations), [m2oRelations](#Table+m2oRelations), [m2mRelations](#Table+m2mRelations) to get more details about relations.  
<a name="Table+primaryKeyConstraint"></a>

### table.primaryKeyConstraint : <code>Constraint</code> &#124; <code>undefined</code>
Primary key [constraint](Constraint) instance of this table.

**Kind**: instance property of <code>[Table](#Table)</code>  
**Read only**: true  
**See**: [primaryKeyColumns](#Table+primaryKeyColumns) to get primary key columns directly.  
**Example**  
```js
let pkConstraint = table.primaryKeyConstraint;
let pkColumns    = Array.from(pkConstraint.columns.values());   // As an array

for (let [name, column] of pkConstraint.columns) {
    console.log(column.name);
}
```
<a name="Table+primaryKeyColumns"></a>

### table.primaryKeyColumns : <code>Map.&lt;Column&gt;</code>
Primary key [columns](Column) of this table as a [Map](Map).

**Kind**: instance property of <code>[Table](#Table)</code>  
**Read only**: true  
**See**: [primaryKeyConstraint](#Table+primaryKeyConstraint) to get primary key constraint.  
**Example**  
```js
let pkColumns  = Array.from(table.primaryKeyColumns.values());  // As an array
for (let [name, column] of pkConstraint.columns) {
    console.log(column.name);
}
```
<a name="Table+hasManyTables"></a>

### table.hasManyTables : <code>[Map.&lt;Table&gt;](#Table)</code>
[Tables](#Table) sorted by name, which this table has relationship of type `one to many`.

**Kind**: instance property of <code>[Table](#Table)</code>  
**Read only**: true  
**See**: [Example schema](#exampleSchema), [Map](Map)  
**Example**  
```js
for (let [name, table] of vendorTable.hasManyTables) {
    console.log(table.name);
}
```
<a name="Table+belongsToTables"></a>

### table.belongsToTables : <code>[Map.&lt;Table&gt;](#Table)</code>
[Tables](#Table) sorted by name, which this table has relationship of type `belongs to` which is reverse direction of `one to many`.

**Kind**: instance property of <code>[Table](#Table)</code>  
**Read only**: true  
**See**: [Example schema](#exampleSchema), [Map](Map)  
**Example**  
```js
for (let [name, table] of productTable.belongsToTables) {
    console.log(table.name);
}
```
<a name="Table+belongsToManyTables"></a>

### table.belongsToManyTables : <code>[Map.&lt;Table&gt;](#Table)</code>
[Tables](#Table) sorted by name, which this table has relationship of type `many to many`.

**Kind**: instance property of <code>[Table](#Table)</code>  
**Read only**: true  
**See**: [Example schema](#exampleSchema), [Map](Map)  
**Example**  
```js
// Cart (id) has many products (id) through line_item join table.
for (let [name, table] of cartTable.belongsToManyTables) {
    console.log(table.name);
}
```
<a name="Table+belongsToManyTablesPk"></a>

### table.belongsToManyTablesPk : <code>[Map.&lt;Table&gt;](#Table)</code>
[Tables](#Table) sorted by name, which this table has relationship of type `many to many`. Includes
only tables joined by primary keys in join table.

**Kind**: instance property of <code>[Table](#Table)</code>  
**Read only**: true  
**See**: [Example schema](#exampleSchema), [Map](Map)  
**Example**  
```js
// Cart (id) has many products (id) through line_item join table.
for (let [name, table] of cartTable.belongsToManyTables) {
    console.log(table.name);
}
```
<a name="Table+m2mRelations"></a>

### table.m2mRelations : <code>Set.&lt;M2MRelation&gt;</code>
Set of [many to many relationships](M2MRelation) of the table. [M2MRelation](M2MRelation) resembles
`has many through` and `belongs to many` relations in ORMs. It has some useful methods and information for generating ORM classes.

**Kind**: instance property of <code>[Table](#Table)</code>  
**Read only**: true  
<a name="Table+m2mRelationsPk"></a>

### table.m2mRelationsPk : <code>Set.&lt;M2MRelation&gt;</code>
Set of [many to many relationships](M2MRelation) of the table. Different from [m2mRelations](#Table+m2mRelations)
this only includes relations joined by `Primary Foreign Keys` in join table. `Primary Foreign Keys` means
foreign keys of join table which are also Primary Keys of join table at the same time.
[M2MRelation](M2MRelation) resembles `has many through` and `belongs to many` relations in ORMs.
It has some useful methods and information for generating ORM classes.

**Kind**: instance property of <code>[Table](#Table)</code>  
**Read only**: true  
<a name="Table+o2mRelations"></a>

### table.o2mRelations : <code>Set.&lt;O2MRelation&gt;</code>
Set of [one to many relationships](O2MRelation) of the table. [O2MRelation](O2MRelation) resembles
`has many` relations in ORMs. It has some useful methods and information for generating ORM classes.

**Kind**: instance property of <code>[Table](#Table)</code>  
**Read only**: true  
<a name="Table+m2oRelations"></a>

### table.m2oRelations : <code>Set.&lt;M2ORelation&gt;</code>
Set of [many to one relationships](M2ORelation) of the table. [M2ORelation](M2ORelation) resembles
`belongs to` relations in ORMs. It has some useful methods and information for generating ORM classes.

**Kind**: instance property of <code>[Table](#Table)</code>  
**Read only**: true  
<a name="Table+relations"></a>

### table.relations : <code>Array.&lt;(O2MRelation\|M2ORelation\|M2MRelation)&gt;</code>
List of all relationships of the table.

**Kind**: instance property of <code>[Table](#Table)</code>  
**Read only**: true  
<a name="Table+get"></a>

### table.get(path) ⇒ <code>Column</code> &#124; <code>undefined</code>
Returns [Column](Column) on given path relative to [Table](#Table).

**Kind**: instance method of <code>[Table](#Table)</code>  
**Returns**: <code>Column</code> &#124; <code>undefined</code> - - Requested item.  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | Path of the requested item in dot (.) notation such as 'public.contact' |

**Example**  
```js
var column = table.get('contact'),      // Returns contact column in public table.
```
