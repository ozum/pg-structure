import { Db, PrimaryKey, Table } from "../../src/index";
import getDb from "../test-helper/get-db";

let db: Db;
let pk: PrimaryKey;

beforeAll(async () => {
  db = await getDb();
  pk = (db.get("public.student") as Table).primaryKey as PrimaryKey;
});

describe("PrimaryKey", () => {
  it("should have full name.", () => {
    expect(pk.fullName).toBe("public.student.Key9");
  });

  it("should have index.", () => {
    expect(pk.index.name).toBe("Key9");
  });

  it("should have columns.", () => {
    expect(pk.columns.map((c) => c.name)).toEqual(["first_name", "middle_name", "last_name"]);
  });
});
