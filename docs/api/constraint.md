<a name="Constraint"></a>
## Constraint
Class which represent a constraint. Provides attributes and methods for details of the constraint.

#### Notes for Through Constraints <span id="notes"></span>
Through constraints are used for many to many relationships. Actually there isn't such a thing called
**many to many relationship** or **through constraint** in the database engine. They are concepts to describe
records which may be related more than one record on both sides. For example an invoice may contain more than product and
a product may related to more than one invoice. Those relationships are solved a so called many to many **join table**.

Constraint class supports many to many relationships. Since those constraints are not present in database engine,
they are extracted by estimation/interpretation. Many non-join tables in a database could have more than one
foreign key constraints, and they may not meant to be join tables, but they have still through relationships .

<span id="exampleSchema"></span>Below is a database schema as an example:
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

Product table has 3 foreign key constraints. It is obvious that product table is not meant to be a many to many join table.
However product could have been join table for `size & vendor`, `color & vendor` and `size & color`. As a result size,
color and vendor tables would have many to many `through constraints`.

**Kind**: global class  

* [Constraint](#Constraint)
  * [new Constraint(args)](#new_Constraint_new)
  * [.name](#Constraint+name) : <code>string</code>
  * [.fullName](#Constraint+fullName) : <code>string</code>
  * [.fullCatalogName](#Constraint+fullCatalogName) : <code>string</code>
  * [.type](#Constraint+type) : <code>contsraintType</code>
  * [.child](#Constraint+child) : <code>Table</code>
  * [.table](#Constraint+table) : <code>Table</code>
  * [.db](#Constraint+db) : <code>DB</code>
  * [.schema](#Constraint+schema) : <code>Schema</code>
  * [.onUpdate](#Constraint+onUpdate) : <code>constraintRule</code> &#124; <code>null</code>
  * [.onDelete](#Constraint+onDelete) : <code>constraintRule</code> &#124; <code>null</code>
  * [.referencedTable](#Constraint+referencedTable) : <code>Table</code> &#124; <code>null</code>
  * [.parent](#Constraint+parent) : <code>Table</code> &#124; <code>null</code>
  * [.columns](#Constraint+columns) : <code>Array.&lt;Column&gt;</code>
  * [.columnsByName](#Constraint+columnsByName) : <code>Object.&lt;string, Column&gt;</code>

<a name="new_Constraint_new"></a>
### new Constraint(args)

| Param | Type | Description |
| --- | --- | --- |
| args | <code>Object</code> | Constraint arguments. |
| args.registry | <code>Loki</code> | Loki.js database object. |
| args.attributes | <code>Object</code> | Attributes of the [Constraint](#Constraint) instance. |

<a name="Constraint+name"></a>
### constraint.name : <code>string</code>
Name of the constraint.

**Kind**: instance property of <code>[Constraint](#Constraint)</code>  
**Read only**: true  
<a name="Constraint+fullName"></a>
### constraint.fullName : <code>string</code>
Full name of the [constraint](#Constraint) with (.) notation.

**Kind**: instance property of <code>[Constraint](#Constraint)</code>  
**Read only**: true  
**Example**  
```js
var fullName = constraint.fullName; // crm.public
```
<a name="Constraint+fullCatalogName"></a>
### constraint.fullCatalogName : <code>string</code>
Full name of the [constraint](#Constraint) with (.) notation including catalog name.

**Kind**: instance property of <code>[Constraint](#Constraint)</code>  
**Read only**: true  
**Example**  
```js
var fullCatalogName = constraint.fullCatalogName; // crm.public
```
<a name="Constraint+type"></a>
### constraint.type : <code>contsraintType</code>
Constraint type. One of `PRIMARY KEY`, `FOREIGN KEY` or `CHECK`

**Kind**: instance property of <code>[Constraint](#Constraint)</code>  
**Read only**: true  
<a name="Constraint+child"></a>
### constraint.child : <code>Table</code>
Child [table](Table) of this [constraint](#Constraint).
**Note for foreign key constraints:** Child table is the table which contains foreign key.
In [example schema](#exampleSchema) product is a child table (vendor_id FK) of vendor table.

**Kind**: instance property of <code>[Constraint](#Constraint)</code>  
**Read only**: true  
**Example**  
```js
var table = constraint.child;
```
<a name="Constraint+table"></a>
### constraint.table : <code>Table</code>
[Table](Table) which this [constraint](#Constraint) belongs to or defined in. <br>
**Note for foreign key constraints:** As usual PostgreSQL defines foreign key constraints in child tables,
where foreign key column is defined, so this is child table for foreign key constraints.

**Kind**: instance property of <code>[Constraint](#Constraint)</code>  
**Read only**: true  
**Example**  
```js
var table = constraint.table;
```
<a name="Constraint+db"></a>
### constraint.db : <code>DB</code>
[DB](DB) this [constraint](#Constraint) belongs to.

**Kind**: instance property of <code>[Constraint](#Constraint)</code>  
**Read only**: true  
<a name="Constraint+schema"></a>
### constraint.schema : <code>Schema</code>
[Schema](Schema) this [constraint](#Constraint) belongs to.

**Kind**: instance property of <code>[Constraint](#Constraint)</code>  
**Read only**: true  
<a name="Constraint+onUpdate"></a>
### constraint.onUpdate : <code>constraintRule</code> &#124; <code>null</code>
Update rule for foreign key [constraints](#Constraint). One of `CASCADE`, `SET NULL`, `SET DEFAULT`, `RESTRICT`, `NO ACTION`
If this is not a foreign key [constraint](#Constraint) this is `null`.

**Kind**: instance property of <code>[Constraint](#Constraint)</code>  
**Read only**: true  
<a name="Constraint+onDelete"></a>
### constraint.onDelete : <code>constraintRule</code> &#124; <code>null</code>
Update rule for foreign key [constraints](#Constraint). One of `CASCADE`, `SET NULL`, `SET DEFAULT`, `RESTRICT`, `NO ACTION`
If this is not a foreign key [constraint](#Constraint) this is `null`.

**Kind**: instance property of <code>[Constraint](#Constraint)</code>  
**Read only**: true  
<a name="Constraint+referencedTable"></a>
### constraint.referencedTable : <code>Table</code> &#124; <code>null</code>
For foreign key [constraints](#Constraint) this is [Table](Table) instance this [constraint](#Constraint) refers to.
If this is not a foreign key [constraint](#Constraint) this is `null`.

**Kind**: instance property of <code>[Constraint](#Constraint)</code>  
**Read only**: true  
**See**: Aliases [parent](#Constraint+parent)  
<a name="Constraint+parent"></a>
### constraint.parent : <code>Table</code> &#124; <code>null</code>
For foreign key [constraints](#Constraint) this is [Table](Table) instance this [constraint](#Constraint) refers to.
If this is not a foreign key [constraint](#Constraint) this is `null`. <br>
**Please Note:** This is not the [Table](Table) this constraint belongs to or defined in. Parent applies only to
foreign key constraints and for foreign key constraints parent means referenced table not the table it is defined in.

**Kind**: instance property of <code>[Constraint](#Constraint)</code>  
**Read only**: true  
**See**

- Aliases [referencedTable](#Constraint+referencedTable)
- To get [Table](Table) this constraint belongs to or defined in, use [table](#Constraint+table).

<a name="Constraint+columns"></a>
### constraint.columns : <code>Array.&lt;Column&gt;</code>
List of [columns](Column) restricted by [constraint](#Constraint), in order their ordinal position
within the constraint key. If [constraint](#Constraint) does not have any [columns](Column) this is `null`.

**Kind**: instance property of <code>[Constraint](#Constraint)</code>  
**Read only**: true  
<a name="Constraint+columnsByName"></a>
### constraint.columnsByName : <code>Object.&lt;string, Column&gt;</code>
List of columns restricted by [constraint](#Constraint), in order their ordinal position within the constraint key.
If [constraint](#Constraint) does not have any columns this is `null`.

**Kind**: instance property of <code>[Constraint](#Constraint)</code>  
**Read only**: true  
