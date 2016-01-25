# Database Schema

![Database Schema](../../images/schema-through.png)

Examples are based on a sample database schema above. 

## Examples

### Get Tables as a {@link Map}

```js
var tablesArray  = db.get('public').tables;         // Map { size => Table {}, color => Table {}, line_item => Table {} ... }
```

### Get Columns
```js
var columnsArray  = [...db.get('public.product').columns.values()];  // [ id {}, name {}, color_id {} ... ]
for (let column of db.get('public.product').columns.values()) {
    console.log(column.name);
}
```

### Get Primary Keys
```js
var pkArray  = db.get('public.product').primaryKeyColumns; // Map { ... }
```

### Get Foreign Key Columns

To get all foreign key columns of all foreign key constraints in a table:

```js
var fkMap  = db.get('public.product').foreignKeyColumns; // Map { color_id => Column {}, vendor_id => Column {}  }
```

To get foreign key columns of a specific constraint:

```js
var fkMap  = db.get('public.product').foreignKeyConstraints.get('vendor_has_products').columns; // Map { vendor_id => Column {} }
```

### One to Many Relation

```js
var  relation         = [...product.o2mRelations.values()][0];              // RELATION:    product ---< line_item
var  constraint       = relation.constraint;                                // CONSTRAINT:           ^-- product_has_carts
var  sourceTable      = relation.sourceTable;                               // TABLE:       product
var  targetTable      = relation.targetTable;                               // TABLE:       line_item
var  FKColumn         = [...relation.constraint.columns.values()][0];       // COLUMN:      product_id  (from line_item table)
var  sourcePKColumn   = [...relation.sourceTable.primaryKeys.values()][0];  // COLUMN:      id          (from product table)
```

### Many to Many Relation

```js
var relation             = [...product.m2mRelations.values()][0];               // RELATION:    product ---< line_item >--- cart
var sourceConstraint     = relation.sourceConstraint;                           // CONSTRAINT:           ^-- product_has_carts
var targetConstraint     = relation.targetConstraint;                           // CONSTRAINT:       cart_has_products --^
var sourceTable          = relation.sourceTable;                                // TABLE:       product
var targetTable          = relation.targetTable;                                // TABLE:       cart
var sourceJoinFKColumn   = [...relation.sourceConstraint.columns.values()][0];  // COLUMN:      product_id  (from line_item table)
var targetJoinFKColumn   = [...relation.targetConstraint.columns.values()][0];  // COLUMN:      cart_id     (from line_item table)
var sourcePKColumn       = [...relation.sourceTable.primaryKeys.values()][0];   // COLUMN:      id          (from product table)
var targetPKColumn       = [...relation.targetTable.primaryKeys.values()][0];   // COLUMN:      id          (from cart table)
```

### Many to One Relation

```js
var  relation     = [...line_item.m2oRelations.values()][0];            // RELATION:    line_item >---- product
var  constraint   = relation.constraint;                                // CONSTRAINT:               ^-- product_has_carts
var  sourceTable  = relation.sourceTable;                               // TABLE:       line_item
var  targetTable  = relation.targetTable;                               // TABLE:       product
var  FKColumn     = [...relation.constraint.columns.values()][0];       // COLUMN:      product_id  (from line_item table)
var  PKColumn     = [...relation.targetTable.primaryKeys.values()][0];  // COLUMN:      id          (from product table)
```
