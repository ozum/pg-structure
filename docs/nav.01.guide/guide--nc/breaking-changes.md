# Breaking Changes

## v5

### TL;DR

- Completely rewritten with TypeScript.
- New classes added and attributes moved to those new classes. (For example `Column.precision` moved to `Type` class and should be accesed `Column.type.precision`)
- If you find any mistakes in docs, please open a case in [GitHub](https://github.com/ozum/pg-structure/issues)

### New Features

- Rewritten in TypeScript from scratch.
- All collection methods migrated from `Set` and `Map` to `IndexableArray` which is an extended array. `IndexableArray` provides all declarative functions of the array i.e. `map`, `reduce`, `filter` etc. in addition of keeping collection order and indexed lookup support for `get`.
- Added abstract classes: `DBObject`, `Entity`, `Relation`.
- Added classes: `View`, `Domain`, `Type`, `Check`, `ForeignKey`, `PrimaryKey`, `Enum`.
- Added properties: `Schema.views`, `Schema.entities`.

### Breaking Changes

- **IMPORTANT:** `Constraint.parent` and `Constraint.table` contain `Table` where constraint is defined in. Previously they were containing referenced table for foreign key constraints.
- `Constraint` class is now an abstract class.
- `Column.type` is a class type instead of string.
- `*.comment` was replacing `[pg-structure][/pg-structure]`. From now on, it returns raw comment. To get comment without data, use `*.commentWithoutData`.
- `citext` and `hstore` are classified as `USER-DEFINED`, because they are installed using extra modules.

- Removed properties:

  - `*.description`, `*.descriptionData`: Use `*.comment`, `*.commentData`.
  - `*.parent` where not necessary: Use related attribute. For example: `column.table` instead of `column.parent`. `parent` causes confusion for some objects. For example index object indexes table, but their parents are `schema` not `table`: `DROP INDEX public."some_index"`.
  - `Table.kind`: Use `instanceof Table` and `instanceof View` instead.
  - `Constraint.type`: Use `instanceof [ContsraintClass]` instead.
  - `Column.domainName`, `Column.domainFullName`, `Column.domainFullCatalogName`, `Column.domainSchema`: Use `column.type instanceof Domain` and `column.type` which returns `Domain` sub class of `Type` class if type is a domain.
  - `Column.arrayDimension`, `Column.arrayType`: Use `Column.type.arrayDimension`.
  - `Column.enumLabels`, `Column.enumValues`: Use `Column.type` which returns `Enum` sub class if type is an enum.
  - `Column.precision`, `Column.scale`: Use `Column.type.precision` and `Column.type.scale`.
  - `Column.isAutoIncrement`: Use `Column.isSerial`.
  - `Column.foreignKeyConstraints`: Use `Column.foreignKeys`
    `M2MRelation.nameFromDescription`,`M2ORelation.nameFromDescription`,`O2MRelation.nameFromDescription`.
  - `M2MRelation.type`, `M2ORelation.type`, `O2MRelation.type`: Use `instanceof M2MRelation`, `instanceof M2ORelation`, `instanceof O2MRelation` instead.
  - `constraint` attributes in relations are renamed as `foreignKey`.

- Changed properties
  - `Schema.tables` contains only tables now. Previously it was containing tables and views combined. Use `Schema.entities` instead.
  - All properties and methods which contain or return `Constraint` instances, now return related subclasses `ForeignKey`, `PrimaryKey` etc.
