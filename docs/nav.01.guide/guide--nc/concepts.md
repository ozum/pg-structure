# Concepts

## Database Objects vs. pg-structure Objects

In this documentation **_database objects_** means database parts provided by PostgreSQL RDMS such as table, column, constraint etc. Sometimes those objects are simply refereed as _database_ as a general term in this documentation.

**_pg-structure objects_** means object instances provided by pg-structure classes such as [DB](/nav.02.api/classes/db), [Schema](/nav.02.api/classes/schema), [Table](/nav.02.api/classes/table), [Column](/nav.02.api/classes/column) etc.

## Objects (Instances)

In **pg-structure** database objects such as Schema, Column etc. are represented by JavaScript objects such as [Schema](api/Schema.md), [Column](api/Column.md) etc.

```js
// db is an pg-structure DB object.
const db = await pgStructure({ database: "db", user: "u", password: "pass" }, { includeSchemas: ["public"] });
```

### Attributes

**pg-structure** objects' attributes are designed to be **read only** and formed as **nouns**. Generally:

- Singular named attributes such as [table.name](/nav.02.api/classes/table.html#name) contains single data which is a simple JavaScript type.
- Plural named attributes such as [table.columns](/nav.02.api/classes/table.html#columns) contains [IndexableArray](https://www.npmjs.com/package/indexable-array) of related objects.

### Methods

**pg-structure** also provides methods to access some database details.

Methods are named as verbs like [table.getForeignKeysTo()](/nav.02.api/classes/table.html#getforeignkeysto).

### `get` shortcut

[DB](/nav.02.api/classes/db), [Schema](/nav.02.api/classes/schema), [Table](/nav.02.api/classes/table) instances provide `get` method for a shortcut.

For example `columnA`, `columnB` and `columnC` below has same object:

```ts
const columnA = db.get("account.user_name"); // Uses default `public` schema.
const columnB = db.get("public.account.user_name");
const columnC = db.schemas.get("public").tables.get("account").columns.get("user_name");
```

### Collections

Collections in `pg-structure` are provided using [IndexableArray](https://www.npmjs.com/package/indexable-array). [IndexableArray](https://www.npmjs.com/package/indexable-array) inherits `Array` class and therefore provide all methods and attributes of `Array` base class in addition to `get()`, `getMaybe()`, `getAll()`, `has()` methods to access elements like JS Object or `Map`.

Please note [IndexableArray](https://www.npmjs.com/package/indexable-array) throws exception if `get()` does not found required element. To get `undefined` use `getMaybe()`.

```ts
const columnNames = table.columns.map((c) => c.name); // Base array map.
const column = table.columns.get("surname"); // Gets surname column.
const unknown = table.columns.get("unknown_column"); // Throws exception
const undef = table.columns.getMaybe("unknown_column"); // Undefined
```

## Relation Classes vs. Foreign Key Constraint

**pg-structure** provides [ForeignKey](/nav.02.api/classes/foreignkey) object which represents directly PostgreSQL foreign key constraints.

Sometimes developers and ORM users need to have more information about relations than available in foreign key constraints. For example many to many relationships and many to one relationships are not available in database engine. **pg-structure** provides [one to many](/nav.02.api/classes/o2mrelation), [many to one](/nav.02.api/classes/m2orelation) and [many to many](/nav.02.api/classes/m2mrelation) relation classes to address those needs.

## Description Data / Comment Data

PostgreSQL objects holds free form text in their description. `pg-structure` offers some help to store extra data in database objects' description as JSON. `pg-structure` automatically parses JSON data between `[pg-structure]`and `[/pg-structure]` tags. Tags are case-insensitive. Only one `pg-structure` object is processed per description. Tag name may be configured using [pgStructure()](/nav.02.api/#pgstructure) options.

For maximum comfort JSON parsing is made by [JSON5](https://json5.org/). It is a relaxed JSON parser. See [JSON5](https://json5.org/) page for details.

```ts
// Assuming account table has description below:
// Account table holds info about companies. [pg-structure]{ someData: 'Some value here' }[/pg-structure]
const data = accountTable.descriptionData; // -> { someData: 'Some value here' }
```
