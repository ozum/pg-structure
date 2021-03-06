# Relation Names

Relations are defined using foreign keys. `pg-structure` provides classes for [one to many](/nav.02.api/classes/o2mrelation), [many to one](/nav.02.api/classes/m2orelation) and [many to many](/nav.02.api/classes/m2mrelation) relations.

Whereas foreign keys are defined in DBMS and have names, relations are not present actually in DBMS and therefore they do not have names defined in the database system. As a result relation names have to be generated. Naming involves personal preferences, and `pg-structure` lets developers define their relation naming functions using custom modules.

<span id="exampleSchema"></span>Below is the database schema used in examples:

![Database Schema](/images/relation_names_schema.svg)

## Builtin Naming Modules

`pg-structure` provides some built-in modules: `short`, `optimal` and `descriptive`. They use foreign key names, join table names, and target table names to generate relation names.

### Foreign Key Names

To use built-in functions effectively, foreign keys should be named as one of the below schemes (examples are for `product` and `vendor` tables.)

- **Tables:** table1_table2 (i.e. `product_vendor` or `vendor_products`)
- **Tables & Optional Adjectives:** adjective_table1_adjective_table2 (i.e. `product_alternative_vendor`, `alternative_vendor_products` or `alternative_vendor_primary_products`)
- **Separator:** source,target or target,source (i.e. `item,supplier`, `supplier,items` or `item,alternative_supplier` )

Built-in functions are developed based on long experience in PostgreSQL, but they **do not guarantee** to produce unique names in all possible scenarios. `optimal`, `descriptive` function has less chance to cause name collisions compared to `short`.

Please note that `optimal` is not deterministic, whereas `short` and `descriptive` are. `optimal` uses `short` names where possible. If there are collisions using `short` names, `optimal` uses `descripive` names.

| Built-in Functions | Type              | Features                                                                                            |
| ------------------ | ----------------- | --------------------------------------------------------------------------------------------------- |
| `short`            | Deterministic     | Produces short names, but may result with naming collisions, if databse contains complex relations. |
| `descriptive`      | Deterministic     | Produces long names especially if foreign keys are named well. Less chance of naming collisions.    |
| `optimal`          | Non-Deterministic | Produces short names where possible, otherwise produces descriptive names.                          |

## Example Results

<div style="font-size:0.90em">

Below are generated names for example. Differences between short and long are indicated with (•).

| Tables                      | Type | Short                    | Descriptive                     |     |
| --------------------------- | ---- | ------------------------ | ------------------------------- | --- |
| _cart_ → _line_item_        | O2M  | **line_items**           | **line_items**                  |     |
| _cart_ → ... → _color_      | M2M  | **colors**               | **colors**                      |     |
| _cart_ → ... → _product_    | M2M  | **products**             | **products**                    |     |
| _color_ → _line_item_       | O2M  | **line_items**           | **line_items**                  |     |
| _color_ → _product_color_   | O2M  | **product_colors**       | **product_colors**              |     |
| _color_ → ... → _cart_      | M2M  | **carts**                | **carts**                       |     |
| _color_ → ... → _product_   | M2M  | **line_item_products**   | **line_item_products**          |     |
| _color_ → ... → _product_   | M2M  | **products**             | **color_products**              | •   |
| _line_item_ → _cart_        | M2O  | **cart**                 | **cart**                        |     |
| _line_item_ → _color_       | M2O  | **color**                | **color**                       |     |
| _line_item_ → _product_     | M2O  | **product**              | **product**                     |     |
| _product_ → _line_item_     | O2M  | **line_items**           | **line_items**                  |     |
| _product_ → _product_color_ | O2M  | **product_colors**       | **product_colors**              |     |
| _product_ → _vendor_        | M2O  | **alternative_vendor**   | **alternative_vendor**          |     |
| _product_ → _vendor_        | M2O  | **vendor**               | **vendor**                      |     |
| _product_ → ... → _cart_    | M2M  | **carts**                | **carts**                       |     |
| _product_ → ... → _color_   | M2M  | **colors**               | **product_colors**              | •   |
| _product_ → ... → _color_   | M2M  | **line_item_colors**     | **line_item_colors**            |     |
| _product_color_ → _color_   | M2O  | **color**                | **color**                       |     |
| _product_color_ → _product_ | M2O  | **product**              | **product**                     |     |
| _vendor_ → _product_        | O2M  | **alternative_products** | **alternative_vendor_products** | •   |
| _vendor_ → _product_        | O2M  | **vendor_products**      | **vendor_products**             |     |
| _vendor_ → ... → _vendor_   | M2M  | **alternative_vendors**  | **alternative_vendors**         |     |
| _vendor_ → ... → _vendor_   | M2M  | **vendors**              | **vendors**                     |     |

</div>

Provided built-in functions `short` and `optimal` try to generate the shortest name possible considering the number of relations and number of join tables between same tables. `optimal` adds adjectives more freely compared to `short`. Most of the time, they generate the same names.

## Custom Modules or Functions

You may prefer to use your functions. There are two ways to provide custom functions.

1. (Suggested) Providing a module that exports `o2`, `m2o`, and `m2m` functions and providing module name to `pg-structure`.

```ts
await pgStructure({ relationNameFunctions: "short" }); // Use builtin module.
await pgStructure({ relationNameFunctions: "my-module" }); // Use a custom module from installed npm packages.
await pgStructure({ relationNameFunctions: require.resolve("./my-module") }); // Use a custom module from source code.
```

2. Providing relation name functions. `serialize()` cannot be used with this method.

```ts
await pgStructure({ relationNameFunctions: { o2m: () => {}, m2o: () => {}, m2m: () => {} } });
```

Please see [relation name functions description](/nav.02.api/#relationnamefunctions) for details.
