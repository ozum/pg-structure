<a name="Type"></a>

## Type
Class which represent a PostgreSQL composite type. Provides attributes and methods for details of the database.

**Kind**: global class  

* [Type](#Type)
    * [new Type(args)](#new_Type_new)
    * [.name](#Type+name) : <code>string</code>
    * [.fullName](#Type+fullName) : <code>string</code>
    * [.fullCatalogName](#Type+fullCatalogName) : <code>string</code>
    * [.db](#Type+db) : <code>Db</code>
    * [.parent](#Type+parent) : <code>Db</code>
    * [.comment](#Type+comment) : <code>string</code>
    * [.description](#Type+description) : <code>string</code>
    * [.columns](#Type+columns) : <code>Map.&lt;Column&gt;</code>
    * [.get(path)](#Type+get) ⇒ <code>Column</code> \| <code>undefined</code>

<a name="new_Type_new"></a>

### new Type(args)
Constructor function. You don't need to call constructor manually. pg-structure handles this.


| Param | Type | Description |
| --- | --- | --- |
| args | <code>Object</code> | Attributes of the [Type](#Type) instance to be created. |
| args.parent | <code>Db</code> | Parent [Db](Db) of the Type. |
| args.name | <code>string</code> | Name of the Type. |
| args.description | <code>string</code> | Description of the type. |

<a name="Type+name"></a>

### type.name : <code>string</code>
Name of the type.

**Kind**: instance property of [<code>Type</code>](#Type)  
**Read only**: true  
<a name="Type+fullName"></a>

### type.fullName : <code>string</code>
Full name of the [Type](#Type).

**Kind**: instance property of [<code>Type</code>](#Type)  
**Read only**: true  
**Example**  
```js
var fullName = type.fullName; // public.my_custom_type
```
<a name="Type+fullCatalogName"></a>

### type.fullCatalogName : <code>string</code>
Full name of the [Type](#Type) with (.) notation including catalog name.

**Kind**: instance property of [<code>Type</code>](#Type)  
**Read only**: true  
**Example**  
```js
var fullCatalogName = type.fullCatalogName; // crm.public.my_custom_type
```
<a name="Type+db"></a>

### type.db : <code>Db</code>
[Db](Db) this type belongs to.

**Kind**: instance property of [<code>Type</code>](#Type)  
**Read only**: true  
**See**: Aliases [parent](#Type+parent)  
**Example**  
```js
var db = type.db; // Db instance
```
<a name="Type+parent"></a>

### type.schema : <code>Schema</code>
[Schema](Schema) the schema this type belongs to.

**Kind**: instance property of [<code>Type</code>](#Type)  
**Read only**: true  
**See**: Aliases [schema](#Type+parent)  
**Example**  
```js
var schema = type.parent; // Schema instance
```
<a name="Type+parent"></a>

### type.parent : <code>Schema</code>
[Schema](Schema) the schema this type belongs to.

**Kind**: instance property of [<code>Type</code>](#Type)  
**Read only**: true  
**See**: Aliases [schema](#Type+schema)  
**Example**  
```js
var schema = type.parent; // Schema instance
```
<a name="Type+comment"></a>

### type.comment : <code>string</code>
Comment of the type.

**Kind**: instance property of [<code>Type</code>](#Type)  
**Read only**: true  
**See**: Aliases [description](#Type+description)  
<a name="Type+description"></a>

### type.description : <code>string</code>
Comment of the type.

**Kind**: instance property of [<code>Type</code>](#Type)  
**Read only**: true  
**See**: Aliases [comment](#Type+comment)  
<a name="Type+columns"></a>

### type.columns : <code>Map.&lt;Column&gt;</code>
All [Column](Column) instances of the type as a [Map](Map). They are ordered by their name.

**Kind**: instance property of [<code>Type</code>](#Type)  
**Read only**: true  
**See**: [Map](Map)  
**Example**  
```js
let isAvailable  = type.columns.has('person');
let typeNames   = Array.from(type.columns.keys());        // Use spread operator to get type names as an array.
let type        = type.columns.get('account');
let name         = type.name;

for (let type of type.columns.values()) {
    console.log(type.name);
}

for (let [name, type] of type.columns) {
    console.log(name, type.name);
}
```
<a name="Type+get"></a>

### type.get(path) ⇒ <code>Column</code> \| <code>undefined</code>
Returns [Column](Column) on given path relative to [Type](#Type). Path should be in dot (.) notation.

**Kind**: instance method of [<code>Type</code>](#Type)  
**Returns**: <code>Column</code> \| <code>undefined</code> - - Requested item.  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | Path of the requested item in dot (.) notation such as 'public.contact' |

**Example**  
```js
var table  = type.get('company_id')
```
