import { Db, Type } from "../../src/index";
import getDb from "../test-helper/get-db";

let db: Db;
let type: Type;

beforeAll(async () => {
  db = await getDb();
  type = db.schemas.get("public").types.get("udt_composite");
});

describe("Type", () => {
  it("should have oid", () => {
    expect(type.oid).toBeDefined();
  });

  it("should have classOid", () => {
    expect(type.classOid).toBeDefined();
  });

  it("should have schema", () => {
    expect(type.schema.name).toBe("public");
  });

  it("should have fullName", () => {
    expect(type.fullName).toBe("public.udt_composite");
  });

  it("should have fullCatalogName", () => {
    expect(type.fullCatalogName).toBe("pg-structure-test-main.public.udt_composite");
  });
});
