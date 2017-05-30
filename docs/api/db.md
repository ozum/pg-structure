<a name="Db"></a>

## Db
Class which represent a database. Provides attributes and methods for details of the database.

**Kind**: global class  

* [Db](#Db)
    * [new Db(args, options)](#new_Db_new)
    * [.name](#Db+name) : <code>string</code>
    * [.fullName](#Db+fullName) : <code>string</code>
    * [.fullCatalogName](#Db+fullCatalogName) : <code>string</code>
    * [.options](#Db+options) : <code>Object</code>
    * [.schemas](#Db+schemas) : <code>Map.&lt;Schema&gt;</code>
    * [.get(path)](#Db+get) ⇒ <code>Schema</code> \| <code>Table</code> \| <code>Column</code> \| <code>undefined</code>

<a name="new_Db_new"></a>

### new Db(args, options)
Constructor function. You don't need to call constructor manually. pg-structure handles this.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| args | <code>Object</code> |  | Attributes of the [Database](Database) instance to be created. |
| args.name | <code>Object</code> |  | Name of the [Db](#Db) instance. |
| options | <code>Object</code> |  | Options to modify behaviour of classes. |
| [options.cache] | <code>boolean</code> | <code>true</code> | Use cache to memoize calculated results. |

<a name="Db+name"></a>

### db.name : <code>string</code>
Name of the [Database](Database).

**Kind**: instance property of [<code>Db</code>](#Db)  
**Read only**: true  
<a name="Db+fullName"></a>

### db.fullName : <code>string</code>
Full name of the [Database](Database) with (.) notation. Since database does not have a parent this equals database name.

**Kind**: instance property of [<code>Db</code>](#Db)  
**Read only**: true  
<a name="Db+fullCatalogName"></a>

### db.fullCatalogName : <code>string</code>
Full name of the [Database](Database) with (.) notation including catalog name. Since database does not have a parent this equals database name.

**Kind**: instance property of [<code>Db</code>](#Db)  
**Read only**: true  
<a name="Db+options"></a>

### db.options : <code>Object</code>
Options passed to during initialization.

**Kind**: instance property of [<code>Db</code>](#Db)  
**Read only**: true  
<a name="Db+schemas"></a>

### db.schemas : <code>Map.&lt;Schema&gt;</code>
All [Schema](Schema) instances in the database as a [Map](Map). Schemas are ordered by their name.

**Kind**: instance property of [<code>Db</code>](#Db)  
**Read only**: true  
**See**: [Map](Map)  
**Example**  
```js
let isAvailable  = db.schemas.has('another_schema');
let schemaNames  = Array.from(db.schemas.keys());           // Use spread operator to get schema names as an array.
let public       = db.schemas.get('public');
let name         = public.name;

for (let schema of db.schemas.values()) {
    console.log(schema.name);
}

for (let [name, schema] of db.schemas) {
    console.log(name, schema.name);
}
```
<a name="Db+get"></a>

### db.get(path) ⇒ <code>Schema</code> \| <code>Table</code> \| <code>Column</code> \| <code>undefined</code>
Returns [Schema](Schema), [Table](Table) or [Column](Column) on given path relative to [Db](#Db). Path should be in dot (.) notation.

**Kind**: instance method of [<code>Db</code>](#Db)  
**Returns**: <code>Schema</code> \| <code>Table</code> \| <code>Column</code> \| <code>undefined</code> - - Requested item.  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | Path of the requested item in dot (.) notation such as 'public.contact' |

**Example**  
```js
var schema = db.get('public'),              // Returns public schema.
    table  = db.get('public.contact'),      // Returns contact table in public schema.
    column = db.get('public.contact.name'); // Returns name column of the contact table in public schema.
```
