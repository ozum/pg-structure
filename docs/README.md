---
home: true
heroImage: /images/hero.png
heroText:
tagline:
actionText: Get Started →
actionLink: /nav.01.guide/
features:
  - title: Enhanced Arrays
    details: Collections supports all array methods such as map, reduce, forEach() as well as direct access methods such as get.
  - title: TypeScript
    details: Written in TypeScript. In addition to support JavaScript, all typings are available in TypeScript.
  - title: Documented
    details: All classes, class attributes and methods are documented and available via documentation web site.
footer: MIT Licensed | Copyright © 2019-present Özüm Eldoğan
---

```ts
const columnNames = db.get("contact").columns.map(c => c.name); // Column names of `public.contact` table.
```

### Reverse Engineer a PostgreSQL Database

`pg-structure` reverse engineers PostgreSQL database and lets you easily code, analyze, operate on PostgreSQL database structure by providing details about [DB](/nav.02.api/classes/db), [Schema](/nav.02.api/classes/schema), [Table](/nav.02.api/classes/table), [Column](/nav.02.api/classes/column), [ForeignKey](/nav.02.api/classes/foreignkey), [Relation](/nav.02.api/classes/relation), [Index](/nav.02.api/classes/index2), [Type](/nav.02.api/classes/type). etc.

```ts
import pgStructure from "pg-structure";

async function demo() {
  const db = await pgStructure({ database: "db", user: "u", password: "pass" }, { includeSchemas: ["public"] });

  const table = db.get("contact");
  const columnNames = table.columns.map(c => c.name);
  const columnTypeName = table.columns.get("options").type.name;
  const indexColumnNames = table.indexes.get("ix_mail").columns;
  const relatedTables = table.hasManyTables;
}
```

### Changes

If you upgrade, please see [v5 beraking changes](/nav.01.guide/guide--nc/breaking-changes).
