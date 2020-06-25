import { Db, CompositeType, Column, Table } from "../../src/index";
import getDb from "../test-helper/get-db";

let db: Db;
let compositeType: CompositeType;
let field4: Column;

beforeAll(async () => {
  db = await getDb();
  compositeType = db.schemas.get("public").types.get("udt_composite") as CompositeType;

  field4 = compositeType.columns.get("field4") as Column;
});

describe("CompositeType", () => {
  it("should be composite type.", () => {
    expect(compositeType).toBeInstanceOf(CompositeType);
  });

  it("should not be based on an entity.", () => {
    expect(compositeType.entity).toBeUndefined();
  });

  it("should have columns.", () => {
    expect(compositeType.columns.map((c) => c.fullName)).toEqual([
      "public.udt_composite.field1",
      "public.udt_composite.field2",
      "public.udt_composite.field3",
      "public.udt_composite.field4",
    ]);
  });

  describe("Column with composite type array", () => {
    it("should have full name.", () => {
      expect(field4.fullName).toBe("public.udt_composite.field4");
    });

    it("should have it's own type.", () => {
      expect(field4.type.fullName).toBe("other_schema.udt_composite");
      expect((field4.type as CompositeType).columns.length).toBe(2);
    });

    it("should have array dimension.", () => {
      expect(field4.arrayDimension).toBe(2);
    });
  });

  describe("entity", () => {
    it("should return entity of composite type if it is based on entity", () => {
      const entityCompositeType = db.entities.get("type_table").columns.get("field20").type as CompositeType;
      expect(entityCompositeType.entity).toBeInstanceOf(Table);
    });
  });
});
