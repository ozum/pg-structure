
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

PostgreSQL objects holds free form text in their description. `pg-structure` offers some help to store extra data in database objects' description as JSON. `pg-structure` automatically parses JSON data between `[JSON]`and `[/JSON]` tags. Tags are case-insensitive. Only one JSON object is allowed per description.

```js
// For example: 'This constraint connects account table to contact
// table. [PGEN]{ "hasMany": "primaryContacts", "belongsTo": "primaryAccount", "free": 3 }[/PGEN]'

let description = constraint.description;
let data = constraint.descriptionData;              // -> { hasMany: 'primaryContacts', belongsTo: 'primaryAccount', free: 3 }
console.log(constraint.descriptionData.hasMany);    // -> primaryContacts
```