import { Db, BuiltInType } from "../../src/index";
import getDb from "../test-helper/get-db";

let db: Db;
let numericType: BuiltInType;

beforeAll(async () => {
  db = await getDb();
  numericType = db._systemSchema.types.get("numeric") as BuiltInType;
});

describe("BuiltinType", () => {
  it("should be builtin type.", () => {
    expect(numericType).toBeInstanceOf(BuiltInType);
  });

  it("should have precision and scale attribute.", () => {
    expect(numericType.hasPrecision).toBe(true);
    expect(numericType.hasScale).toBe(true);
  });
});
