# pg-structure

Reverse engineer PostgreSQL database as a detailed JS Object.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Home Page](#home-page)
- [Installation](#installation)
- [Synopsis](#synopsis)
- [Details](#details)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Home Page

Please see [pg-structure.com](https://www.pg-structure.com) for details.

# Installation

`$ npm install pg-structure`

# Synopsis

```ts
import pgStructure from "pg-structure";

async function demo() {
  // Prefer to use environment variables or ".env" file for the credentials. See the ".env.example" file.
  const db = await pgStructure({ host: "host", database: "db", user: "u", password: "pass" }, { includeSchemas: ["public"] });

  const table = db.get("contact");
  const columnNames = table.columns.map((c) => c.name);
  const columnTypeName = table.columns.get("options").type.name;
  const indexColumnNames = table.indexes.get("ix_mail").columns;
  const relatedTables = table.hasManyTables;
}
```

# Details

`pg-structure` reverse engineers PostgreSQL database and lets you easily code, analyze, operate on PostgreSQL database structure by providing details about DB, Schema, Table, Column, ForeignKey, Relation, Index, Type and others.
