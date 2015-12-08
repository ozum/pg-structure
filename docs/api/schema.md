<a name="Schema"></a>
## Schema
Class which represent a PostgreSQL schema. Provides attributes and methods for details of the database.

**Kind**: global class  

* [Schema](#Schema)
  * [new Schema(args)](#new_Schema_new)
  * [.name](#Schema+name) : <code>string</code>
  * [.fullName](#Schema+fullName) : <code>string</code>
  * [.fullCatalogName](#Schema+fullCatalogName) : <code>string</code>
  * [.db](#Schema+db) : <code>DB</code>
  * [.parent](#Schema+parent) : <code>DB</code>
  * [.tables](#Schema+tables) : <code>Array.&lt;Table&gt;</code>
  * [.getTable(key)](#Schema+getTable) ⇒ <code>Table</code> &#124; <code>undefined</code>
  * [.tableExists(name)](#Schema+tableExists) ⇒ <code>boolean</code>
  * [.get(path)](#Schema+get) ⇒ <code>Table</code> &#124; <code>Column</code> &#124; <code>undefined</code>

<a name="new_Schema_new"></a>
### new Schema(args)

| Param | Type | Description |
| --- | --- | --- |
| args | <code>Object</code> | Database arguments. |
| args.registry | <code>Loki</code> | Loki.js object to get database details. |
| args.attributes | <code>Object</code> | Attributes of the [Schema](#Schema) instance. |

<a name="Schema+name"></a>
### schema.name : <code>string</code>
Name of the schema.

**Kind**: instance property of <code>[Schema](#Schema)</code>  
**Read only**: true  
<a name="Schema+fullName"></a>
### schema.fullName : <code>string</code>
Full name of the [Schema](#Schema) with (.) notation.

**Kind**: instance property of <code>[Schema](#Schema)</code>  
**Read only**: true  
**Example**  
```js
var fullName = schema.fullName; // crm.public
```
<a name="Schema+fullCatalogName"></a>
### schema.fullCatalogName : <code>string</code>
Full name of the [Schema](#Schema) with (.) notation including catalog name.

**Kind**: instance property of <code>[Schema](#Schema)</code>  
**Read only**: true  
**Example**  
```js
var fullCatalogName = schema.fullCatalogName; // crm.public
```
<a name="Schema+db"></a>
### schema.db : <code>DB</code>
[DB](DB) this schema belongs to.

**Kind**: instance property of <code>[Schema](#Schema)</code>  
**Read only**: true  
**See**: Aliases [parent](#Schema+parent)  
**Example**  
```js
var db = schema.db; // DB instance
```
<a name="Schema+parent"></a>
### schema.parent : <code>DB</code>
[DB](DB) this schema belongs to.

**Kind**: instance property of <code>[Schema](#Schema)</code>  
**Read only**: true  
**See**: Aliases [db](#Schema+db)  
**Example**  
```js
var db = schema.parent; // DB instance
```
<a name="Schema+tables"></a>
### schema.tables : <code>Array.&lt;Table&gt;</code>
All [Table](Table) instances in the database as an array. They are ordered by same order they are added.

**Kind**: instance property of <code>[Schema](#Schema)</code>  
**Read only**: true  
**Example**  
```js
var tables = schema.tables;
var name   = tables[0].name;
```
<a name="Schema+getTable"></a>
### schema.getTable(key) ⇒ <code>Table</code> &#124; <code>undefined</code>
Returns [Table](Table) instance with given name or order.

**Kind**: instance method of <code>[Schema](#Schema)</code>  
**Returns**: <code>Table</code> &#124; <code>undefined</code> - - Requested [Table](Table) instance.  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> &#124; <code>number</code> | Name or order number of the table. |

**Example**  
```js
var table = schema.getTable('account');
```
<a name="Schema+tableExists"></a>
### schema.tableExists(name) ⇒ <code>boolean</code>
Returns true if [Table](Table) instance with given name or order number exists.

**Kind**: instance method of <code>[Schema](#Schema)</code>  
**Returns**: <code>boolean</code> - - `true` if table exists in schema, otherwise `false`  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> &#124; <code>number</code> | Name or order number of the table. |

**Example**  
```js
var accountExists = db.TableExists('account'); // true
var cakeExists    = db.TableExists('cake');  // false
```
<a name="Schema+get"></a>
### schema.get(path) ⇒ <code>Table</code> &#124; <code>Column</code> &#124; <code>undefined</code>
Returns [Table](Table) or [Column](Column) on given path relative to [Schema](#Schema). Path should be in dot (.) notation.

**Kind**: instance method of <code>[Schema](#Schema)</code>  
**Returns**: <code>Table</code> &#124; <code>Column</code> &#124; <code>undefined</code> - - Requested item.  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | Path of the requested item in dot (.) notation such as 'public.contact' |

**Example**  
```js
var table  = db.get('contact'),      // Returns contact table in public schema.
    column = db.get('contact.name'); // Returns name column of the contact table.
```
