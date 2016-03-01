<div id="History"></div>

**Note**: Version history for minimal documentation updates are not listed here to prevent cluttering.

# History & Release Notes

###### 3.4.0
* Changed: `table#descriptionData` tag is changed from `[JSON]` to `[pg-structure]`
* (EXPERIMENTAL) Added: `o2mRelation#generateName()`, `m2oRelation#generateName()`, `m2mRelation#generateName()`. Those methods are highly experimental and may be changed or deleted.

###### 3.3.2 / 2016-02-25
* Fixed: Tables without primary key was throwing exception for `table#primaryKeyColumns`.
* Fixed: `table#hasManyTables` and `table#belongsToTables` were returning array instead of Set.

###### 3.3.0 / 2016-02-24
* Added: `table#descriptionData`, `table#commentData`, `column#descriptionData`, `column#commentData`, `constraint#descriptionData`, `constraint#commentData`. It is possible to store and access JSON in objects' description.

###### 3.2.0 / 2016-02-24
* Added:`constraint#description`, `constraint#comment`.
* Updated: Test ERD corrected.

###### 3.1.1 / 2016-01-30
* Added: `column#referencedColumns`.

###### 3.1.0 / 2016-01-26
* Added: `#array` method is added all Map types to help building arrays in non supporting environments such as nunjucks.

###### 3.0.0 / 2016-01-16
Previous versions of pg-structure are designed to be a build time tool. v3 are designed to be a runtime tool. It is refactored to better performance compared to previous versions.
Internal storage is completely rewritten. Loki DB is excellent product, but it is overkill for this project. pg-structure now uses direct object references for speed up things.
DB interaction is reduced from 9 SQL queries to 3. Those 3 queries are same queries from previous version. So work of other 6 queries are done by Javascript now.

* Breaking Change: `Column#foreignKeyConstraint` is changed to `Column#foreignKeyConstraints`, `Column#referencedColumn` is removed,
because same column may be part of multiple different foreign key constraints which results in referencing different columns
in different tables at the same time.
* Breaking Change: All `...ByName` such as `Table#columnsByName` methods are removed, and collections such as `Table#columns` return Map instead of array or object.
Maps return values in order like arrays and they can be queried with `.has` method like objects.
* Breaking Change: `Column#uniqueIndexesNoPK` is renamed as `Column#uniqueIndexesNoPk`.
* Added: Optional Lazy loading, cache of lazy loaded parts, invalidation logic of cache.
* Added: `pgStructure.serialize` and `pgStructure.deserialize` methods.
* Added: `pgStructure.save` and `pgStructure.load` methods. Load is 10 times faster than querying database. 
* Added: `Column#domainSchema`
* Added: `Constraint#matchOption`, `Constraint#referencedColumnsBy`
* Added: `Table#belongsToManyTablesPk`, `Table#m2mRelationsPk`
* Doc updates and changes.

###### 2.0.8 / 2015-12-09

* Added: `Table#description` and `Table#comment` attributes added to the table object.
* Fixed: Table sql was returning null for table descriptions. 

###### 2.0.5 / 2015-12-08

* Changed: Code and API cleanup and simplification since alpha releases.
* Changed: Array and collection object returning attributes now return empty array or empty object if no result found. Previously they returned null. They are usually used in loops, and this change helps getting rid of null checks.
* Removed: All methods which are duplicate of attributes. They cause duplicated code and don't add any useful contribution. Same can be achieved using attributes with foreach and better can be achieved with for..of. 

###### 2.0.0-alpha.9 / 2015-11-29
* Fixed: One to many and many to one relations duplicates.

###### 2.0.0-alpha.8 / 2015-11-29
* Fixed: Join tables with more than one relations produce warning about non-unique constraint.
* Fixed: referencedTable returns undefined.
* Fixed: Example on README throws exception. Typo corrected. Catch part added.
* Added: New tests for fixed bugs.

###### 2.0.0-alpha.5 / 2015-11-19
* Added: Table#relations and Table#getRelations().

###### 2.0.0-alpha.3 / 2015-11-19
* Fixed: Broken links in documentation.

###### 2.0.0-alpha.2 / 2015-11-17
* Added: Index class is added.
* Fixed: Column#unique was assuming that a column can have only one unique constraint. Now it returns array.
* Fixed: Column#unique was ignoring unique indexes Now it considers unique indexes too.
* Fixed: Many typos in constraint class documentation.

