import { Db, BaseType } from "../../src/index";
import getDb from "../test-helper/get-db";

let db: Db;
let hstoreType: BaseType;

beforeAll(async () => {
  db = await getDb();
  hstoreType = db.schemas.get("extra_modules").types.get("hstore") as BaseType;
});

describe("BaseType", () => {
  it("should be base type.", () => {
    expect(hstoreType).toBeInstanceOf(BaseType);
  });
});
