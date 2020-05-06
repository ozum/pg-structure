import { Client } from "pg";
import pgStructure, { deserialize } from "../src/index";

describe("pgStructure() Factory", () => {
  it("should return object including system schemas.", async () => {
    const db = await pgStructure(
      { database: "pg-structure-test-main", user: "user", password: "password" },
      { includeSystemSchemas: true }
    );

    expect(db.schemas.map((s) => s.name)).toEqual(["extra_modules", "information_schema", "other_schema", "pg_catalog", "public"]);
  });

  it("should deserialize given JSON data.", async () => {
    const db = await pgStructure({ database: "pg-structure-test-main", user: "user", password: "password" });
    const serialized = db.serialize();
    const otherDb = deserialize(serialized);

    expect(otherDb.schemas.map((s) => s.name)).toEqual(["extra_modules", "other_schema", "public"]);
  });

  it("should return object with included schemas.", async () => {
    const db = await pgStructure(
      { database: "pg-structure-test-main", user: "user", password: "password" },
      { includeSystemSchemas: true, includeSchemas: "extra_modules" }
    );
    expect(db.schemas.map((s) => s.name)).toEqual(["extra_modules", "information_schema", "pg_catalog"]);
  });

  it("should return object with included schemas - 2.", async () => {
    const db = await pgStructure(
      { database: "pg-structure-test-main", user: "user", password: "password" },
      { includeSystemSchemas: true }
    );
    expect(db.schemas.map((s) => s.name)).toEqual(["extra_modules", "information_schema", "other_schema", "pg_catalog", "public"]);
  });

  it("should return object with included schemas 3.", async () => {
    const db = await pgStructure(
      { database: "pg-structure-test-main", user: "user", password: "password" },
      { includeSchemas: ["extra_modules", "other_schema", "public"] }
    );
    expect(db.schemas.map((s) => s.name)).toEqual(["extra_modules", "other_schema", "public"]);
  });

  it("should return object with excluded schemas.", async () => {
    const db = await pgStructure(
      { database: "pg-structure-test-main", user: "user", password: "password" },
      { excludeSchemas: "%nfo%", includeSystemSchemas: true }
    );
    expect(db.schemas.map((s) => s.name)).toEqual(["extra_modules", "other_schema", "pg_catalog", "public"]);
  });

  it("should accept relation name function.", async () => {
    const db = await pgStructure(
      { database: "pg-structure-test-main", user: "user", password: "password" },
      {
        relationNameFunctions: {
          o2m: (relation) => `X_${relation.sourceTable.name}`,
          m2o: (relation) => `X_${relation.sourceTable.name}`,
          m2m: (relation) => `X_${relation.sourceTable.name}`,
        },
      }
    );

    expect(db.tables.get("account").o2mRelations[0].name).toEqual("X_account");
  });

  it("should connect using unconnected pg client.", async () => {
    const client = new Client({ connectionString: "postgresql://user:password@127.0.0.1:5432/pg-structure-test-main" });
    const db = await pgStructure(client);

    expect(db.tables.get("account").name).toEqual("account");
  });

  it("should connect using connected pg client.", async () => {
    const client = new Client({ connectionString: "postgresql://user:password@127.0.0.1:5432/pg-structure-test-main" });
    await client.connect();
    const db = await pgStructure(client);

    expect(db.tables.get("account").name).toEqual("account");
  });
});
