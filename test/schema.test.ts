import { Db, Schema } from "../src/index";
import getDb from "./test-helper/get-db";

let db: Db;
let schema: Schema;

beforeAll(async () => {
  db = await getDb();
  schema = db.get("public") as Schema;
});

describe("Schema", () => {
  it("should have name.", () => {
    expect(schema.name).toBe("public");
  });

  it("should have full name.", () => {
    expect(schema.fullName).toBe("public");
  });

  it("should have schema as itself.", () => {
    expect(schema.schema.name).toBe(schema.name);
  });

  it("should have oid.", () => {
    expect(schema.oid).toBeDefined();
  });

  it("should have entities.", () => {
    expect(schema.entities.get("type_table").name).toBe("type_table");
  });

  it("should have tables.", () => {
    expect(schema.tables.get("type_table").name).toBe("type_table");
  });

  it("should have all types.", () => {
    // PostgreSQL added "udt_multirange" types.
    const typeNames =
      parseInt(db.serverVersion, 10) >= 14
        ? ["cross_schema_domain", "price", "udt_composite", "udt_enum", "udt_multirange", "udt_range"]
        : ["cross_schema_domain", "price", "udt_composite", "udt_enum", "udt_range"];

    expect(schema.types.map((t) => t.name)).toEqual(typeNames);
  });

  it("should have all types including entity types.", () => {
    const types = [
      "account",
      "cancelled_item",
      "cart",
      "cart_line_item",
      "class",
      "class_registry",
      "contact",
      "cross_schema_domain",
      "game",
      "message",
      "mv_contact_other_schema_cart",
      "Part",
      "PartGroup",
      "partitioned_table",
      "partitioned_table_A",
      "partitioned_table_B",
      "price",
      "product",
      "product_category",
      "publisher",
      "student",
      "type_table",
      "udt_composite",
      "udt_enum",
      "udt_range",
      "v_account_primary_contact",
    ];

    // PostgreSQL added "udt_multirange" types.
    if (parseInt(db.serverVersion, 10) >= 14) types.splice(24, 0, "udt_multirange");

    expect(schema.typesIncludingEntities.map((t) => t.name)).toEqual(types);
  });

  it("should have views.", () => {
    expect(schema.views.get("v_account_primary_contact").name).toBe("v_account_primary_contact");
  });

  it("should have materialized views.", () => {
    expect(schema.materializedViews.get("mv_contact_other_schema_cart").name).toBe("mv_contact_other_schema_cart");
  });
});
