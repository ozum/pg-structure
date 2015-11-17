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
  * [.columns](#Table+columns) : <code>Array.&lt;Column&gt;</code> &#124; <code>null</code>
  * [.columnsByName](#Table+columnsByName) : <code>Object.&lt;string, Column&gt;</code> &#124; <code>null</code>
  * [.constraints](#Table+constraints) : <code>Array.&lt;Constraint&gt;</code> &#124; <code>null</code>
  * [.constraintsByName](#Table+constraintsByName) : <code>Object.&lt;string, Constraint&gt;</code> &#124; <code>null</code>
  * [.db](#Table+db) : <code>DB</code>
  * [.foreignKeyConstraints](#Table+foreignKeyConstraints) : <code>Array.&lt;Constraint&gt;</code> &#124; <code>null</code>
  * [.foreignKeyConstraintsByName](#Table+foreignKeyConstraintsByName) : <code>Object.&lt;string, Constraint&gt;</code> &#124; <code>null</code>
  * [.foreignKeyColumns](#Table+foreignKeyColumns) : <code>Array.&lt;Column&gt;</code> &#124; <code>null</code>
  * [.foreignKeyColumnsByName](#Table+foreignKeyColumnsByName) : <code>Object.&lt;string, Column&gt;</code> &#124; <code>null</code>
  * [.primaryKeyConstraint](#Table+primaryKeyConstraint) : <code>Constraint</code> &#124; <code>undefined</code>
  * [.primaryKeyColumns](#Table+primaryKeyColumns) : <code>Array.&lt;Column&gt;</code> &#124; <code>null</code>
  * [.primaryKeyColumnsByName](#Table+primaryKeyColumnsByName) : <code>Object.&lt;string, Column&gt;</code> &#124; <code>null</code>
  * [.hasManyTables](#Table+hasManyTables) : <code>[Array.&lt;Table&gt;](#Table)</code> &#124; <code>null</code>
  * [.hasManyTablesByName](#Table+hasManyTablesByName) : <code>Object.&lt;string, Table&gt;</code> &#124; <code>null</code>
  * [.hasManyTablesByFullName](#Table+hasManyTablesByFullName) : <code>Object.&lt;string, Table&gt;</code> &#124; <code>null</code>
  * [.belongsToTables](#Table+belongsToTables) : <code>[Array.&lt;Table&gt;](#Table)</code> &#124; <code>null</code>
  * [.belongsToTablesByName](#Table+belongsToTablesByName) : <code>Object.&lt;string, Table&gt;</code> &#124; <code>null</code>
  * [.belongsToTablesByFullName](#Table+belongsToTablesByFullName) : <code>Object.&lt;string, Table&gt;</code> &#124; <code>null</code>
  * [.belongsToManyTables](#Table+belongsToManyTables) : <code>[Array.&lt;Table&gt;](#Table)</code> &#124; <code>null</code>
  * [.belongsToManyTablesByName](#Table+belongsToManyTablesByName) : <code>Object.&lt;string, Table&gt;</code> &#124; <code>null</code>
  * [.belongsToManyTablesByFullName](#Table+belongsToManyTablesByFullName) : <code>Object.&lt;string, Table&gt;</code> &#124; <code>null</code>
  * [.m2mRelations](#Table+m2mRelations) : <code>Array.&lt;M2MRelation&gt;</code> &#124; <code>null</code>
  * [.o2mRelations](#Table+o2mRelations) : <code>Array.&lt;O2MRelation&gt;</code> &#124; <code>null</code>
  * [.m2oRelations](#Table+m2oRelations) : <code>Array.&lt;M2ORelation&gt;</code> &#124; <code>null</code>
  * [.indexes](#Table+indexes) : <code>Array.&lt;Index&gt;</code> &#124; <code>null</code>
  * [.getColumn(key)](#Table+getColumn) ⇒ <code>Column</code> &#124; <code>undefined</code>
  * [.columnExists(name)](#Table+columnExists) ⇒ <code>boolean</code>
  * [.get(path)](#Table+get) ⇒ <code>Column</code> &#124; <code>undefined</code>
  * [.getColumns([callback])](#Table+getColumns) ⇒ <code>Array.&lt;Column&gt;</code> &#124; <code>undefined</code> &#124; <code>null</code>
  * [.getConstraints([callback])](#Table+getConstraints) ⇒ <code>Array.&lt;Constraint&gt;</code> &#124; <code>undefined</code> &#124; <code>null</code>
  * [.getForeignKeyConstraints([callback])](#Table+getForeignKeyConstraints) ⇒ <code>Array.&lt;Constraint&gt;</code> &#124; <code>undefined</code> &#124; <code>null</code>
  * [.getForeignKeyColumns([callback])](#Table+getForeignKeyColumns) ⇒ <code>Array.&lt;Column&gt;</code> &#124; <code>undefined</code> &#124; <code>null</code>
  * [.getPrimaryKeyColumns([callback])](#Table+getPrimaryKeyColumns) ⇒ <code>Array.&lt;Column&gt;</code> &#124; <code>undefined</code> &#124; <code>null</code>
  * [.getPrimaryKeyConstraint([callback])](#Table+getPrimaryKeyConstraint) ⇒ <code>Array.&lt;Constraint&gt;</code> &#124; <code>undefined</code> &#124; <code>null</code>
  * [.getHasManyTables([callback])](#Table+getHasManyTables) ⇒ <code>Array.&lt;Column&gt;</code> &#124; <code>undefined</code> &#124; <code>null</code>
  * [.getBelongsToTables([callback])](#Table+getBelongsToTables) ⇒ <code>Array.&lt;Column&gt;</code> &#124; <code>undefined</code> &#124; <code>null</code>
  * [.getBelongsToManyTables([callback])](#Table+getBelongsToManyTables) ⇒ <code>Array.&lt;Column&gt;</code> &#124; <code>undefined</code> &#124; <code>null</code>
  * [.getM2MRelations([callback])](#Table+getM2MRelations) ⇒ <code>Array.&lt;M2MRelation&gt;</code> &#124; <code>undefined</code> &#124; <code>null</code>
  * [.getO2MRelations([callback])](#Table+getO2MRelations) ⇒ <code>Array.&lt;O2MRelation&gt;</code> &#124; <code>undefined</code> &#124; <code>null</code>
  * [.getM2ORelations([callback])](#Table+getM2ORelations) ⇒ <code>Array.&lt;M2ORelation&gt;</code> &#124; <code>undefined</code> &#124; <code>null</code>
  * [.getIndexes([callback])](#Table+getIndexes) ⇒ <code>Array.&lt;Index&gt;</code> &#124; <code>undefined</code> &#124; <code>null</code>

<a name="new_Table_new"></a>
### new Table(args)

| Param | Type | Description |
| --- | --- | --- |
| args | <code>Object</code> | Database arguments. |
| args.registry | <code>Loki</code> | Loki.js database object. |
| args.attributes | <code>Object</code> | Attributes of the [Table](#Table) instance. |

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
<a name="Table+columns"></a>
### table.columns : <code>Array.&lt;Column&gt;</code> &#124; <code>null</code>
All [Column](Column) instances in the table as an array. They are ordered by same order they are added.

**Kind**: instance property of <code>[Table](#Table)</code>  
**Read only**: true  
**Example**  
```js
var columns = table.columns;
var name    = columns[0].name;
```
<a name="Table+columnsByName"></a>
### table.columnsByName : <code>Object.&lt;string, Column&gt;</code> &#124; <code>null</code>
All [Column](Column) instances in the table as a simple object. Keys are column names, values are [Column](Column) instances.

**Kind**: instance property of <code>[Table](#Table)</code>  
**Read only**: true  
**Example**  
```js
var columns   = table.columnsByName;
var ageColumn = columns.age;
```
<a name="Table+constraints"></a>
### table.constraints : <code>Array.&lt;Constraint&gt;</code> &#124; <code>null</code>
All [Constraint](Constraint) instances in the table as an array. They are ordered by same order they are added.

**Kind**: instance property of <code>[Table](#Table)</code>  
**Read only**: true  
<a name="Table+constraintsByName"></a>
### table.constraintsByName : <code>Object.&lt;string, Constraint&gt;</code> &#124; <code>null</code>
All [Constraint](Constraint) instances in the table as a simple object. Keys are constraint names, values are [Constraint](Constraint) instances.

**Kind**: instance property of <code>[Table](#Table)</code>  
**Read only**: true  
<a name="Table+db"></a>
### table.db : <code>DB</code>
[DB](DB) this table belongs to.

**Kind**: instance property of <code>[Table](#Table)</code>  
**Read only**: true  
<a name="Table+foreignKeyConstraints"></a>
### table.foreignKeyConstraints : <code>Array.&lt;Constraint&gt;</code> &#124; <code>null</code>
All [Constraint](Constraint) instances which are foreign key constraints in the table as an array.
They are ordered by same order they are defined in database.

**Kind**: instance property of <code>[Table](#Table)</code>  
**Read only**: true  
**See**: [o2mRelations](#Table+o2mRelations), [m2oRelations](#Table+m2oRelations), [m2mRelations](#Table+m2mRelations) to get more details about [relations](Relation).  
<a name="Table+foreignKeyConstraintsByName"></a>
### table.foreignKeyConstraintsByName : <code>Object.&lt;string, Constraint&gt;</code> &#124; <code>null</code>
All [Constraint](Constraint) instances which are foreign key constraints in the table as a simple object.
Keys are constraint names, values are [Constraint](Constraint) instances.

**Kind**: instance property of <code>[Table](#Table)</code>  
**Read only**: true  
**See**: [o2mRelations](#Table+o2mRelations), [m2oRelations](#Table+m2oRelations), [m2mRelations](#Table+m2mRelations) to get more details about [relations](Relation).  
<a name="Table+foreignKeyColumns"></a>
### table.foreignKeyColumns : <code>Array.&lt;Column&gt;</code> &#124; <code>null</code>
All foreign key [columns](Column) of all [foreignKeyConstraints](#Table+foreignKeyConstraints).
Foreign key [constraints](Constraint) may contain more than one column. To get foreign key columns of a specific foreign key constraint
use [foreignKeyConstraints](#Table+foreignKeyConstraints).[columns](Constraint#columns)

**Kind**: instance property of <code>[Table](#Table)</code>  
**Read only**: true  
<a name="Table+foreignKeyColumnsByName"></a>
### table.foreignKeyColumnsByName : <code>Object.&lt;string, Column&gt;</code> &#124; <code>null</code>
Object containing foreign key [columns](Column) of this table. Keys are column names, values are
[columns](Column) instances.
Foreign key [constraints](Constraint) may contain more than one column. To get foreign key columns of a specific foreign key constraint
use [foreignKeyConstraints](#Table+foreignKeyConstraints).[columns](Constraint#columns)

**Kind**: instance property of <code>[Table](#Table)</code>  
**Read only**: true  
**Example**  
```js
let pkColumns  = table.foreignKeyColumnsByName;
```
<a name="Table+primaryKeyConstraint"></a>
### table.primaryKeyConstraint : <code>Constraint</code> &#124; <code>undefined</code>
Primary key [constraint](Constraint) instance of this table.

**Kind**: instance property of <code>[Table](#Table)</code>  
**Read only**: true  
**See**: [primaryKeyColumns](#Table+primaryKeyColumns) to get primary key columns directly.  
**Example**  
```js
let pkConstraint = table.primaryKeyConstraint;
let pkColumns  = pkConstraint.columns;
```
<a name="Table+primaryKeyColumns"></a>
### table.primaryKeyColumns : <code>Array.&lt;Column&gt;</code> &#124; <code>null</code>
Primary key [columns](Column) of this table.

**Kind**: instance property of <code>[Table](#Table)</code>  
**Read only**: true  
**See**: [primaryKeyConstraint](#Table+primaryKeyConstraint) to get primary key constraint.  
**Example**  
```js
let pkColumns  = table.primaryKeyColumns;
```
<a name="Table+primaryKeyColumnsByName"></a>
### table.primaryKeyColumnsByName : <code>Object.&lt;string, Column&gt;</code> &#124; <code>null</code>
Object containing primary key [columns](Column) of this table. Keys are column names, values are
[columns](Column) instances.

**Kind**: instance property of <code>[Table](#Table)</code>  
**Read only**: true  
**See**: [primaryKeyConstraint](#Table+primaryKeyConstraint) to get primary key constraint.  
**Example**  
```js
let pkColumns  = table.primaryKeyColumnsByName;
```
<a name="Table+hasManyTables"></a>
### table.hasManyTables : <code>[Array.&lt;Table&gt;](#Table)</code> &#124; <code>null</code>
[Tables](#Table) which this table has relationship of type `one to many`.

**Kind**: instance property of <code>[Table](#Table)</code>  
**Read only**: true  
**See**: [Example schema](#exampleSchema)  
**Example**  
```js
// Vendor (id) has many products (vendor_id)
let productTable = vendorTable.hasManyTables[0];
```
<a name="Table+hasManyTablesByName"></a>
### table.hasManyTablesByName : <code>Object.&lt;string, Table&gt;</code> &#124; <code>null</code>
Object of [Tables](#Table) which this table has relationship of type `one to many`. Object keys
are table names, object values are [Table](#Table) instances.
** CAVEAT: Two tables may have same name in different schemas**, such as `public.account` and `other_schema.account`.
This is not a problem if there is only one PostgreSQL schema i.e. public. Otherwise it is advised to be used
[hasManyTablesByFullName](#Table+hasManyTablesByFullName).

**Kind**: instance property of <code>[Table](#Table)</code>  
**Read only**: true  
**See**

- [Example schema](#exampleSchema)
- [hasManyTablesByFullName](#Table+hasManyTablesByFullName)

**Example**  
```js
// Vendor (id) has many products (vendor_id)
let productTable = vendorTable.hasManyTablesByName.product;
```
<a name="Table+hasManyTablesByFullName"></a>
### table.hasManyTablesByFullName : <code>Object.&lt;string, Table&gt;</code> &#124; <code>null</code>
Object of [Tables](#Table) which this table has relationship of type `one to many`. Object keys
are table names including schema name (i.e. `public.account`), object values are [Table](#Table) instances.
** CAVEAT: Full table name contains a dot (.). You should access them with bracket notation. See example below.**
[hasManyTablesByName](#Table+hasManyTablesByName).

**Kind**: instance property of <code>[Table](#Table)</code>  
**Read only**: true  
**See**

- [Example schema](#exampleSchema)
- [hasManyTablesByName](#Table+hasManyTablesByName)

**Example**  
```js
// Vendor (id) has many products (vendor_id)
let productTable = vendorTable.hasManyTablesByFullName['public.product'];
```
<a name="Table+belongsToTables"></a>
### table.belongsToTables : <code>[Array.&lt;Table&gt;](#Table)</code> &#124; <code>null</code>
[Tables](#Table) which this table has relationship of type `belongs to` which is reverse direction of `one to many`.

**Kind**: instance property of <code>[Table](#Table)</code>  
**Read only**: true  
**See**: [Example schema](#exampleSchema)  
**Example**  
```js
// Vendor (id) has many products (vendor_id)
let vendorTable = productTable.belongsToTables[0];
```
<a name="Table+belongsToTablesByName"></a>
### table.belongsToTablesByName : <code>Object.&lt;string, Table&gt;</code> &#124; <code>null</code>
Object of [Tables](#Table) which this table has relationship of type `belongs to` which is reverse direction of `one to many`. Object keys
are table names, object values are [Table](#Table) instances.
** CAVEAT: Two tables may have same name in different schemas**, such as `public.account` and `other_schema.account`.
This is not a problem if there is only one PostgreSQL schema i.e. public. Otherwise it is advised to be used
[belongsToTablesByFullName](#Table+belongsToTablesByFullName).

**Kind**: instance property of <code>[Table](#Table)</code>  
**Read only**: true  
**See**

- [Example schema](#exampleSchema)
- [belongsToTablesByFullName](#Table+belongsToTablesByFullName)

**Example**  
```js
// Vendor (id) has many products (vendor_id)
let vendorTable = productTable.belongsToTablesByName.product;
```
<a name="Table+belongsToTablesByFullName"></a>
### table.belongsToTablesByFullName : <code>Object.&lt;string, Table&gt;</code> &#124; <code>null</code>
Object of [Tables](#Table) which this table has relationship of type `belongs to` which is reverse direction of `one to many`. Object keys
are table names including schema name (i.e. `public.account`), object values are [Table](#Table) instances.
** CAVEAT: Full table name contains a dot (.). You should access them with bracket notation. See example below.**
[belongsToTablesByName](#Table+belongsToTablesByName).

**Kind**: instance property of <code>[Table](#Table)</code>  
**Read only**: true  
**See**

- [Example schema](#exampleSchema)
- [belongsToTablesByName](#Table+belongsToTablesByName)

**Example**  
```js
// Vendor (id) has many products (vendor_id)
let vendorTable = productTable.belongsToTablesByFullName['public.product'];
```
<a name="Table+belongsToManyTables"></a>
### table.belongsToManyTables : <code>[Array.&lt;Table&gt;](#Table)</code> &#124; <code>null</code>
[Tables](#Table) which this table has relationship of type `many to many`.

**Kind**: instance property of <code>[Table](#Table)</code>  
**Read only**: true  
**See**: [Example schema](#exampleSchema)  
**Example**  
```js
// Cart (id) has many products (id) through line_item join table.
let productTable = cartTable.belongsToManyTables[0];
```
<a name="Table+belongsToManyTablesByName"></a>
### table.belongsToManyTablesByName : <code>Object.&lt;string, Table&gt;</code> &#124; <code>null</code>
Object of [Tables](#Table) which this table has relationship of type `many to many`. Object keys
are table names, object values are [Table](#Table) instances.
** CAVEAT: Two tables may have same name in different schemas**, such as `public.account` and `other_schema.account`.
This is not a problem if there is only one PostgreSQL schema i.e. public. Otherwise it is advised to be used
[belongsToManyTablesByFullName](#Table+belongsToManyTablesByFullName).

**Kind**: instance property of <code>[Table](#Table)</code>  
**Read only**: true  
**See**

- [Example schema](#exampleSchema)
- [belongsToManyTablesByFullName](#Table+belongsToManyTablesByFullName)

**Example**  
```js
// Cart (id) has many products (id) through line_item join table.
let productTable = cartTable.belongsToManyTablesByName.product;
```
<a name="Table+belongsToManyTablesByFullName"></a>
### table.belongsToManyTablesByFullName : <code>Object.&lt;string, Table&gt;</code> &#124; <code>null</code>
Object of [Tables](#Table) which this table has relationship of type `many to many`. Object keys
are table names including schema name (i.e. `public.account`), object values are [Table](#Table) instances.
** CAVEAT: Full table name contains a dot (.). You should access them with bracket notation. See example below.**
[belongsToManyTablesByName](#Table+belongsToManyTablesByName).

**Kind**: instance property of <code>[Table](#Table)</code>  
**Read only**: true  
**See**

- [Example schema](#exampleSchema)
- [belongsToManyTablesByName](#Table+belongsToManyTablesByName)

**Example**  
```js
// Cart (id) has many products (id) through line_item join table.
let productTable = cartTable.belongsToManyTablesByName['public.product'];
```
<a name="Table+m2mRelations"></a>
### table.m2mRelations : <code>Array.&lt;M2MRelation&gt;</code> &#124; <code>null</code>
List of [many to many relationships](M2MRelation) of the table. [M2MRelation](M2MRelation) resembles
`has many through` and `belongs to many` relations in ORMs has some useful methods and information for generating ORM classes.

**Kind**: instance property of <code>[Table](#Table)</code>  
**Read only**: true  
<a name="Table+o2mRelations"></a>
### table.o2mRelations : <code>Array.&lt;O2MRelation&gt;</code> &#124; <code>null</code>
List of [one to many relationships](O2MRelation) of the table. [O2MRelation](O2MRelation) resembles
`has many` relations in ORMs and has some useful methods and information for generating ORM classes.

**Kind**: instance property of <code>[Table](#Table)</code>  
**Read only**: true  
<a name="Table+m2oRelations"></a>
### table.m2oRelations : <code>Array.&lt;M2ORelation&gt;</code> &#124; <code>null</code>
List of [many to one relationships](M2ORelation) of the table. [M2ORelation](M2ORelation) resembles
`belongs to` relations in ORMs and has some useful methods and information for generating ORM classes.

**Kind**: instance property of <code>[Table](#Table)</code>  
**Read only**: true  
<a name="Table+indexes"></a>
### table.indexes : <code>Array.&lt;Index&gt;</code> &#124; <code>null</code>
List of [indexes](Index), which this table has. Results are ordered by index name.

**Kind**: instance property of <code>[Table](#Table)</code>  
**Read only**: true  
<a name="Table+getColumn"></a>
### table.getColumn(key) ⇒ <code>Column</code> &#124; <code>undefined</code>
Returns [Column](Column) instance with given name or order.

**Kind**: instance method of <code>[Table](#Table)</code>  
**Returns**: <code>Column</code> &#124; <code>undefined</code> - - Requested [Column](Column) instance.  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> &#124; <code>number</code> | Name or order number of the column. |

**Example**  
```js
var column = table.getColumn('surname');
```
<a name="Table+columnExists"></a>
### table.columnExists(name) ⇒ <code>boolean</code>
Returns true if [Column](Column) instance with given name or order number exists.

**Kind**: instance method of <code>[Table](#Table)</code>  
**Returns**: <code>boolean</code> - - `true` if schema column in table, otherwise `false`.  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> &#124; <code>number</code> | Name or order number of the column. |

**Example**  
```js
var ageColumn  = db.schemaExists('age');  // true
var jokeColumn = db.schemaExists('joke'); // false
```
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
<a name="Table+getColumns"></a>
### table.getColumns([callback]) ⇒ <code>Array.&lt;Column&gt;</code> &#124; <code>undefined</code> &#124; <code>null</code>
Retrieves all columns in the table, executes given callback and returns null, if provided. Callback has a signature of
([Column](Column), index, collection). If no callback is provided, returns an array of all [columns](Column).

**Kind**: instance method of <code>[Table](#Table)</code>  
**Returns**: <code>Array.&lt;Column&gt;</code> &#124; <code>undefined</code> &#124; <code>null</code> - - All [columns](Column) of the table.  

| Param | Type | Description |
| --- | --- | --- |
| [callback] | <code>orderedColumnCallback</code> | Callback to be executed for each column. |

**Example**  
```js
schema.getColumns(function(column, i, collection) {
    var name = column.name;
    var ord  = i;
);
```
<a name="Table+getConstraints"></a>
### table.getConstraints([callback]) ⇒ <code>Array.&lt;Constraint&gt;</code> &#124; <code>undefined</code> &#124; <code>null</code>
Retrieves all constraints in the table, executes given callback and returns null, if provided. Callback has a signature of
([Constraint](Constraint), index, collection). If no callback is provided, returns an array of all [constraints](Constraint).

**Kind**: instance method of <code>[Table](#Table)</code>  
**Returns**: <code>Array.&lt;Constraint&gt;</code> &#124; <code>undefined</code> &#124; <code>null</code> - - All [constraints](Constraint) of the table.  
**See**: [getForeignKeyConstraints](#Table+getForeignKeyConstraints) to get only foreign key constraints.  

| Param | Type | Description |
| --- | --- | --- |
| [callback] | <code>orderedConstraintCallback</code> | Callback to be executed for each constraint. |

**Example**  
```js
table.getConstraints(function(constraint, i, collection) {
    var name = constraint.name;
    var ord  = i;
);
```
<a name="Table+getForeignKeyConstraints"></a>
### table.getForeignKeyConstraints([callback]) ⇒ <code>Array.&lt;Constraint&gt;</code> &#124; <code>undefined</code> &#124; <code>null</code>
Retrieves all [constraints](Constraint) which are foreign key constraints in the table, executes given callback and returns null, if provided. Callback has a signature of
([Constraint](Constraint), index, collection). If no callback is provided, returns an array of all foreign key [constraints](Constraint).

**Kind**: instance method of <code>[Table](#Table)</code>  
**Returns**: <code>Array.&lt;Constraint&gt;</code> &#124; <code>undefined</code> &#124; <code>null</code> - - All foreign key [constraints](Constraint) of the table.  
**See**

- [getO2MRelations](#Table+getO2MRelations), [getM2MRelations](#Table+getM2MRelations) to get more details about [relations](Relation).
- [getConstraints](#Table+getConstraints) to get all constraints.


| Param | Type | Description |
| --- | --- | --- |
| [callback] | <code>orderedConstraintCallback</code> | Callback to be executed for each constraint. |

**Example**  
```js
table.getConstraints(function(constraint, i, collection) {
    var name = constraint.name;
    var ord  = i;
);
```
<a name="Table+getForeignKeyColumns"></a>
### table.getForeignKeyColumns([callback]) ⇒ <code>Array.&lt;Column&gt;</code> &#124; <code>undefined</code> &#124; <code>null</code>
Retrieves all foreign key [columns](Column) of all foreign key [constraints](Constraint) in the table, executes given callback and returns null, if provided. Callback has a signature of
([Column](Column), index, collection). If no callback is provided, returns an array of all foreign key [columns](Column).

**Kind**: instance method of <code>[Table](#Table)</code>  
**Returns**: <code>Array.&lt;Column&gt;</code> &#124; <code>undefined</code> &#124; <code>null</code> - - All foreign key [columns](Column) of the table.  

| Param | Type | Description |
| --- | --- | --- |
| [callback] | <code>orderedColumnCallback</code> | Callback to be executed for each column. |

**Example**  
```js
table.getForeignKeyColumns(function(column, i, collection) {
    var name = column.name;
    var ord  = i;
);
```
<a name="Table+getPrimaryKeyColumns"></a>
### table.getPrimaryKeyColumns([callback]) ⇒ <code>Array.&lt;Column&gt;</code> &#124; <code>undefined</code> &#124; <code>null</code>
Retrieves all primary key [columns](Column) in the table, executes given callback and returns null, if provided. Callback has a signature of
([Column](Column), index, collection). If no callback is provided, returns an array of all primary key [columns](Column).

**Kind**: instance method of <code>[Table](#Table)</code>  
**Returns**: <code>Array.&lt;Column&gt;</code> &#124; <code>undefined</code> &#124; <code>null</code> - - All primary key [columns](Column) of the table.  

| Param | Type | Description |
| --- | --- | --- |
| [callback] | <code>orderedColumnCallback</code> | Callback to be executed for each column. |

**Example**  
```js
table.getPrimaryKeyColumns(function(column, i, collection) {
    var name = column.name;
    var ord  = i;
);
```
<a name="Table+getPrimaryKeyConstraint"></a>
### table.getPrimaryKeyConstraint([callback]) ⇒ <code>Array.&lt;Constraint&gt;</code> &#124; <code>undefined</code> &#124; <code>null</code>
Retrieves [primary key constraint](Constraint) of the table and executes given callback and returns null, if provided. Callback has a signature of
([Constraint](Constraint), index, collection). If no callback is provided, returns single element array of primary key [constraint](Constraint).

**Kind**: instance method of <code>[Table](#Table)</code>  
**Returns**: <code>Array.&lt;Constraint&gt;</code> &#124; <code>undefined</code> &#124; <code>null</code> - - Primary key [constraint](Constraint) of the table.  

| Param | Type | Description |
| --- | --- | --- |
| [callback] | <code>orderedConstraintCallback</code> | Callback to be executed for single constraint. |

**Example**  
```js
table.getPrimaryKeyConstraint(function(constraint, i, collection) {
    var name = constraint.name;
    var ord  = i;
);
```
<a name="Table+getHasManyTables"></a>
### table.getHasManyTables([callback]) ⇒ <code>Array.&lt;Column&gt;</code> &#124; <code>undefined</code> &#124; <code>null</code>
Retrieves all [tables](#Table) which this table has relationship of type `one to many`, executes given callback and returns null if provided.
Callback has a signature of ([Table](#Table), index, collection). If no callback is provided, returns an array of all [tables](#Table).

**Kind**: instance method of <code>[Table](#Table)</code>  
**Returns**: <code>Array.&lt;Column&gt;</code> &#124; <code>undefined</code> &#124; <code>null</code> - - All [tables](#Table) which this table has relationship of type `one to many`.  

| Param | Type | Description |
| --- | --- | --- |
| [callback] | <code>orderedTableCallback</code> | Callback to be executed for each [table](#Table). |

<a name="Table+getBelongsToTables"></a>
### table.getBelongsToTables([callback]) ⇒ <code>Array.&lt;Column&gt;</code> &#124; <code>undefined</code> &#124; <code>null</code>
Retrieves all [tables](#Table) which this table has relationship of type `one to many` which is reverse direction of `one to many`, executes given callback and returns null if provided.
Callback has a signature of ([Table](#Table), index, collection). If no callback is provided, returns an array of all [tables](#Table).

**Kind**: instance method of <code>[Table](#Table)</code>  
**Returns**: <code>Array.&lt;Column&gt;</code> &#124; <code>undefined</code> &#124; <code>null</code> - - All [tables](#Table) which this table has relationship of type `one to many`.  

| Param | Type | Description |
| --- | --- | --- |
| [callback] | <code>orderedTableCallback</code> | Callback to be executed for each [table](#Table). |

<a name="Table+getBelongsToManyTables"></a>
### table.getBelongsToManyTables([callback]) ⇒ <code>Array.&lt;Column&gt;</code> &#124; <code>undefined</code> &#124; <code>null</code>
Retrieves all [tables](#Table) which this table has relationship of type `many to many`, executes given callback and returns null if provided.
Callback has a signature of ([Table](#Table), index, collection). If no callback is provided, returns an array of all [tables](#Table).

**Kind**: instance method of <code>[Table](#Table)</code>  
**Returns**: <code>Array.&lt;Column&gt;</code> &#124; <code>undefined</code> &#124; <code>null</code> - - All [tables](#Table) which this table has relationship of type `many to many`.  

| Param | Type | Description |
| --- | --- | --- |
| [callback] | <code>orderedTableCallback</code> | Callback to be executed for each [table](#Table). |

<a name="Table+getM2MRelations"></a>
### table.getM2MRelations([callback]) ⇒ <code>Array.&lt;M2MRelation&gt;</code> &#124; <code>undefined</code> &#124; <code>null</code>
List of [many to many relationships](M2MRelation) of the table. [M2MRelation](M2MRelation) resembles
`has many through` and `belongs to many` relations in ORMs has some useful methods and information for generating ORM classes.

**Kind**: instance method of <code>[Table](#Table)</code>  
**Returns**: <code>Array.&lt;M2MRelation&gt;</code> &#124; <code>undefined</code> &#124; <code>null</code> - - [M2M Relations](M2MRelation) of the table.  

| Param | Type | Description |
| --- | --- | --- |
| [callback] | <code>orderedRelationCallback</code> | Callback to be executed for each [many to many relation](M2MRelation). |

<a name="Table+getO2MRelations"></a>
### table.getO2MRelations([callback]) ⇒ <code>Array.&lt;O2MRelation&gt;</code> &#124; <code>undefined</code> &#124; <code>null</code>
List of [one to many relationships](O2MRelation) of the table. [O2MRelation](O2MRelation) resembles
`has many` relations in ORMs and has some useful methods and information for generating ORM classes.

**Kind**: instance method of <code>[Table](#Table)</code>  
**Returns**: <code>Array.&lt;O2MRelation&gt;</code> &#124; <code>undefined</code> &#124; <code>null</code> - - [O2M Relations](O2MRelation) of the table.  

| Param | Type | Description |
| --- | --- | --- |
| [callback] | <code>orderedRelationCallback</code> | Callback to be executed for each [one to many relation](O2MRelation). |

<a name="Table+getM2ORelations"></a>
### table.getM2ORelations([callback]) ⇒ <code>Array.&lt;M2ORelation&gt;</code> &#124; <code>undefined</code> &#124; <code>null</code>
List of [many to one relationships](M2ORelation) of the table. [M2ORelation](M2ORelation) resembles
`belongs to` relations in ORMs and has some useful methods and information for generating ORM classes.

**Kind**: instance method of <code>[Table](#Table)</code>  
**Returns**: <code>Array.&lt;M2ORelation&gt;</code> &#124; <code>undefined</code> &#124; <code>null</code> - - [M2O Relations](M2ORelation) of the table.  

| Param | Type | Description |
| --- | --- | --- |
| [callback] | <code>orderedRelationCallback</code> | Callback to be executed for each [many to one relation](M2ORelation). |

<a name="Table+getIndexes"></a>
### table.getIndexes([callback]) ⇒ <code>Array.&lt;Index&gt;</code> &#124; <code>undefined</code> &#124; <code>null</code>
Executes callback for every [Index](Index) or returns list of [indexes](Index), which this table has.
Results are ordered by index name.

**Kind**: instance method of <code>[Table](#Table)</code>  
**Returns**: <code>Array.&lt;Index&gt;</code> &#124; <code>undefined</code> &#124; <code>null</code> - - [indexes](Index) this table has.  

| Param | Type | Description |
| --- | --- | --- |
| [callback] | <code>orderedIndexCallback</code> | Callback to be executed for each [Index](Index). |

