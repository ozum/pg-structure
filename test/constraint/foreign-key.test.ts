import { Db, ForeignKey, MatchType, Action } from "../../src/index";
import getDb from "../test-helper/get-db";

let db: Db;
let fk: ForeignKey;

beforeAll(async () => {
  db = await getDb();
  fk = db.tables.get("contact").foreignKeys.get("contact_primary_account");
});

describe("ForeignKey", () => {
  it("should have full name", () => {
    expect(fk.fullName).toBe("public.contact.contact_primary_account");
  });

  it("should have matchType", () => {
    expect(fk.matchType).toBe(MatchType.Simple);
  });

  it("should have onUpdate.", () => {
    expect(fk.onUpdate).toBe(Action.Cascade);
  });

  it("should have onDelete.", () => {
    expect(fk.onDelete).toBe(Action.Cascade);
  });

  it("should have index.", () => {
    expect(fk.index.name).toBe("KeyEntity11");
  });

  it("should have columns.", () => {
    expect(fk.columns[0].name).toBe("primary_account_id");
  });

  it("should have referencedTable.", () => {
    expect(fk.referencedTable.name).toBe("account");
  });

  it("should have referencedColumns.", () => {
    expect(fk.referencedColumns[0].name).toBe("id");
  });

  it("should have referencedColumnsBy.", () => {
    expect(fk.referencedColumnsBy).toEqual([
      {
        column: db.get("public.contact.primary_account_id"),
        references: db.get("public.account.id"),
      },
    ]);
  });
});
