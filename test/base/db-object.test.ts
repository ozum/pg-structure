import { Db, Table } from "../../src/index";
import getDb from "../test-helper/get-db";

let db: Db;
let table: Table;

beforeAll(async () => {
  db = await getDb();
  table = db.get("public.type_table") as Table;
});

describe("DbObject", () => {
  it("should have name.", () => {
    expect(table.name).toBe("type_table");
  });

  it("should have schema.", () => {
    expect(table.schema.name).toBe("public");
  });

  it("should have db.", () => {
    expect(table.db).toBe(db);
  });

  it("should have comment.", () => {
    expect(table.comment).toBe('Type Table Description. [pg-structure]{ jsonKey: "json value" }[/pg-structure]');
  });

  it("should have comment without data.", () => {
    expect(table.commentWithoutData).toBe("Type Table Description.");
  });

  it("should have comment data.", () => {
    expect(table.commentData).toEqual({ jsonKey: "json value" });
  });

  it("should throw if comment data is unparsable.", () => {
    expect(() => table.get("default_empty_string").commentData).toThrow("JSON5: invalid character");
  });

  it("should return undefined comment data if no data is available.", () => {
    expect(table.get("field1_a").commentData).toBeUndefined();
  });

  it("should return undefined comment data if no comment is available.", () => {
    expect(table.get("field1_b").commentData).toBeUndefined();
  });

  it("should return undefined comment without data if no comment is available.", () => {
    expect(table.get("field1_b").commentWithoutData).toBeUndefined();
  });
});
