import { Db, BuiltinType } from "../../src/index";
import getDb from "../test-helper/get-db";

let db: Db;
let numericType: BuiltinType;

beforeAll(async () => {
  db = await getDb();
  numericType = db._systemSchema.types.get("numeric") as BuiltinType;
});

describe("BuiltinType", () => {
  it("should be builtin type.", () => {
    expect(numericType).toBeInstanceOf(BuiltinType);
  });

  it("should have precision and scale attribute.", () => {
    expect(numericType.hasPrecision).toBe(true);
    expect(numericType.hasScale).toBe(true);
  });
});
