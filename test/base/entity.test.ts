import { Db, Entity, Table } from "../../src/index";
import getDb from "../test-helper/get-db";

let db: Db;
let entity: Entity;

beforeAll(async () => {
  db = await getDb();
  entity = db.get("public.mv_contact_other_schema_cart") as Entity;
});

describe("Entity", () => {
  it("should have oid.", () => {
    expect(entity.oid).toBeDefined();
  });

  it("should have name.", () => {
    expect(entity.name).toBe("mv_contact_other_schema_cart");
  });

  it("should have full name.", () => {
    expect(entity.fullName).toBe("public.mv_contact_other_schema_cart");
  });

  it("should have full catalog name.", () => {
    expect(entity.fullCatalogName).toBe("pg-structure-test-main.public.mv_contact_other_schema_cart");
  });

  it("should have schema.", () => {
    expect(entity.schema.name).toBe("public");
  });

  it("should have columns.", () => {
    expect(entity.columns.map(c => c.name)).toEqual(["cart_id", "contact_id"]);
  });

  it("should detect snake case names.", () => {
    expect(entity.nameCaseType).toEqual("snakeCase");
  });

  it("should detect camel case names.", () => {
    const table = db.get("public.Part") as Table;
    expect(table.nameCaseType).toEqual("camelCase");
  });

  it("should get column.", () => {
    expect(entity.get("cart_id").name).toEqual("cart_id");
  });
});
