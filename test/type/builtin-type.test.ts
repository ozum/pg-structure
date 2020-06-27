import { Db, BaseType } from "../../src/index";
import getDb from "../test-helper/get-db";

let db: Db;
let numericType: BaseType;

beforeAll(async () => {
  db = await getDb();
  numericType = db.systemTypes.get("numeric") as BaseType;
});

describe("BuiltinType", () => {
  it("should be builtin type.", () => {
    expect(numericType).toBeInstanceOf(BaseType);
  });

  it("should have precision and scale attribute.", () => {
    expect(numericType.hasPrecision).toBe(true);
    expect(numericType.hasScale).toBe(true);
  });
});
