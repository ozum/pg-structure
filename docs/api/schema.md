<a name="Schema"></a>

## Schema
Class which represent a PostgreSQL schema. Provides attributes and methods for details of the database.

**Kind**: global class  

* [Schema](#Schema)
    * [new Schema(args)](#new_Schema_new)
    * [.name](#Schema+name) : <code>string</code>
    * [.fullName](#Schema+fullName) : <code>string</code>
    * [.fullCatalogName](#Schema+fullCatalogName) : <code>string</code>
    * [.db](#Schema+db) : <code>Db</code>
    * [.parent](#Schema+parent) : <code>Db</code>
    * [.comment](#Schema+comment) : <code>string</code>
    * [.description](#Schema+description) : <code>string</code>
    * [.tables](#Schema+tables) : <code>Map.&lt;Table&gt;</code>
    * [.types](#Schema+types) : <code>Map.&lt;Type&gt;</code>
    * [.get(path)](#Schema+get) ⇒ <code>Table</code> \| <code>Column</code> \| <code>undefined</code>

<a name="new_Schema_new"></a>

### new Schema(args)
Constructor function. You don't need to call constructor manually. pg-structure handles this.


| Param | Type | Description |
| --- | --- | --- |
| args | <code>Object</code> | Attributes of the [Schema](#Schema) instance to be created. |
| args.parent | <code>Db</code> | Parent [Db](Db) of the Schema. |
| args.name | <code>string</code> | Name of the Schema. |
| args.description | <code>string</code> | Description of the Schema. |

<a name="Schema+name"></a>

### schema.name : <code>string</code>
Name of the schema.

**Kind**: instance property of [<code>Schema</code>](#Schema)  
**Read only**: true  
<a name="Schema+fullName"></a>

### schema.fullName : <code>string</code>
Full name of the [Schema](#Schema). For schema it is equal to schema name.

**Kind**: instance property of [<code>Schema</code>](#Schema)  
**Read only**: true  
**Example**  
```js
var fullName = schema.fullName; // public
```
<a name="Schema+fullCatalogName"></a>

### schema.fullCatalogName : <code>string</code>
Full name of the [Schema](#Schema) with (.) notation including catalog name.

**Kind**: instance property of [<code>Schema</code>](#Schema)  
**Read only**: true  
**Example**  
```js
var fullCatalogName = schema.fullCatalogName; // crm.public
```
<a name="Schema+db"></a>

### schema.db : <code>Db</code>
[Db](Db) this schema belongs to.

**Kind**: instance property of [<code>Schema</code>](#Schema)  
**Read only**: true  
**See**: Aliases [parent](#Schema+parent)  
**Example**  
```js
var db = schema.db; // Db instance
```
<a name="Schema+parent"></a>

### schema.parent : <code>Db</code>
[Db](Db) this schema belongs to.

**Kind**: instance property of [<code>Schema</code>](#Schema)  
**Read only**: true  
**See**: Aliases [db](#Schema+db)  
**Example**  
```js
var db = schema.parent; // Db instance
```
<a name="Schema+comment"></a>

### schema.comment : <code>string</code>
Comment of the schema.

**Kind**: instance property of [<code>Schema</code>](#Schema)  
**Read only**: true  
**See**: Aliases [description](#Schema+description)  
<a name="Schema+description"></a>

### schema.description : <code>string</code>
Comment of the schema.

**Kind**: instance property of [<code>Schema</code>](#Schema)  
**Read only**: true  
**See**: Aliases [comment](#Schema+comment)  
<a name="Schema+tables"></a>

### schema.tables : <code>Map.&lt;Table&gt;</code>
All [Table](Table) instances of the schema as a [Map](Map). They are ordered by their name.

**Kind**: instance property of [<code>Schema</code>](#Schema)  
**Read only**: true  
**See**: [Map](Map)  
**Example**  
```js
let isAvailable  = schema.tables.has('person');
let tableNames   = Array.from(schema.tables.keys());        // Use spread operator to get table names as an array.
let table        = schema.tables.get('account');
let name         = table.name;

for (let table of schema.tables.values()) {
    console.log(table.name);
}

for (let [name, table] of schema.tables) {
    console.log(name, table.name);
}
```
<a name="Schema+types"></a>

### schema.types : <code>Map.&lt;Type&gt;</code>
All [Type](Type) instances of the schema as a [Map](Map). They are ordered by their name.

**Kind**: instance property of [<code>Schema</code>](#Schema)  
**Read only**: true  
**See**: [Map](Map)  
**Example**  
```js
let isAvailable  = schema.types.has('address');
let typeNames    = Array.from(schema.types.keys());        // Use spread operator to get table names as an array.
let type         = schema.types.get('address');
let columns         = type.columns;
```
<a name="Schema+get"></a>

### schema.get(path) ⇒ <code>Table</code> \| <code>Column</code> \| <code>undefined</code>
Returns [Table](Table) or [Column](Column) on given path relative to [Schema](#Schema). Path should be in dot (.) notation.

**Kind**: instance method of [<code>Schema</code>](#Schema)  
**Returns**: <code>Table</code> \| <code>Column</code> \| <code>undefined</code> - - Requested item.  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | Path of the requested item in dot (.) notation such as 'public.contact' |

**Example**  
```js
var table  = db.get('contact'),      // Returns contact table in public schema.
    column = db.get('contact.name'); // Returns name column of the contact table.
```
