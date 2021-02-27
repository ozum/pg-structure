import { Db, O2MRelation, Table } from "../../src/index";
import getDb from "../test-helper/get-db";

let db: Db;
let o2mRelation: O2MRelation;

beforeAll(async () => {
  db = await getDb();
  o2mRelation = db.tables.get("account").o2mRelations.get("primary_contacts");
});

describe("constraint", () => {
  it("should have table.", () => {
    expect(o2mRelation.sourceTable.name).toBe("account");
  });

  it("should have name.", () => {
    expect(o2mRelation.name).toBe("primary_contacts");
  });

  it("should get source name without.", () => {
    const rel = (db.get("public.cart_line_item") as Table).m2oRelations.get("first_cart");
    expect(rel.sourceName).toBe("cart_line_item");
    expect(rel.getSourceNameWithout("target")).toBe("line_item");
  });

  it("should get target adjective.", () => {
    expect((db.get("public.cart_line_item") as Table).m2oRelations.get("first_cart").targetAdjective).toBe("first");
  });
});
