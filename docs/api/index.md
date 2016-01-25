<a name="Index"></a>
## Index
Class which represent a database index. Provides attributes and methods for details of the index.

**Kind**: global class  

* [Index](#Index)
    * [new Index(args)](#new_Index_new)
    * [.name](#Index+name) : <code>string</code>
    * [.fullName](#Index+fullName) : <code>string</code>
    * [.fullCatalogName](#Index+fullCatalogName) : <code>string</code>
    * [.isUnique](#Index+isUnique) : <code>boolean</code>
    * [.isPrimaryKey](#Index+isPrimaryKey) : <code>boolean</code>
    * [.table](#Index+table) : <code>Table</code>
    * [.parent](#Index+parent) : <code>Table</code>
    * [.db](#Index+db) : <code>DB</code>
    * [.schema](#Index+schema) : <code>Schema</code>
    * [.columns](#Index+columns) : <code>Array.&lt;Column&gt;</code>
    * [.columnsByName](#Index+columnsByName) : <code>Object.&lt;string, Column&gt;</code>

<a name="new_Index_new"></a>
### new Index(args)
Constructor function. You don't need to call constructor manually. pg-structure handles this.


| Param | Type | Description |
| --- | --- | --- |
| args | <code>Object</code> | Attributes of the [Index](#Index) instance to be created. |
| args.name | <code>string</code> | Name of the Index. |
| args.isUnique | <code>string</code> | Is it a unique index. |
| args.isPrimaryKey | <code>string</code> | Is it a primary key index. |
| args.parent | <code>Table</code> | Parent [Table](Table) of the Index. |

<a name="Index+name"></a>
### index.name : <code>string</code>
Name of the index.

**Kind**: instance property of <code>[Index](#Index)</code>  
**Read only**: true  
<a name="Index+fullName"></a>
### index.fullName : <code>string</code>
Full name of the [index](#Index) with (.) notation.

**Kind**: instance property of <code>[Index](#Index)</code>  
**Read only**: true  
**Example**  
```js
var fullName = index.fullName; // crm.public
```
<a name="Index+fullCatalogName"></a>
### index.fullCatalogName : <code>string</code>
Full name of the [index](#Index) with (.) notation including catalog name.

**Kind**: instance property of <code>[Index](#Index)</code>  
**Read only**: true  
**Example**  
```js
var fullCatalogName = index.fullCatalogName; // crm.public
```
<a name="Index+isUnique"></a>
### index.isUnique : <code>boolean</code>
If true, this is a unique index.

**Kind**: instance property of <code>[Index](#Index)</code>  
**Read only**: true  
<a name="Index+isPrimaryKey"></a>
### index.isPrimaryKey : <code>boolean</code>
If true, this index represents the primary key of the table ([isUnique](#Index+isUnique) is always true for primary keys.)

**Kind**: instance property of <code>[Index](#Index)</code>  
**Read only**: true  
<a name="Index+table"></a>
### index.table : <code>Table</code>
[Table](Table) which this [index](#Index) belongs to.

**Kind**: instance property of <code>[Index](#Index)</code>  
**Read only**: true  
<a name="Index+parent"></a>
### index.parent : <code>Table</code>
[Table](Table) which this [index](#Index) belongs to.

**Kind**: instance property of <code>[Index](#Index)</code>  
**Read only**: true  
<a name="Index+db"></a>
### index.db : <code>DB</code>
[DB](DB) this [index](#Index) belongs to.

**Kind**: instance property of <code>[Index](#Index)</code>  
**Read only**: true  
<a name="Index+schema"></a>
### index.schema : <code>Schema</code>
[Schema](Schema) this [index](#Index) belongs to.

**Kind**: instance property of <code>[Index](#Index)</code>  
**Read only**: true  
<a name="Index+columns"></a>
### index.columns : <code>Array.&lt;Column&gt;</code>
List of [columns](Column) restricted by [index](#Index), in order their ordinal position
within the index key. If [index](#Index) does not have any [columns](Column) this is `null`.

**Kind**: instance property of <code>[Index](#Index)</code>  
**Read only**: true  
<a name="Index+columnsByName"></a>
### index.columnsByName : <code>Object.&lt;string, Column&gt;</code>
List of columns restricted by [index](#Index), in order their ordinal position within the index key.
If [index](#Index) does not have any columns this is `null`.

**Kind**: instance property of <code>[Index](#Index)</code>  
**Read only**: true  
