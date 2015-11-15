
## Database Objects vs. pg-structure Objects

In this documentation **_database objects_** means database parts provided by PostgreSQL such as table, column, constraint etc. Sometimes those objects are simply refereed as _database_ as a general term in this documentation.

**_pg-structure objects_** means object instances provided by pg-structure classes.

## Objects (Instances)

In **pg-structure** database objects such as Schema, Column etc. are represented by JavaScript objects such as [Schema](api/schema.md), [Column](api/column.md) etc.

```js
pgStructure(connectionArgs, schemas).then((db) => {
    // db is an DB object.
});
```

## Attributes

**pg-structure** objects have read only attributes to access various database objects' details. Attributes are **read only** and formed as **nouns**.

* Singular named attributes such as [table#name](api/table.md#Table+name) contains single data which is a simple JavaScript type.
* Plural named attributes such as [table#columns](api/table.md#Table+columns) contains array of related objects.
* Plural named attributes with suffix `ByName` such as [table#columnsByName](api/table.md#Table+columnsByName) contains a simple object as key/value pairs. Keys are object's names, values are related objects.

## Methods

**pg-structure** also provides methods to access database details.

Most of the methods which returns array of objects have equivalent attributes. For example [table#columns](api/table.md#Table+columns) and [table#getColumns](api/table.md#Table+getColumns). They are provided for convenience. They may be called with callbacks or for their return value. Even some methods executes callbacks, pg-structure methods are synchronous. 

Methods are named as verbs like [Table#getPrimaryKeys](api/table.md#Table+getPrimaryKeys) or as question like terms such as [Column#isSerial](api/column.md#Column+isSerial) or [Table#columnExists](api/table.md#Table+columnExists).

## Callbacks

As described in previous section, some methods may be called with a callback function. They are executed synchronously for each object resulted by method call. Those are object collection returning functions. Their callback signature are usually `function (object, index, collection)`.

```js
schema.getTables(function(table, i, collection) {
//                          ↑    ↑        ^---- All tables of given schema.
//                          |    ------ Position of the table in array.
//                          ------ Individual table object.
    var name = table.name;
});
```

## `get` shortcut

[DB](api/db.md), [schema](api/schema.md), [table](api/table.md) classes provide `get` method for a shortcut. This method may be used to save a few key strokes.

For example all below are equal:

```js
var userColumn      = db.get('public.account.user_name');
var sameColumn      = db.getSchema('public').getTable('account').getColumn('user_name');
var againSameColumn = db.schemasByName.public.tablesByName.account.columnsByName.user_name;
```

## [Relation](api/relation.md) Classes vs. Foreign Key Constraint

**pg-structure** Foreign Key Constraint objects represent directly PostgreSQL foreign key constraints.

Developers and ORM users need to have more information about relations than present in foreign key constraints. For example many to many relationships and many to one relationships are not available in database engine. **pg-structure** provides [O2MRelation](api/o2m-relation.md), [M2MRelation](api/m2m-relation.md) and [M2ORelation](api/m2o-relation.md) classes to answer those needs.
