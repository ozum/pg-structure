/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Db } from "../src/index";
import getDb, { getDescriptiveDb } from "./test-helper/get-db";

let db: Db;
let descriptiveDb: Db;

beforeAll(async () => {
  db = await getDb();
  descriptiveDb = await getDescriptiveDb();
});

describe("Db", () => {
  it("should throw if database name is not provided", () => {
    expect(() => new Db({ name: undefined as any, serverVersion: "x" }, {} as any, undefined as any)).toThrow("Database name is required.");
  });

  it("should have config with default values.", () => {
    expect(db._config.commentDataToken).toBe("pg-structure");
  });

  it("should have name.", () => {
    expect(db.name).toBe("pg-structure-test-main");
  });

  it("should get schema.", () => {
    expect(db.get("public").name).toEqual("public");
  });

  it("should throw for unknown.", () => {
    expect(() => db.get("XYZT").name).toThrow("'XYZT' cannot be found");
  });

  it("should get table.", () => {
    expect(db.get("public.type_table").name).toEqual("type_table");
  });

  it("should get table from default public schema.", () => {
    expect(db.get("type_table").name).toEqual("type_table");
  });

  it("should get column.", () => {
    expect(db.get("public.type_table.field1_a").name).toEqual("field1_a");
  });

  it("should get column from default public schema.", () => {
    expect(db.get("type_table.field1_a").name).toEqual("field1_a");
  });

  it("should have schemas.", () => {
    expect(db.schemas.map((s) => s.name)).toEqual(["extra_modules", "other_schema", "public"]);
  });

  it("should have system schema.", () => {
    expect(db._systemSchema.name).toEqual("pseudo_pg_catalog");
  });

  it("should have builtin types in system schema.", () => {
    expect(db._systemSchema.types.get("smallint").name).toEqual("smallint");
  });

  it("should have all entities.", () => {
    expect(db.entities.get("type_table").name).toBe("type_table");
  });

  it("should have all tables.", () => {
    expect(db.tables.get("type_table").name).toBe("type_table");
  });

  it("should have all types.", () => {
    expect(db.types.get("udt_enum").name).toBe("udt_enum");
  });

  it("should have all indexes.", () => {
    expect(db.indexes.get("type_table_pk").name).toBe("type_table_pk");
  });

  it("should detect relation name collisions.", () => {
    expect(db.relationNameCollisions!["public.contact"].o2m).toBeDefined();
  });

  it("should detect if there are no relation name collisions.", () => {
    expect(descriptiveDb.relationNameCollisions).toBeUndefined();
  });
});
