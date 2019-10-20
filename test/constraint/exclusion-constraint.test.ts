/* eslint-disable prefer-destructuring */

import { Db, ExclusionConstraint } from "../../src/index";
import getDb from "../test-helper/get-db";

let db: Db;
let constraint: ExclusionConstraint;

beforeAll(async () => {
  db = await getDb();
  constraint = db.tables.get("account").exclusionConstraints[0];
});

describe("CheckConstraint", () => {
  it("should have full name", () => {
    expect(constraint.fullName).toBe("public.account.ix_exclude");
  });

  it("should have index", () => {
    expect(constraint.index.name).toBe("ix_exclude");
  });
});
