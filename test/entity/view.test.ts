

import { Db, View } from "../../src/index";
import getDb from "../test-helper/get-db";

let db: Db;
let view: View;

beforeAll(async () => {
  db = await getDb();
  view = db.get("public.v_account_primary_contact") as View;
});

describe("View", () => {
  it("should be a View.", () => {
    expect(view).toBeInstanceOf(View);
  });
});
