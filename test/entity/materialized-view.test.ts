import { Db, MaterializedView } from "../../src/index";
import getDb from "../test-helper/get-db";

let db: Db;
let mView: MaterializedView;

beforeAll(async () => {
  db = await getDb();
  mView = db.get("public.mv_contact_other_schema_cart") as MaterializedView;
});

describe("MaterializedView", () => {
  it("should be a MaterializedView.", () => {
    expect(mView).toBeInstanceOf(MaterializedView);
  });
});
