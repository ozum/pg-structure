import { Db, Trigger } from "../src/index";
import getDb from "./test-helper/get-db";

let db: Db;
let trigger: Trigger;

beforeAll(async () => {
  db = await getDb();
  trigger = db.schemas.get("public").tables.get("account").triggers.get("account_trigger");
});

describe("Trigger", () => {
  it("should have name.", () => {
    expect(trigger.name).toBe("account_trigger");
  });

  it("should have table.", () => {
    expect(trigger?.table?.name).toBe("account");
  });

  it("should have view.", () => {
    expect(trigger?.view?.name).toBeUndefined();
  });

  it("should have schema.", () => {
    expect(trigger.schema.name).toBe("public");
  });

  it("should have full name.", () => {
    expect(trigger.fullName).toBe("public.account.account_trigger");
  });

  it("should have events.", () => {
    expect(trigger.events).toEqual(["insert", "delete", "update"]);
  });

  it("should have function.", () => {
    expect(trigger.function.name).toBe("trigger_returning_function");
  });
});
