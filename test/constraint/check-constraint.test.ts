/* eslint-disable prefer-destructuring */

import { Db, CheckConstraint, Domain } from "../../src/index";
import getDb from "../test-helper/get-db";

let db: Db;
let constraint: CheckConstraint;
let domainCheckConstraint: CheckConstraint;

beforeAll(async () => {
  db = await getDb();
  constraint = db.tables.get("account").checkConstraints[0];
  domainCheckConstraint = (db.types.get("price") as Domain).checkConstraints[0]; // eslint-disable-line prefer-destructuring
});

describe("CheckConstraint", () => {
  it("should have full name", () => {
    expect(constraint.fullName).toBe("public.account.account_update_later");
  });

  it("should have expression", () => {
    expect(constraint.expression).toContain("(created_at <= updated_at)");
  });

  it("should have full name as a domain check constraint.", () => {
    expect(domainCheckConstraint.fullName).toBe("public.price.price_check");
  });
});
