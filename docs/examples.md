# Database Schema

![Database Schema](../../images/schema-through.png)

Examples are based on a sample database schema above. 

## Examples

### Get Tables

```js
var tablesArray  = db.get('public').tables;         // [ size {}, color {}, line_item {} ... ]
var tablesObject = db.get('public').tablesByName;   // { size: {}, color: {}, line_item: {} ... }
```

### Get Columns
```js
var columnsArray  = db.get('public.product').columns;         // [ id {}, name {}, color_id {} ... ]
var columnsObject = db.get('public.product').columnsByName;   // { id: {}, name: {}, color_id: {} ... }
```

### Get Primary Keys
```js
var pkArray  = db.get('public.product').primaryKeyColumns;         // [ id {} ]
var pkObject = db.get('public.product').primaryKeyColumnsByName;   // { id: {} }
```

### Get Foreign Key Columns

To get all foreign key columns of all foreign key constraint in a table:

```js
var fkArray  = db.get('public.product').foreignKeyColumns;         // [ color_id {}, vendor_id {}, size_id {} ]
var fkObject = db.get('public.product').foreignKeyColumnsByName;   // { color_id: {}, vendor_id: {}, size_id: {} }
```

To get foreign key columns of a specific constraint:

```js
var fkArray  = db.get('public.product').foreignKeyConstraintsByName.vendor_has_products.columns; // [ vendor_id {} ]
```

### One to Many Relation

```js
var  relation         = product.o2mRelations[0];              // RELATION:    product ---< line_item
var  constraint       = relation.constraint;                  // CONSTRAINT:           ^-- product_has_carts
var  sourceTable      = relation.sourceTable;                 // TABLE:       product
var  targetTable      = relation.targetTable;                 // TABLE:       line_item
var  FKColumn         = relation.constraint.columns[0];       // COLUMN:      product_id  (from line_item table)
var  sourcePKColumn   = relation.sourceTable.primaryKeys[0];  // COLUMN:      id          (from product table)
```

### Many to Many Relation

```js
var relation             = product.m2mRelations[0];              // RELATION:    product ---< line_item >--- cart
var sourceConstraint     = relation.sourceConstraint;            // CONSTRAINT:           ^-- product_has_carts
var targetConstraint     = relation.targetConstraint;            // CONSTRAINT:       cart_has_products --^
var sourceTable          = relation.sourceTable;                 // TABLE:       product
var targetTable          = relation.targetTable;                 // TABLE:       cart
var sourceJoinFKColumn   = relation.sourceConstraint.columns[0]; // COLUMN:      product_id  (from line_item table)
var targetJoinFKColumn   = relation.targetConstraint.columns[0]; // COLUMN:      cart_id     (from line_item table)
var sourcePKColumn       = relation.sourceTable.primaryKeys[0];  // COLUMN:      id          (from product table)
var targetPKColumn       = relation.targetTable.primaryKeys[0];  // COLUMN:      id          (from cart table)
```

### Many to One Relation

```js
var  relation     = line_item.m2oRelations[0];            // RELATION:    line_item >---- product
var  constraint   = relation.constraint;                  // CONSTRAINT:               ^-- product_has_carts
var  sourceTable  = relation.sourceTable;                 // TABLE:       line_item
var  targetTable  = relation.targetTable;                 // TABLE:       product
var  FKColumn     = relation.constraint.columns[0];       // COLUMN:      product_id  (from line_item table)
var  PKColumn     = relation.targetTable.primaryKeys[0];  // COLUMN:      id          (from product table)
```