###### 2.0.0-alpha.1 / 2015-11-11
* ** BREAKING CHANGES **
* Completely rewritten.
* Methods are converted to read only attributes.
* New methods are named as verb such as getColumn().
* New classes added: Relation, O2MRelation (one to many), M2ORelation (many to one), M2M Relation (many to many).
* Constraint features that are technically not available in DB Engine moved from `Constraint` class to related `Relation` classes.
* Documentation updated completely and added clearer examples.
* Some method names and attributes are more intuitive than previous version.

###### Why v2 has incompatible changes?
Version 2 is designed to be more elegant and more intuitive. Methods are changed to read only attributes and new methods
 are easily distinguished from attributes with verb based names such as `columns` vs `getColumns()`.

Additionally new `Relation` classes are added. Some of the features are moved from `Constraint` to `Relation`,
 because some features are technically not available in DB Engine and those features misrepresent `Constraint`.
 
For example many to many relations are virtual relationships which do not actually exist in database. They are
tables joined via a third join table.

###### 1.11.1 / 2015-06-16
* Added: JSONB support. Contributed by: viniciuspinto (https://github.com/viniciuspinto)

###### 1.11.0 / 2014-12-30
* Added: Constraint.throughForeignKeyConstraintToSelf() method added.
* Added: Winston logging.
* Fixed: Many to Many relations has name collisions if join table connects more than one table and one of the tables has more than one connection to join table. Naming of many to many relations changed.

###### 1.10.0 / 2014-12-23
* Added: db.includedSchemas method to get list of requested schemas to be parsed.
* Added: db.schemaIncluded method to determine if given schema name is one of the requested schemas to be parsed.
* Fix: If a table has a reference to not included schema, throws exception. Should not include its foreign key.
* Doc update.

###### 1.9.0 / 2014-12-12
* Added: table.hasManyThrough.throughForeignKeyConstraint method added to constraint class.

###### 1.8.3 / 2014-12-10
* Fix: Sequelize type length, precision.

###### 1.8.2 / 2014-12-10
* Fix: Sequelize type date, time etc. has no length property.
* Fix: Sequelize type dateonly added.
* Tests added.

###### 1.8.0 / 2014-12-10
* Added: Shortcut function 'get' added to db, schema and table classes.
* Fix: hasManyThrough does not return foreign keys.

###### 1.7.0 / 2014-12-10
* Added: onDelete and onUpdate added to hasMany and hasManyThrough relations.

###### 1.6.0 / 2014-12-10
* DEPRECATED: column.special function. Use column.enumValues instead.
* Added: Tests for enum values.
* Added: Enum support for column.sequelizeType function.
* Updated: Documentation

###### 1.5.1 / 2014-12-04
* Fix: Test db does not destroyed after tests.

###### 1.5.0 / 2014-12-04
* Fix: column.default() method returns default value with type cast. From now on yype cast part is stripped.
* Added column.defaultWithTypeCast() method for getting default values with type cast part.
* Tests added for default values.

###### 1.4.0 / 2014-11-28
* Added support for user-defined types.
* Added column.udType() method to get user defined type name.
* Added necessary tests.

###### 1.3.1 / 2014-11-27
* Added history to readme.
* Fix: Major error: Single schema or default 'public' schema databases throw error.
* Fix: Databases without any table throw error.
* Added tests of this fixes and table without any column.

###### 1.3.0 / 2014-11-27
* Parameter validation added to pg-structure main function. This would ease debugging.
* Fix: pg-structure.generate function was throwing error, now it calls its callback with error
if database connection error occurs.

###### 1.2.0 / 2014-11-26
* Fix: pg-structure callback does not get error object. Instead error is thrown. Now callback gets error object as its first parameter as expected.
* db.schema() function now throws more informative error if referenced schema is not found in db and also not in the options of requested schemas.
* db.schemaExist() function added.
* History.md file added. (This file)

###### 1.1.0 / 2014-11-25
* table.foreignKeyConstraintExist() function added.

###### 1.0.0 / 2014-11-25
* Completely rewritten to migrate from plain object to object oriented design.
* column.sequelizeType() method added. This method gets sequelize compatible type of the column.

