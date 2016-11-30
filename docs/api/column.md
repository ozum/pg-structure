<a name="Column"></a>

## Column
**Kind**: global class  

* [Column](#Column)
    * [new Column(args)](#new_Column_new)
    * [.allowNull](#Column+allowNull) : <code>boolean</code>
    * [.arrayDimension](#Column+arrayDimension) : <code>number</code>
    * [.arrayType](#Column+arrayType) : <code>string</code> &#124; <code>null</code>
    * [.comment](#Column+comment) : <code>string</code> &#124; <code>null</code>
    * [.commentData](#Column+commentData) : <code>Object</code>
    * [.db](#Column+db) : <code>DB</code>
    * [.default](#Column+default) : <code>string</code> &#124; <code>null</code>
    * [.defaultWithTypeCast](#Column+defaultWithTypeCast) : <code>string</code> &#124; <code>null</code>
    * [.description](#Column+description) : <code>string</code> &#124; <code>null</code>
    * [.descriptionData](#Column+descriptionData) : <code>Object</code>
    * [.domainName](#Column+domainName) : <code>string</code> &#124; <code>null</code>
    * [.domainFullName](#Column+domainFullName) : <code>string</code> &#124; <code>null</code>
    * [.domainFullCatalogName](#Column+domainFullCatalogName) : <code>string</code> &#124; <code>null</code>
    * [.domainSchema](#Column+domainSchema) : <code>string</code> &#124; <code>null</code>
    * [.enumLabels](#Column+enumLabels) : <code>Array.&lt;string&gt;</code> &#124; <code>null</code>
    * [.enumValues](#Column+enumValues) : <code>Array.&lt;string&gt;</code> &#124; <code>null</code>
    * [.foreignKeyConstraints](#Column+foreignKeyConstraints) : <code>Map.&lt;Constraint&gt;</code>
    * [.fullName](#Column+fullName) : <code>string</code>
    * [.fullCatalogName](#Column+fullCatalogName) : <code>string</code>
    * [.indexes](#Column+indexes) : <code>Map.&lt;Index&gt;</code>
    * [.isAutoIncrement](#Column+isAutoIncrement) : <code>boolean</code>
    * [.isSerial](#Column+isSerial) : <code>boolean</code>
    * [.isForeignKey](#Column+isForeignKey) : <code>boolean</code>
    * [.isPrimaryKey](#Column+isPrimaryKey) : <code>boolean</code>
    * [.length](#Column+length) : <code>number</code> &#124; <code>null</code>
    * [.name](#Column+name) : <code>string</code>
    * [.notNull](#Column+notNull) : <code>boolean</code>
    * [.parent](#Column+parent) : <code>Table</code>
    * [.precision](#Column+precision) : <code>number</code> &#124; <code>null</code>
    * [.referencedColumns](#Column+referencedColumns) : <code>[Set.&lt;Column&gt;](#Column)</code>
    * [.scale](#Column+scale) : <code>number</code> &#124; <code>null</code>
    * [.schema](#Column+schema) : <code>Schema</code>
    * [.type](#Column+type) : <code>postgreSQLDataType</code>
    * [.table](#Column+table) : <code>Table</code>
    * [.userDefinedType](#Column+userDefinedType) : <code>postgreSQLDataType</code> &#124; <code>null</code>
    * [.uniqueIndexesNoPk](#Column+uniqueIndexesNoPk) : <code>Map.&lt;Index&gt;</code>
    * [.uniqueIndexes](#Column+uniqueIndexes) : <code>Map.&lt;Index&gt;</code>

<a name="new_Column_new"></a>

### new Column(args)
Constructor function. You don't need to call constructor manually. pg-structure handles this.

**Returns**: <code>[Column](#Column)</code> - - [Column](#Column) instance.  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>Object</code> | Attributes of the [Column](#Column) instance to be created. |

<a name="Column+allowNull"></a>

### column.allowNull : <code>boolean</code>
`true` if column is allowed to contain null values; otherwise `false`.

**Kind**: instance property of <code>[Column](#Column)</code>  
**Read only**: true  
**See**: [notNull](#Column+notNull).  
<a name="Column+arrayDimension"></a>

### column.arrayDimension : <code>number</code>
Number of dimensions, if the column is an array type; otherwise 0.

**Kind**: instance property of <code>[Column](#Column)</code>  
**Read only**: true  
<a name="Column+arrayType"></a>

### column.arrayType : <code>string</code> &#124; <code>null</code>
If this column is an array, data type of the array. If column is not an array equals `null`.

**Kind**: instance property of <code>[Column](#Column)</code>  
**Read only**: true  
<a name="Column+comment"></a>

### column.comment : <code>string</code> &#124; <code>null</code>
Comment about column.

**Kind**: instance property of <code>[Column](#Column)</code>  
**Read only**: true  
**See**: Aliases [description](#Column+description)  
<a name="Column+commentData"></a>

### column.commentData : <code>Object</code>
JS Object extracted from column description. Object is expected as JSON data between `[JSON]` and `[/JSON]`
tags in description. Tags are case-insensitive.

**Kind**: instance property of <code>[Column](#Column)</code>  
**Read only**: true  
**See**: Aliases [descriptionData](#Column+descriptionData)  
**Example**  
```js
let description = column.comment;            // -> 'This column holds name of account. [JSON]{ "extraData": 2 }[/PGEN]'
let extra = column.commentData;              // -> { extraData: 2 }
console.log(column.commentData.extraData);   // -> 2
```
<a name="Column+db"></a>

### column.db : <code>DB</code>
[DB](DB) this table belongs to.

**Kind**: instance property of <code>[Column](#Column)</code>  
**Read only**: true  
<a name="Column+default"></a>

### column.default : <code>string</code> &#124; <code>null</code>
Default value of the column without typecast. Default values includes single quotes except sql functions and numeric values.

**Kind**: instance property of <code>[Column](#Column)</code>  
**Read only**: true  
**See**: [defaultWithTypeCast](#Column+defaultWithTypeCast) for default values with typecast as returned by PostgreSQL  
**Example**  
```js
var column = db('crm').schema('public').table('contact').column('name');
var type = column.default;           // "'George'"
type = age.default;                  // 20
type = created_at.default;           // "now()"
type = column.defaultWithTypeCast;   // "'George'::character varying"
```
<a name="Column+defaultWithTypeCast"></a>

### column.defaultWithTypeCast : <code>string</code> &#124; <code>null</code>
Default expression of the column with typecast. PostgreSQL returns default values with typecast.
Default values includes single quotes except sql functions and numeric values. Also sql functions and numeric values
do not contain type cast.

**Kind**: instance property of <code>[Column](#Column)</code>  
**Read only**: true  
**See**: [default](#Column+default) for accessing default values without typecast.  
**Example**  
```js
var column = db('crm').schema('public').table('contact').column('name');
var type = column.defaultWithTypeCast;   // "'George'::character varying"
type = age.defaultWithTypeCast;          // 20
type = created_at.defaultWithTypeCast;   // "now()"
type = column.default;                   // "'George'"
```
<a name="Column+description"></a>

### column.description : <code>string</code> &#124; <code>null</code>
Comment about column.

**Kind**: instance property of <code>[Column](#Column)</code>  
**Read only**: true  
**See**: Aliases [comment](#Column+comment)  
<a name="Column+descriptionData"></a>

### column.descriptionData : <code>Object</code>
JS Object extracted from column description. Object is expected as JSON data between `[JSON]` and `[/JSON]`
tags in description. Tags are case-insensitive.

**Kind**: instance property of <code>[Column](#Column)</code>  
**Read only**: true  
**See**: Aliases [commentData](#Column+commentData)  
**Example**  
```js
let description = column.description;            // -> 'This column holds name of account. [JSON]{ "extraData": 2 }[/PGEN]'
let extra = column.descriptionData;              // -> { extraData: 2 }
console.log(column.descriptionData.extraData);   // -> 2
```
<a name="Column+domainName"></a>

### column.domainName : <code>string</code> &#124; <code>null</code>
If column data type is a domain, this equals domain name without domain schema. Otherwise null.

**Kind**: instance property of <code>[Column](#Column)</code>  
**Read only**: true  
**See**: [domainFullName](#Column+domainFullName) [domainFullCatalogName](#Column+domainFullCatalogName).  
**Example**  
```js
var domainName = column.domainName; // i.e. 'phone_number'
```
<a name="Column+domainFullName"></a>

### column.domainFullName : <code>string</code> &#124; <code>null</code>
If column data type is a domain, this equals domain name including domain schema. Otherwise null.

**Kind**: instance property of <code>[Column](#Column)</code>  
**Read only**: true  
**See**: [domainName](#Column+domainName).  
**Example**  
```js
var domainName = column.domainFullName; // i.e. 'public.phone_number'
```
<a name="Column+domainFullCatalogName"></a>

### column.domainFullCatalogName : <code>string</code> &#124; <code>null</code>
If column data type is a domain, this equals domain name including domain schema. Otherwise null.

**Kind**: instance property of <code>[Column](#Column)</code>  
**Read only**: true  
**See**: [domainName](#Column+domainName).  
**Example**  
```js
var domainName = column.domainFullName; // i.e. 'public.phone_number'
```
<a name="Column+domainSchema"></a>

### column.domainSchema : <code>string</code> &#124; <code>null</code>
If column data type is a domain, this equals domain schema name. Otherwise null.

**Kind**: instance property of <code>[Column](#Column)</code>  
**Read only**: true  
**See**: [domainFullName](#Column+domainFullName).  
**Example**  
```js
var domainName = column.domainSchema; // i.e. 'public'
```
<a name="Column+enumLabels"></a>

### column.enumLabels : <code>Array.&lt;string&gt;</code> &#124; <code>null</code>
Array of the textual labels for enum values column may contain. If column is not an enum, then this
equals `undefined`

**Kind**: instance property of <code>[Column](#Column)</code>  
**Read only**: true  
**See**: Aliases [enumValues](#Column+enumValues)  
<a name="Column+enumValues"></a>

### column.enumValues : <code>Array.&lt;string&gt;</code> &#124; <code>null</code>
Array of the textual labels for enum values column may contain. If column is not an enum, then this
equals `undefined`

**Kind**: instance property of <code>[Column](#Column)</code>  
**Read only**: true  
**See**: Aliases [enumLabels](#Column+enumLabels)  
<a name="Column+foreignKeyConstraints"></a>

### column.foreignKeyConstraints : <code>Map.&lt;Constraint&gt;</code>
[Map](Map) of foreign key constraints of the column, if column is part of one or more foreign key constraint.

**Kind**: instance property of <code>[Column](#Column)</code>  
**Read only**: true  
<a name="Column+fullName"></a>

### column.fullName : <code>string</code>
Full name of the [Column](#Column) with (.) notation.

**Kind**: instance property of <code>[Column](#Column)</code>  
**Read only**: true  
**Example**  
```js
var fullName = column.fullName; // public.account.id
```
<a name="Column+fullCatalogName"></a>

### column.fullCatalogName : <code>string</code>
Full name of the [Column](#Column) with (.) notation including catalog name.

**Kind**: instance property of <code>[Column](#Column)</code>  
**Read only**: true  
**Example**  
```js
var fullName = table.fullCatalogName; // crm.public.account.id
```
<a name="Column+indexes"></a>

### column.indexes : <code>Map.&lt;Index&gt;</code>
[Map](Map) of [indexes](Index), which column is part of.

**Kind**: instance property of <code>[Column](#Column)</code>  
**Read only**: true  
<a name="Column+isAutoIncrement"></a>

### column.isAutoIncrement : <code>boolean</code>
`true` if this column has an auto incremented (`nextval()`) default value or defined one of `serial`
types.

**Kind**: instance property of <code>[Column](#Column)</code>  
**Read only**: true  
**See**: Aliases [isSerial](#Column+isSerial)  
<a name="Column+isSerial"></a>

### column.isSerial : <code>boolean</code>
`true` if this column has an auto incremented (`nextval()`) default value or defined one of `serial`
types.

**Kind**: instance property of <code>[Column](#Column)</code>  
**Read only**: true  
**See**: Aliases [isAutoIncrement](#Column+isAutoIncrement)  
<a name="Column+isForeignKey"></a>

### column.isForeignKey : <code>boolean</code>
`true` if this column is a foreign key or part of a foreign key constraint; otherwise `false`.
Please note that a foreign key may contain more than one column.

**Kind**: instance property of <code>[Column](#Column)</code>  
**Read only**: true  
<a name="Column+isPrimaryKey"></a>

### column.isPrimaryKey : <code>boolean</code>
`true` if this column is a primary key or part of a primary key constraint; otherwise `false`.
Please note that a primary key may contain more than one column.

**Kind**: instance property of <code>[Column](#Column)</code>  
**Read only**: true  
<a name="Column+length"></a>

### column.length : <code>number</code> &#124; <code>null</code>
Length of the column.
* For data type identified as a character or bit string type, this is the declared
maximum length. If column is an array, same rule applies data type of the array.
* For character arrays or bit string type arrays, this is the declared maximum length of the array's data type.
* For arrays atttypmod records type-specific data supplied at table creation time (for example, the maximum length
of a varchar column). It is passed to type-specific input functions and length coercion functions.
* This value is `undefined` for all other data types or if no maximum length was declared.

**Kind**: instance property of <code>[Column](#Column)</code>  
**Read only**: true  
<a name="Column+name"></a>

### column.name : <code>string</code>
Name of the column.

**Kind**: instance property of <code>[Column](#Column)</code>  
**Read only**: true  
<a name="Column+notNull"></a>

### column.notNull : <code>boolean</code>
`true` if column is **not allowed** to contain null values; otherwise `false`.

**Kind**: instance property of <code>[Column](#Column)</code>  
**Read only**: true  
**See**: [allowNull](#Column+allowNull)  
<a name="Column+parent"></a>

### column.parent : <code>Table</code>
[Table](Table) this column belongs to.

**Kind**: instance property of <code>[Column](#Column)</code>  
**Read only**: true  
**See**: Aliases [table](#Column+table)  
**Example**  
```js
var table = column.parent; // Table instance
```
<a name="Column+precision"></a>

### column.precision : <code>number</code> &#124; <code>null</code>
* If data type identifies a numeric type, this contains the (declared or implicit) precision of
the type for this column. The precision indicates the number of significant digits.
* If data type identifies a date, time, timestamp, or interval type, this column contains the (declared or implicit)
fractional seconds precision of the type for this attribute, that is, the number of decimal digits maintained
following the decimal point in the seconds value.
* If data type is an array. Same rules apply for the data type of the array, and this value would become precision
of the data type of the array.
* For all other data types, this is `undefined`.

**Kind**: instance property of <code>[Column](#Column)</code>  
**Read only**: true  
<a name="Column+referencedColumns"></a>

### column.referencedColumns : <code>[Set.&lt;Column&gt;](#Column)</code>
All referenced columns in all foreign key constraints by this column.

**Kind**: instance property of <code>[Column](#Column)</code>  
**Read only**: true  
<a name="Column+scale"></a>

### column.scale : <code>number</code> &#124; <code>null</code>
* If data type identifies an exact numeric type, this contains the (declared or implicit) scale
of the type for this attribute. The scale indicates the number of significant digits to the right of the decimal point.
* If data type is an array. Same rule applies for the data type of the array, and this value would become scale
of the data type of the array.
* For all other data types, this is `undefined`.

**Kind**: instance property of <code>[Column](#Column)</code>  
**Read only**: true  
<a name="Column+schema"></a>

### column.schema : <code>Schema</code>
[Schema](Schema) this column belongs to.

**Kind**: instance property of <code>[Column](#Column)</code>  
**Read only**: true  
<a name="Column+type"></a>

### column.type : <code>postgreSQLDataType</code>
Data type of the column.
* For built-in types this is name of type.
* `ARRAY`, for arrays, and type of array can be found via [arrayType](#Column+arrayType).
* `USER-DEFINED` for user defined types, and type of it can be found via [userDefinedType](#Column+userDefinedType).
* For domain types this is not domain name, but underlying base type of that domain. Use [domainName](#Column+domainName) or [domainFullName](#Column+domainFullName)

**Kind**: instance property of <code>[Column](#Column)</code>  
**Read only**: true  
**See**

- [userDefinedType](#Column+userDefinedType)
- [domainName](#Column+domainName) and [domainFullName](#Column+domainFullName)

<a name="Column+table"></a>

### column.table : <code>Table</code>
[Table](Table) this column belongs to.

**Kind**: instance property of <code>[Column](#Column)</code>  
**Read only**: true  
**See**: Aliases [parent](#Column+parent)  
**Example**  
```js
var table = column.table; // Table instance
```
<a name="Column+userDefinedType"></a>

### column.userDefinedType : <code>postgreSQLDataType</code> &#124; <code>null</code>
If type of column is user defined such as composite, enumerated, this is the data type of the underlying type.

**Kind**: instance property of <code>[Column](#Column)</code>  
**Read only**: true  
<a name="Column+uniqueIndexesNoPk"></a>

### column.uniqueIndexesNoPk : <code>Map.&lt;Index&gt;</code>
[Map](Map) of unique [indexes](Index), which column is part of. Excludes primary key indexes. PostgreSQL already creates a unique index for unique
[constraints](Constraint). So there is no need to look for unique constraints which will result duplicates.

**Kind**: instance property of <code>[Column](#Column)</code>  
**Read only**: true  
**See**: [uniqueIndexes](#Column+uniqueIndexes) for all unique indexes including primary key indexes.  
<a name="Column+uniqueIndexes"></a>

### column.uniqueIndexes : <code>Map.&lt;Index&gt;</code>
[Map](Map) of unique [indexes](Index), which column is part of. PostgreSQL already creates a unique index for unique
[constraints](Constraint). So there is no need to look for unique constraints which will result duplicates.

**Kind**: instance property of <code>[Column](#Column)</code>  
**Read only**: true  
**See**: [uniqueIndexesNoPK](#Column+uniqueIndexesNoPk) for unique indexes excluding primary key indexes.  
