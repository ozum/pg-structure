import { Db, RangeType } from "../../src/index";
import getDb from "../test-helper/get-db";

let db: Db;
let rangeType: RangeType;

beforeAll(async () => {
  db = await getDb();
  rangeType = db.types.get("udt_range") as RangeType;
});

describe("Domain", () => {
  it("should be EnumType.", () => {
    expect(rangeType).toBeInstanceOf(RangeType);
  });
});
