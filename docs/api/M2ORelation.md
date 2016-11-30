<a name="M2ORelation"></a>

## M2ORelation
**Kind**: global class  

* [M2ORelation](#M2ORelation)
    * [new M2ORelation(args)](#new_M2ORelation_new)
    * [.type](#M2ORelation+type) : <code>relationType</code>
    * [.sourceTable](#M2ORelation+sourceTable) : <code>Table</code>
    * [.targetTable](#M2ORelation+targetTable) : <code>Table</code>
    * [.constraint](#M2ORelation+constraint) : <code>Table</code>
    * [.generateName([strategy])](#M2ORelation+generateName) ⇒ <code>string</code>

<a name="new_M2ORelation_new"></a>

### new M2ORelation(args)
Class which represent many to one relationship which resembles `belongsTo` relation in ORMs (Object Relational Mappers).
Provides attributes and methods for details of the relationship.

Actually there is no many to one relation in database engine. It is basically one to many relation in reverse direction.

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

Some definitions used in descriptions for [M2ORelation](#M2ORelation).
* ** Source Table: ** Table which this relationship belongs to.
* ** Target Table: ** Table that is related to base table.


| Param | Type | Description |
| --- | --- | --- |
| args | <code>Object</code> | Attributes of the [M2ORelation](#M2ORelation) instance to be created. |
| args.sourceTable | <code>Table</code> | Source [Table](Table) which this relation belongs to. |
| args.targetTable | <code>Table</code> | Target [Table](Table) which this relation is referring to. |
| args.constraint | <code>Constraint</code> | Foreign key constraint between source table and target table. |
| args.namingStrategy | <code>string</code> | Naming strategy to be used. |

**Example**  
```js
// Example tables have single primary key and examples first relation. So zero index ([0]) is used. Use all array elements if necessary.
// line_item >---- product
// (source)        (target)

let relation     = line_item.m2oRelations[0];            // RELATION:    line_item >---- product
let constraint   = relation.constraint;                  // CONSTRAINT:               ^-- product_has_carts
let sourceTable  = relation.sourceTable;                 // TABLE:       line_item
let targetTable  = relation.targetTable;                 // TABLE:       product
let FKColumn     = relation.constraint.columns[0];       // COLUMN:      product_id  (from line_item table)
let PKColumn     = relation.targetTable.primaryKeys[0];  // COLUMN:      id          (from product table)
```
<a name="M2ORelation+type"></a>

### m2ORelation.type : <code>relationType</code>
Type of relation which is `MANY TO ONE`.

**Kind**: instance property of <code>[M2ORelation](#M2ORelation)</code>  
**Read only**: true  
<a name="M2ORelation+sourceTable"></a>

### m2ORelation.sourceTable : <code>Table</code>
[Table](Table) which this relation belongs to.

**Kind**: instance property of <code>[M2ORelation](#M2ORelation)</code>  
**Read only**: true  
**Example**  
```js
let relation     = product.M2ORelationRelations[0];  // RELATION:    line_item >---- product
let sourceTable  = relation.sourceTable;             // TABLE:       line_item
```
<a name="M2ORelation+targetTable"></a>

### m2ORelation.targetTable : <code>Table</code>
[Table](Table) which this relation is referred by.

**Kind**: instance property of <code>[M2ORelation](#M2ORelation)</code>  
**Read only**: true  
**Example**  
```js
let relation     = product.M2ORelationRelations[0];  // RELATION:    line_item >---- product
let targetTable  = relation.targetTable;             // TABLE:       product
```
<a name="M2ORelation+constraint"></a>

### m2ORelation.constraint : <code>Table</code>
Foreign key [constraint](Constraint) between [source table](#M2ORelation+sourceTable) and [target table](#M2ORelation+targetTable).

**Kind**: instance property of <code>[M2ORelation](#M2ORelation)</code>  
**Read only**: true  
**Example**  
```js
let relation     = product.M2ORelationRelations[0];  // RELATION:    line_item >---- product
let constraint   = relation.constraint;              // CONSTRAINT:               ^-- product_has_carts
let FKColumn     = relation.constraint.columns[0];   // COLUMN:      product_id (from line_item table)
```
<a name="M2ORelation+generateName"></a>

### m2ORelation.generateName([strategy]) ⇒ <code>string</code>
(! EXPERIMENTAL) Returns name for relation using given strategy. Please see [Relation Names](../relation-names.md) for details.

**Kind**: instance method of <code>[M2ORelation](#M2ORelation)</code>  
**Returns**: <code>string</code> - - Relation name.  
**See**: [Relation Names](../relation-names.md)  

| Param | Type | Description |
| --- | --- | --- |
| [strategy] | <code>string</code> | (simple, complex) Naming strategy to use. |

