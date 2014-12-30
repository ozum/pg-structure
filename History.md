
---------------------------------------

<a name="History"></a>
History & Release Notes
=======================

Note
----
Version history for minimal documentation updates are not listed here to prevent cluttering.
Important documentation changes are included anyway.

1.11.0 / 2014-12-30
===================
* Added: Constraint.throughForeignKeyConstraintToSelf() method added.
* Added: Winston logging.
* Fixed: Many to Many relations has name collisions if join table connects more than one table and one of the tables has more than one connection to join table. Naming of many to many relations changed.

1.10.0 / 2014-12-23
==================
* Added: db.includedSchemas method to get list of requested schemas to be parsed.
* Added: db.schemaIncluded method to determine if given schema name is one of the requested schemas to be parsed.
* Fix: If a table has a reference to not included schema, throws exception. Should not include its foreign key.
* Doc update.

1.9.0 / 2014-12-12
==================
* Added: table.hasManyThrough.throughForeignKeyConstraint method added to constraint class.

1.8.3 / 2014-12-10
==================
* Fix: Sequelize type length, precision.

1.8.2 / 2014-12-10
==================
* Fix: Sequelize type date, time etc. has no length property.
* Fix: Sequelize type dateonly added.
* Tests added.

1.8.0 / 2014-12-10
==================
* Added: Shortcut function 'get' added to db, schema and table classes.
* Fix: hasManyThrough does not return foreign keys.

1.7.0 / 2014-12-10
==================
* Added: onDelete and onUpdate added to hasMany and hasManyThrough relations.

1.6.0 / 2014-12-10
==================
* DEPRECATED: column.special function. Use column.enumValues instead.
* Added: Tests for enum values.
* Added: Enum support for column.sequelizeType function.
* Updated: Documentation

1.5.1 / 2014-12-04
==================
* Fix: Test db does not destroyed after tests.

1.5.0 / 2014-12-04
==================
* Fix: column.default() method returns default value with type cast. From now on yype cast part is stripped.
* Added column.defaultWithTypeCast() method for getting default values with type cast part.
* Tests added for default values.

1.4.0 / 2014-11-28
==================
* Added support for user-defined types.
* Added column.udType() method to get user defined type name.
* Added necessary tests.

1.3.1 / 2014-11-27
==================
* Added history to readme.
* Fix: Major error: Single schema or default 'public' schema databases throw error.
* Fix: Databases without any table throw error.
* Added tests of this fixes and table without any column.


1.3.0 / 2014-11-27
==================
* Parameter validation added to pg-structure main function. This would ease debugging.
* Fix: pg-structure.generate function was throwing error, now it calls its callback with error
if database connection error occurs.

1.2.1 / 2014-11-26
==================
* Fix: Documentation updated for 1.2

1.2.0 / 2014-11-26
==================
* Fix: pg-structure callback does not get error object. Instead error is thrown. Now callback gets error object as its first parameter as expected.
* db.schema() function now throws more informative error if referenced schema is not found in db and also not in the options of requested schemas.
* db.schemaExist() function added.
* History.md file added. (This file)

1.1.0 / 2014-11-25
==================
* table.foreignKeyConstraintExist() function added.

1.0.0 / 2014-11-25
==================
* Completely rewritten to migrate from plain object to object oriented design.
* column.sequelizeType() method added. This method gets sequelize compatible type of the column.

