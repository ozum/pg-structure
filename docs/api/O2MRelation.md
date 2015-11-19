<a name="O2MRelation"></a>
## O2MRelation ⇐ <code>Relation</code>
**Kind**: global class  
**Extends:** <code>Relation</code>  

* [O2MRelation](#O2MRelation) ⇐ <code>Relation</code>
  * [new O2MRelation()](#new_O2MRelation_new)
  * [.type](#O2MRelation+type) : <code>relationType</code>
  * [.sourceTable](#O2MRelation+sourceTable) : <code>Table</code>
  * [.targetTable](#O2MRelation+targetTable) : <code>Table</code>
  * [.constraint](#O2MRelation+constraint) : <code>Table</code>

<a name="new_O2MRelation_new"></a>
### new O2MRelation()
Class which represent many to one relationship which resembles `hasMany` relation in ORMs (Object Relational Mappers).
Provides attributes and methods for details of the relationship.

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

Some definitions used in descriptions for [O2MRelation](#O2MRelation).
* ** Source Table: ** Table which this relationship belongs to.
* ** Target Table: ** Table that is related to base table.

**Example**  
```js
// Example tables have single primary key and examples first relation. So zero index ([0]) is used. Use all array elements if necessary.
// product ----< line_item
// (source)       (target)

let relation         = product.o2mRelations[0];              // RELATION:    product ---< line_item
let constraint       = relation.constraint;                  // CONSTRAINT:           ^-- product_has_carts
let sourceTable      = relation.sourceTable;                 // TABLE:       product
let targetTable      = relation.targetTable;                 // TABLE:       line_item
let FKColumn         = relation.constraint.columns[0];       // COLUMN:      product_id  (from line_item table)
let sourcePKColumn   = relation.sourceTable.primaryKeys[0];  // COLUMN:      id          (from product table)
```
<a name="O2MRelation+type"></a>
### o2MRelation.type : <code>relationType</code>
Type of relation. One of `ONE TO MANY` or `MANY TO MANY`.

**Kind**: instance property of <code>[O2MRelation](#O2MRelation)</code>  
**Read only**: true  
<a name="O2MRelation+sourceTable"></a>
### o2MRelation.sourceTable : <code>Table</code>
[Table](Table) which this relation belongs to.

**Kind**: instance property of <code>[O2MRelation](#O2MRelation)</code>  
**Read only**: true  
**Example**  
```js
let relation     = product.O2MRelationRelations[0];  // RELATION:    product ---< line_item
let sourceTable  = relation.sourceTable;             // TABLE:       product
```
<a name="O2MRelation+targetTable"></a>
### o2MRelation.targetTable : <code>Table</code>
[Table](Table) which this relation is referring to.

**Kind**: instance property of <code>[O2MRelation](#O2MRelation)</code>  
**Read only**: true  
**Example**  
```js
let relation     = product.O2MRelationRelations[0];  // RELATION:    product ---< line_item
let targetTable  = relation.targetTable;             // TABLE:       line_item
```
<a name="O2MRelation+constraint"></a>
### o2MRelation.constraint : <code>Table</code>
Foreign key [constraint](Constraint) between [source table](#O2MRelation+sourceTable) and [target table](#O2MRelation+targetTable).

**Kind**: instance property of <code>[O2MRelation](#O2MRelation)</code>  
**Read only**: true  
**Example**  
```js
let relation     = product.O2MRelationRelations[0];  // RELATION:    product ---< line_item
let constraint   = relation.constraint;              // CONSTRAINT:           ^-- product_has_carts
let FKColumn     = relation.constraint.columns[0];   // COLUMN:      product_id (from line_item table)
```
