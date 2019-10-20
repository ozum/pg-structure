/* eslint-disable prefer-destructuring */

import { Db, Table, UniqueConstraint } from "../../src/index";
import getDb from "../test-helper/get-db";

let db: Db;
let constraint: UniqueConstraint;

beforeAll(async () => {
  db = await getDb();
  constraint = (db.get("public.account") as Table).uniqueConstraints[0];
});

describe("PrimaryKey", () => {
  it("should have full name.", () => {
    expect(constraint.fullName).toBe("public.account.account_unique_constraint");
  });

  it("should have index", () => {
    expect(constraint.index.name).toBe("account_unique_constraint");
  });

  it("should have columns", () => {
    expect(constraint.columns.length).toBe(2);
  });
});
