import { Db, Func, CompositeType } from "../src/index";
import getDb from "./test-helper/get-db";

let db: Db;
let func: Func;

beforeAll(async () => {
  db = await getDb();
  func = db.schemas.get("public").functions.get("record_returning_function");
});

describe("Argument", () => {
  it("should have type.", () => {
    expect((func.arguments.get("arg3").type as CompositeType).columns[0].name).toBe("o_field_1");
  });

  it("should have isArray.", () => {
    expect(func.arguments.get("argIO2").isArray).toBe(true);
  });

  it("should have mode.", () => {
    expect(func.arguments.get("argVar").mode).toBe("variadic");
  });
});
