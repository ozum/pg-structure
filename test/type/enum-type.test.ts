import { Db, EnumType } from "../../src/index";
import getDb from "../test-helper/get-db";

let db: Db;
let enumType: EnumType;

beforeAll(async () => {
  db = await getDb();
  enumType = db.types.get("udt_enum") as EnumType;
});

describe("Domain", () => {
  it("should be EnumType.", () => {
    expect(enumType).toBeInstanceOf(EnumType);
  });

  it("should have values.", () => {
    expect(enumType.values).toEqual(["option", '\\"quote\\"', 'with,comma and \\"quote\\"']);
  });
});
