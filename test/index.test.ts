import IndexableArray from "indexable-array";
import { Db, Index, Table, MaterializedView } from "../src/index";
import getDb from "./test-helper/get-db";

let db: Db;
let table: Table;
let mView: MaterializedView;
let mViewIndexes: IndexableArray<Index, "name", never, true>;
let tableIndexes: IndexableArray<Index, "name", never, true>;

beforeAll(async () => {
  db = await getDb();
  table = db.get("public.account") as Table;
  tableIndexes = table.indexes;
  mView = db.get("public.mv_contact_other_schema_cart") as MaterializedView;
  mViewIndexes = mView.indexes;
});

describe("Index", () => {
  describe("on a table", () => {
    it("should have table", () => {
      expect(tableIndexes.get("ix_expression").table?.name).toBe("account");
    });
    it("should not have a materialized view", () => {
      expect(tableIndexes.get("ix_expression").materializedView).toBeUndefined();
    });
  });
  describe("on a materialized view", () => {
    it("should have materialized view", () => {
      expect(mViewIndexes.get("mv_contact_other_schema_cart_cart_id_idx").materializedView?.name).toBe("mv_contact_other_schema_cart");
    });
    it("should not have a table", () => {
      expect(mViewIndexes.get("mv_contact_other_schema_cart_cart_id_idx").table).toBeUndefined();
    });
  });
  it("should have name.", () => {
    expect(tableIndexes.get("ix_expression").name).toBe("ix_expression");
  });

  it("should have full name.", () => {
    expect(tableIndexes.get("ix_expression").fullName).toBe("public.account.ix_expression");
  });

  it("should have oid.", () => {
    expect(tableIndexes.get("ix_expression").oid).toBeDefined();
  });

  it("should have parent.", () => {
    expect(tableIndexes.get("ix_expression").parent.name).toBe("account");
  });

  it("should have schema.", () => {
    expect(tableIndexes.get("ix_expression").schema.name).toBe("public");
  });

  it("should have expression.", () => {
    expect(tableIndexes.get("ix_expression").columnsAndExpressions[0]).toBe("lower((name)::text)");
  });

  it("should have partial attribute.", () => {
    expect(tableIndexes.get("ix_partial_unique").isPartial).toBe(true);
  });

  it("should have unique attribute.", () => {
    expect(tableIndexes.get("ix_partial_unique").isUnique).toBe(true);
  });

  it("should have isExclusion attribute.", () => {
    expect(tableIndexes.get("ix_exclude").isExclusion).toBe(true);
  });

  it("should have isPrimaryKey attribute.", () => {
    expect(tableIndexes.get("KeyEntity11").isPrimaryKey).toBe(true);
  });

  it("should have partialIndexExpression attribute.", () => {
    expect(tableIndexes.get("ix_partial_unique").partialIndexExpression).toBe("(id > 99)");
  });

  it("should have columns.", () => {
    expect(tableIndexes.get("ix_columns").columns.map((c) => c.name)).toEqual(["id", "name"]);
    expect(tableIndexes.get("ix_column_and_expression").columns.map((c) => c.name)).toEqual(["id"]);
  });

  it("should have columns and expressions.", () => {
    const expected = ["id", "lower((name)::text)"];
    expect(tableIndexes.get("ix_column_and_expression").columnsAndExpressions.map((c) => (typeof c === "string" ? c : c.name))).toEqual(
      expected
    );
  });
});
