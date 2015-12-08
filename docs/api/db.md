<a name="DB"></a>
## DB
Class which represent a database. Provides attributes and methods for details of the database.

**Kind**: global class  

* [DB](#DB)
  * [new DB(args)](#new_DB_new)
  * [.name](#DB+name) : <code>string</code>
  * [.fullName](#DB+fullName) : <code>string</code>
  * [.fullCatalogName](#DB+fullCatalogName) : <code>string</code>
  * [.schemas](#DB+schemas) : <code>Array.&lt;Schema&gt;</code>
  * [.schemasByName](#DB+schemasByName) : <code>Object.&lt;string, Schema&gt;</code>
  * [.getSchema(key)](#DB+getSchema) ⇒ <code>Schema</code> &#124; <code>undefined</code>
  * [.schemaExists(name)](#DB+schemaExists) ⇒ <code>boolean</code>
  * [.get(path)](#DB+get) ⇒ <code>Schema</code> &#124; <code>Table</code> &#124; <code>Column</code> &#124; <code>undefined</code>

<a name="new_DB_new"></a>
### new DB(args)

| Param | Type | Description |
| --- | --- | --- |
| args | <code>Object</code> | Database arguments. |
| args.registry | <code>Loki</code> | Loki.js database object. |
| args.attributes | <code>Object</code> | Attributes of the [DB](#DB) instance. |

<a name="DB+name"></a>
### dB.name : <code>string</code>
Name of the [Database](Database).

**Kind**: instance property of <code>[DB](#DB)</code>  
**Read only**: true  
<a name="DB+fullName"></a>
### dB.fullName : <code>string</code>
Full name of the [Database](Database) with (.) notation. Since database does not have a parent this equals database name.

**Kind**: instance property of <code>[DB](#DB)</code>  
**Read only**: true  
<a name="DB+fullCatalogName"></a>
### dB.fullCatalogName : <code>string</code>
Full name of the [Database](Database) with (.) notation including catalog name. Since database does not have a parent this equals database name.

**Kind**: instance property of <code>[DB](#DB)</code>  
**Read only**: true  
<a name="DB+schemas"></a>
### dB.schemas : <code>Array.&lt;Schema&gt;</code>
All [Schema](Schema) instances in the database as an array. They are ordered by schema name.

**Kind**: instance property of <code>[DB](#DB)</code>  
**Read only**: true  
**Example**  
```js
var schemas = db.schemas;
var name    = schemas[0].name;
```
<a name="DB+schemasByName"></a>
### dB.schemasByName : <code>Object.&lt;string, Schema&gt;</code>
All [Schema](Schema) instances in the database as a simple object. Keys are schema names, values are [Schema](Schema) instances.

**Kind**: instance property of <code>[DB](#DB)</code>  
**Read only**: true  
**Example**  
```js
var schemas = db.schemasByName;
var public  = schemas.public;
```
<a name="DB+getSchema"></a>
### dB.getSchema(key) ⇒ <code>Schema</code> &#124; <code>undefined</code>
Returns [Schema](Schema) instance with given name or order.

**Kind**: instance method of <code>[DB](#DB)</code>  
**Returns**: <code>Schema</code> &#124; <code>undefined</code> - - Requested [Schema](Schema) instance.  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> &#124; <code>number</code> | Name or order number of the schema. |

**Example**  
```js
var schema = db.getSchema('public');
```
<a name="DB+schemaExists"></a>
### dB.schemaExists(name) ⇒ <code>boolean</code>
Returns true if [Schema](Schema) instance with given name or order number exists.

**Kind**: instance method of <code>[DB](#DB)</code>  
**Returns**: <code>boolean</code> - - `true` if schema exists in database, otherwise `false`.  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> &#124; <code>number</code> | Name or order number of the schema. |

**Example**  
```js
var publicExists = db.schemaExists('public'); // true
var otherExists  = db.schemaExists('other');  // false
```
<a name="DB+get"></a>
### dB.get(path) ⇒ <code>Schema</code> &#124; <code>Table</code> &#124; <code>Column</code> &#124; <code>undefined</code>
Returns [Schema](Schema), [Table](Table) or [Column](Column) on given path relative to [DB](#DB). Path should be in dot (.) notation.

**Kind**: instance method of <code>[DB](#DB)</code>  
**Returns**: <code>Schema</code> &#124; <code>Table</code> &#124; <code>Column</code> &#124; <code>undefined</code> - - Requested item.  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | Path of the requested item in dot (.) notation such as 'public.contact' |

**Example**  
```js
var schema = db.get('public'),              // Returns public schema.
    table  = db.get('public.contact'),      // Returns contact table in public schema.
    column = db.get('public.contact.name'); // Returns name column of the contact table in public schema.
```
