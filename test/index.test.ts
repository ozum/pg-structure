import IndexableArray from "indexable-array";
import { Db, Index, Table } from "../src/index";
import getDb from "./test-helper/get-db";

let db: Db;
let table: Table;
let indexes: IndexableArray<Index, "name", never, true>;

beforeAll(async () => {
  db = await getDb();
  table = db.get("public.account") as Table;
  indexes = table.indexes;
});

describe("Index", () => {
  it("should have name.", () => {
    expect(indexes.get("ix_expression").name).toBe("ix_expression");
  });

  it("should have full name.", () => {
    expect(indexes.get("ix_expression").fullName).toBe("public.account.ix_expression");
  });

  it("should have oid.", () => {
    expect(indexes.get("ix_expression").oid).toBeDefined();
  });

  it("should have table.", () => {
    expect(indexes.get("ix_expression").table.name).toBe("account");
  });

  it("should have schema.", () => {
    expect(indexes.get("ix_expression").schema.name).toBe("public");
  });

  it("should have expression.", () => {
    expect(indexes.get("ix_expression").columnsAndExpressions[0]).toBe("lower((name)::text)");
  });

  it("should have partial attribute.", () => {
    expect(indexes.get("ix_partial_unique").isPartial).toBe(true);
  });

  it("should have unique attribute.", () => {
    expect(indexes.get("ix_partial_unique").isUnique).toBe(true);
  });

  it("should have isExclusion attribute.", () => {
    expect(indexes.get("ix_exclude").isExclusion).toBe(true);
  });

  it("should have isPrimaryKey attribute.", () => {
    expect(indexes.get("KeyEntity11").isPrimaryKey).toBe(true);
  });

  it("should have partialIndexExpression attribute.", () => {
    expect(indexes.get("ix_partial_unique").partialIndexExpression).toBe("(id > 99)");
  });

  it("should have columns.", () => {
    expect(indexes.get("ix_columns").columns.map(c => c.name)).toEqual(["id", "name"]);
    expect(indexes.get("ix_column_and_expression").columns.map(c => c.name)).toEqual(["id"]);
  });

  it("should have columns and expressions.", () => {
    const expected = ["id", "lower((name)::text)"];
    expect(indexes.get("ix_column_and_expression").columnsAndExpressions.map(c => (typeof c === "string" ? c : c.name))).toEqual(expected);
  });
});
