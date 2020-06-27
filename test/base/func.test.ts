import { Db, Func } from "../../src/index";
import getDb from "../test-helper/get-db";

let db: Db;
let func: Func;

beforeAll(async () => {
  db = await getDb();
  func = db.schemas.get("public").functions.get("record_returning_function");
});

describe("Func", () => {
  it("should have oid.", () => {
    expect(func.oid).toBeDefined();
  });

  it("should have name.", () => {
    expect(func.name).toBe("record_returning_function");
  });

  it("should have full name.", () => {
    expect(func.fullName).toBe("public.record_returning_function");
  });

  it("should have language.", () => {
    expect(func.language).toBe("plpgsql");
  });

  it("should have arguments.", () => {
    expect(func.arguments[0].name).toBe("arg1");
  });

  it("should get arguments with required name.", () => {
    expect(func.arguments.get("arg2").name).toBe("arg2");
  });

  it("should get all arguments withhout name.", () => {
    expect(func.arguments.getAll("").map((a) => a.argumentNumber)).toEqual([5, 6]);
  });

  it("should return empty array for arguments if there are no arguments.", () => {
    const localFunc = db.schemas.get("public").functions.get("trigger_returning_function");
    expect(localFunc.arguments.map((a) => a.argumentNumber)).toEqual([]);
  });
});
