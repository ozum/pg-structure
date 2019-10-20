import { Db, ForeignKey } from "../../src/index";
import getDb from "../test-helper/get-db";

let db: Db;
let fk: ForeignKey;

beforeAll(async () => {
  db = await getDb();
  fk = db.tables.get("contact").foreignKeys.get("contact_primary_account");
});

describe("Constraint", () => {
  it("should have table", () => {
    expect(fk.table.name).toBe("contact");
  });

  it("should have schema", () => {
    expect(fk.schema.name).toBe("public");
  });
});
