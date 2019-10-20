# Introduction

**pg-structure** is a Node.js library written in TypeScript to reverse engineer [PostgreSQL](http://www.postgresql.org) database as a detailed JavaScript object.

Use [pgStructure()](/nav.02.api/#pgstructure) function to get root [Db](/nav.02.api/classes/db) object. It also provides some additional useful objects which are not present in RDMS such as [one to many](/nav.02.api/classes/o2mrelation), [many to one](/nav.02.api/classes/m2orelation) and [many to many](/nav.02.api/classes/m2mrelation) relations.

Created object can be used to auto generate documentation or ORM models from database. It is much easier to work with JS object than working manually with database and SQL queries.

## Features

- Fully tested
- Fully documented
- All PostgreSQL data types including array, JSON and HSTore
- Support composite keys (Multiple field keys)
- Schema support
- Constraints (Primary Key, Foreign Key, Unique etc.).
- Supports multi-column constraints.
- Identifies one to many (hasMany) relationships.
- Identifies reverse of one to many (belongsTo) relationships
- Identifies all possible many to many (belongs to many & has many through) relationships
- Objects can be accessed by name or by order.
- Allows to store and extract JSON data from Database objects. (See [Description Data in concepts](/nav.01.guide/guide--nc/concepts).)
- Very detailed column meta data such as not null, description, auto increment, onUpdate, onDelete, etc. See [Column doc](/nav.02.api/classes/column) for details.

## Where to Start?

- First have look at [concepts](/nav.01.guide/guide--nc/concepts) to understand a few key points.
- You may want to read [examples](/nav.01.guide/guide--nc/examples) to see how **pg-structure** can be used.
- To see API reference read [API](/nav.02.api).
- For bug reports, please visit [GitHub issues page](https://github.com/ozum/pg-structure/issues).

## Contributions

- For contribution please send pull requests with tests on [GitHub](https://github.com/ozum/pg-structure.git).

## Thanks for Contributions

[PhilWaldmann](https://github.com/PhilWaldmann)
[ShaunParsons](https://github.com/ShaunParsons)
[cyberinferno](https://github.com/cyberinferno)
[viniciuspinto](https://github.com/viniciuspinto)
