import { Db, Trigger } from "../src/index";
import getDb from "./test-helper/get-db";

let db: Db;
let accountTrigger: Trigger;

beforeAll(async () => {
  db = await getDb();
  accountTrigger = db.schemas.get("public").tables.get("account").triggers.get("account_trigger");
});

describe("Trigger", () => {
  it("should exist.", () => {
    // Test that we can find a trigger with and without the WHEN clause.
    const withWhen = db.schemas.get("public").tables.get("account").triggers.get("account_trigger", { throwUnknown: false });
    expect(withWhen).not.toBeUndefined();
    const withoutWhen = db.schemas.get("public").tables.get("account").triggers.get("account_updated_at", { throwUnknown: false });
    expect(withoutWhen).not.toBeUndefined();
  });

  it("should have name.", () => {
    expect(accountTrigger.name).toBe("account_trigger");
  });

  it("should have table.", () => {
    expect(accountTrigger?.table?.name).toBe("account");
  });

  it("should have view.", () => {
    expect(accountTrigger?.view?.name).toBeUndefined();
  });

  it("should have schema.", () => {
    expect(accountTrigger.schema.name).toBe("public");
  });

  it("should have full name.", () => {
    expect(accountTrigger.fullName).toBe("public.account.account_trigger");
  });

  it("should have events.", () => {
    expect(accountTrigger.events).toEqual(["insert", "delete", "update"]);
  });

  it("should have function.", () => {
    expect(accountTrigger.function.name).toBe("trigger_returning_function");
  });
});
