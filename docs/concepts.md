
## Database Objects vs. pg-structure Objects

In this documentation **_database objects_** means database parts provided by PostgreSQL such as table, column, constraint etc. Sometimes those objects are simply refereed as _database_ as a general term in this documentation.

**_pg-structure objects_** means object instances provided by pg-structure classes.

## Objects (Instances)

In **pg-structure** database objects such as Schema, Column etc. are represented by JavaScript objects such as [Schema](api/Schema.md), [Column](api/Column.md) etc.

```js
pgStructure(connectionArgs, schemas).then((db) => {
    // db is an DB object.
});
```

## Attributes

**pg-structure** objects attributes are designed to be read only. They access various database objects' details. Attributes are **read only** and formed as **nouns**.

Unlike previous versions of **pg-structure**, current version does not enforce read only behaviour for the sake of new performance oriented design.

* Singular named attributes such as [table#name](api/Table.md#Table+name) contains single data which is a simple JavaScript type.
* Plural named attributes such as [table#columns](api/Table.md#Table+columns) contains array of related objects.
* Plural named attributes with suffix `ByName` such as [table#columnsByName](api/Table.md#Table+columnsByName) contains a simple object as key/value pairs. Keys are object's names, values are related objects.

## Methods

**pg-structure** also provides methods to access database details.

Methods are named as verbs like [Table#getPrimaryKeys](api/Table.md#Table+getPrimaryKeys) or [Table#columnExists](api/Table.md#Table+columnExists).

## `get` shortcut

[DB](api/Db.md), [schema](api/Schema.md), [table](api/Table.md) classes provide `get` method for a shortcut. This method may be used to save a few key strokes.

For example all below are equal:

```js
var userColumn      = db.get('public.account.user_name');
var sameColumn      = db.getSchema('public').getTable('account').getColumn('user_name');
var againSameColumn = db.schemasByName.public.tablesByName.account.columnsByName.user_name;

console.log(userColumn === sameColumn); // true 
```

## Relation Classes vs. Foreign Key Constraint

**pg-structure** Foreign Key Constraint objects represent directly PostgreSQL foreign key constraints.

Developers and ORM users need to have more information about relations than present in foreign key constraints. For example many to many relationships and many to one relationships are not available in database engine. **pg-structure** provides [O2MRelation](api/O2MRelation.md), [M2MRelation](api/M2MRelation.md) and [M2ORelation](api/M2ORelation.md) classes to answer those needs.

## Description Data

PostgreSQL objects holds free form text in their description. `pg-structure` offers some help to store extra data in database objects' description as JSON. `pg-structure` automatically parses JSON data between `[pg-structure]`and `[/pg-structure]` tags. Tags are case-insensitive. Only one `pg-structure` object is processed per description.

For maximum comfort JSON parsing is made by [jsonic](https://www.npmjs.com/package/jsonic). It is a non-strict JSON parser. 

* You don't need to quote property names: { foo:"bar baz", red:255 }
* You don't need the top level braces: foo:"bar baz", red:255
* You don't need to quote strings with spaces: foo:bar baz, red:255
* You do need to quote strings if they contain a comma or closing brace or square bracket: icky:",}]"
* You can use single quotes for strings: Jules:'Cry "Havoc," and let slip the dogs of war!'
* You can have trailing commas: foo:bar, red:255,

For details, please see [jsonic](https://www.npmjs.com/package/jsonic).

```js
// For example: 'This constraint connects account table to contact
// table. [pg-structure]{ hasMany: primaryContacts, belongsTo: primaryAccount, free: 3 }[/pg-structure]'

let description = constraint.description;           // -> 'This constraint connects account table to contact table.' (Tags and JSON data are replaced from description.)  
let data = constraint.descriptionData;              // -> { hasMany: 'primaryContacts', belongsTo: 'primaryAccount', free: 3 }
console.log(constraint.descriptionData.hasMany);    // -> primaryContacts
```