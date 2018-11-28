<a name="Type"></a>

## Type
Class which represent a custom PostgreSQL type. Provides attributes and methods for details of the type.

**Kind**: global class  

* [Type](#Type)
    * [new Type(args)](#new_Type_new)
    * [.name](#Type+name) : <code>string</code>
    * [.fullName](#Type+fullName) : <code>string</code>
    * [.fullCatalogName](#Type+fullCatalogName) : <code>string</code>
    * [.schema](#Type+schema) : <code>Schema</code>
    * [.parent](#Type+parent) : <code>Db</code>
    * [.db](#Type+db) : <code>Db</code>
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
| args.parent | <code>Schema</code> | Parent [Schema](Schema) of the Type. |
| args.name | <code>string</code> | Name of the Type. |
| args.description | <code>string</code> | Description of the Type. |

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
var fullName = type.fullName; // public
```
<a name="Type+fullCatalogName"></a>

### type.fullCatalogName : <code>string</code>
Full name of the [Type](#Type) with (.) notation including catalog name.

**Kind**: instance property of [<code>Type</code>](#Type)  
**Read only**: true  
**Example**  
```js
var fullCatalogName = schema.fullCatalogName; // crm.public
```
<a name="Type+schema"></a>

### type.schema : <code>Schema</code>
[Schema](Schema) this type belongs to.

**Kind**: instance property of [<code>Type</code>](#Type)  
**Read only**: true  
**See**: Aliases [parent](#Type+parent)  
**Example**  
```js
var schema = type.schema; // Schema instance
```
<a name="Type+parent"></a>

### type.parent : <code>Db</code>
[Db](Db) this schema belongs to.

**Kind**: instance property of [<code>Type</code>](#Type)  
**Read only**: true  
**See**: Aliases [schema](#Type+schema)  
**Example**  
```js
var db = type.parent; // Schema instance
```
<a name="Type+db"></a>

### type.db : <code>Db</code>
[Db](Db) this type belongs to.

**Kind**: instance property of [<code>Type</code>](#Type)  
**Read only**: true  
<a name="Type+comment"></a>

### type.comment : <code>string</code>
Comment of the type.

**Kind**: instance property of [<code>Type</code>](#Type)  
**Read only**: true  
**See**: Aliases [description](#Type+description)  
<a name="Type+description"></a>

### type.description : <code>string</code>
Comment of the schema.

**Kind**: instance property of [<code>Type</code>](#Type)  
**Read only**: true  
**See**: Aliases [comment](#Type+comment)  
<a name="Type+columns"></a>

### type.columns : <code>Map.&lt;Column&gt;</code>
All [Column](Column) instances in the type as a [Map](Map). They are ordered same order as they are
defined in database type.

**Kind**: instance property of [<code>Type</code>](#Type)  
**Read only**: true  
**See**: [Map](Map)  
**Example**  
```js
var isAvailable  = type.columns.has('foo');
var column       = type.columns.get('user_id');
var name         = column.name;

for (let column of type.columns.values()) {
    console.log(column.name);
}

for (let [name, column] of type.columns) {
    console.log(name, column.name);
}
```
<a name="Type+get"></a>

### type.get(path) ⇒ <code>Column</code> \| <code>undefined</code>
Returns [Column](Column) on given path relative to [Type](#Type).

**Kind**: instance method of [<code>Type</code>](#Type)  
**Returns**: <code>Column</code> \| <code>undefined</code> - - Requested item.  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | Path of the requested item in dot (.) notation such as 'public.contact' |

**Example**  
```js
var column = type.get('contact'),      // Returns contact column of the type.
```
