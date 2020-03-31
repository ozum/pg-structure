# FAQ

**I'm getting 'information_schema' cannot be found in Schema's name error.**

If you have used some database objects or data types from `information_schema`, you need to include `information_schema` schema.

You can easily include it by setting `includeSystemSchemas` option to true:

```ts
const db = await pgStructure({ database: "my_db", user: "user", password: "password" }, { includeSystemSchemas: true });
```
