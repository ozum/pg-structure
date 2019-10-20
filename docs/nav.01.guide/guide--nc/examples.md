# Examples

![Database Schema](/images/schema-through.png)

Examples are based on a sample database schema above.

## Connection

```ts
const db = await pgStructure(
  {
    database: "db",
    user: "user",
    password: "password",
  },
  {
    includeSchemas: ["public"],
  }
);
```

### Get Tables Array

```ts
const tables = db.get("public").tables;
```

### Get Columns

```ts
const columns = db.get("product").columns;
columns.forEach(c => {
  console.log(c.name);
});
```

### Get Primary Key & Columns

```ts
const pk = db.get("product").primaryKey;
const pkColumns = pk.columns; // A primary key may have more than one columns (composite key)
```

### Get Foreign Keys

```ts
const fks = db.get("product").foreignKeys; // A table may have more than one foreign keys.
fks.forEach(fk => {
  // A foreign key may have more than one columns (composite key)
  const fkColumns = fk.columns;
});
```

To get foreign key columns of a specific constraint:

```ts
const fkMap = db.get("product").foreignKeys.get("product_color").columns;
```

### One to Many Relation

```ts
const relation = product.o2mRelations[0]; // RELATION: product ---< line_item
const constraint = relation.foreignKey; // CONSTRAINT:          ^-- line_item_product
const sourceTable = relation.sourceTable; // TABLE: product
const targetTable = relation.targetTable; // TABLE: line_item
const aFKColumn = relation.foreignKey.columns[0]; // COLUMN: product_id (from line_item table)
const sourcePKColumn = relation.sourceTable.primaryKeys[0]; // COLUMN: id (from product table)
```

### Many to Many Relation

```ts
const relation = product.m2mRelations[0]; // RELATION:      product ---< line_item >--- cart
const sourceConstraint = relation.foreignKey; // CONSTRAINT:         ^-- line_item_product
const targetConstraint = relation.targetForeignKey; // CONSTRAINT: line_item_cart --^
const sourceTable = relation.sourceTable; // TABLE: product
const targetTable = relation.targetTable; // TABLE: cart
const sourceJoinFKColumn = relation.foreignKey.columns[0]; // COLUMN: product_id (from line_item table)
const targetJoinFKColumn = relation.targetForeignKey.columns[0]; // COLUMN:cart_id (from line_item table)
const sourcePKColumn = relation.sourceTable.primaryKey.columns[0]; // COLUMN: id (from product table)
const targetPKColumn = relation.targetTable.primaryKey.columns[0]; // COLUMN: id (from cart table)
```

### Many to One Relation

```ts
const relation = line_item.m2oRelations[0]; // RELATION: line_item >---- product
const constraint = relation.constraint; // CONSTRAINT:               ^-- product_has_carts
const sourceTable = relation.sourceTable; // TABLE: line_item
const targetTable = relation.targetTable; // TABLE: product
const FKColumn = relation.foreignKey.columns[0]; // COLUMN: product_id (from line_item table)
const PKColumn = relation.targetTable.primaryKey.columns[0]; // COLUMN: id (from product table)
```
