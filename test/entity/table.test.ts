import { Db, Table, PrimaryKey } from "../../src/index";
import getDb from "../test-helper/get-db";

let db: Db;
let accountTable: Table;
let contactTable: Table;
let cartTable: Table;
let otherSchemaCartTable: Table;
let productTable: Table;
let studentTable: Table;
let classTable: Table;
// let classRegisterTable: Table;
// let message: Table;

beforeAll(async () => {
  db = await getDb();
  accountTable = db.get("public.account") as Table;
  contactTable = db.get("public.contact") as Table;
  cartTable = db.get("public.cart") as Table;
  otherSchemaCartTable = db.get("other_schema.cart") as Table;
  productTable = db.get("public.product") as Table;
  studentTable = db.get("public.student") as Table;
  classTable = db.get("public.class") as Table;
  // classRegisterTable = db.get("public.class_register") as Table;
  // message = db.get("public.message") as Table;
});

describe("Table", () => {
  it("should be a Table.", () => {
    expect(accountTable).toBeInstanceOf(Table);
  });

  it("should have constraints.", () => {
    expect(accountTable.constraints.map(c => c.name)).toEqual([
      "account_unique_constraint",
      "account_update_later",
      "ix_exclude",
      "KeyEntity11",
    ]);
    expect(accountTable.constraints.map(c => c.constructor.name)).toEqual([
      "UniqueConstraint",
      "CheckConstraint",
      "ExclusionConstraint",
      "PrimaryKey",
    ]);
  });

  it("should list foreign keys to itself.", () => {
    expect(accountTable.foreignKeysToThis.map(fk => fk.name)).toEqual(["contact_primary_account", "contact_secondary_account"]);
  });

  it("should list foreign keys from other table to this table.", () => {
    expect(accountTable.getForeignKeysFrom(contactTable).map(fk => fk.name)).toEqual([
      "contact_primary_account",
      "contact_secondary_account",
    ]);
    expect(otherSchemaCartTable.getForeignKeysFrom("contact").map(fk => fk.name)).toEqual([]);
  });

  it("should list foreign keys from this table to other table.", () => {
    expect(contactTable.getForeignKeysTo("account").map(fk => fk.name)).toEqual(["contact_primary_account", "contact_secondary_account"]);
    expect(otherSchemaCartTable.getForeignKeysTo("contact").map(fk => fk.name)).toEqual(["other_cart_contact"]);
  });

  it("should list join tables to other table.", () => {
    expect(cartTable.getJoinTablesTo("product").map(t => t.name)).toEqual(["cancelled_item", "cart_line_item"]);
    expect(otherSchemaCartTable.getJoinTablesTo("product").map(t => t.name)).toEqual([]);
  });

  it("should have indexes.", () => {
    expect(accountTable.indexes.map(i => i.name)).toEqual([
      "account_unique_constraint",
      "ix_column_and_expression",
      "ix_columns",
      "ix_exclude",
      "ix_expression",
      "ix_partial_unique",
      "KeyEntity11",
    ]);
  });

  it("should have separator.", () => {
    expect(accountTable.separator).toBe("_");
    expect(db.get("public.Part").separator).toBe("");
  });

  it("should list foreign keys", () => {
    expect(contactTable.foreignKeys.map(fk => fk.name)).toEqual(["contact_primary_account", "contact_secondary_account"]);
  });

  it("should list unique constraints.", () => {
    expect(accountTable.uniqueConstraints.map(c => c.name)).toEqual(["account_unique_constraint"]);
  });

  it("should list check constraints.", () => {
    expect(accountTable.checkConstraints.map(c => c.name)).toEqual(["account_update_later"]);
  });

  it("should list exclusion constraints.", () => {
    expect(accountTable.exclusionConstraints.map(c => c.name)).toEqual(["ix_exclude"]);
  });

  it("should have primary key.", () => {
    expect(accountTable.primaryKey).toBeInstanceOf(PrimaryKey);
  });

  it("should have hasManyTables attribute.", () => {
    expect(accountTable.hasManyTables.map(t => t.name)).toEqual(["contact", "contact"]);
  });

  it("should have belongsToTables attribute.", () => {
    expect(contactTable.belongsToTables.map(t => t.name)).toEqual(["account", "account"]);
  });

  it("should have belongsToManyTables attribute.", () => {
    expect(cartTable.belongsToManyTables.get("product")).toBe(productTable);
    expect(productTable.belongsToManyTables.get("cart")).toBe(cartTable);
    expect(studentTable.belongsToManyTables.get("student")).toBe(studentTable);
    expect(studentTable.belongsToManyTables.get("class")).toBe(classTable);
  });

  it("should have belongsToManyTablesPk attribute.", () => {
    expect(cartTable.belongsToManyTablesPk.get("product")).toBe(productTable);
    expect(productTable.belongsToManyTablesPk.get("cart")).toBe(cartTable);
    expect(studentTable.belongsToManyTablesPk.getMaybe("student")).toBeUndefined();
    expect(studentTable.belongsToManyTablesPk.get("class")).toBe(classTable);
  });

  it("should have m2m relations.", () => {
    expect(studentTable.m2mRelations.length).toBe(3);
    expect(productTable.m2mRelations.length).toBe(7);
  });

  it("should have m2m relationsPk.", () => {
    expect(studentTable.m2mRelationsPk.length).toBe(1);
  });

  it("should have o2m relations.", () => {
    expect(studentTable.m2mRelations.length).toBe(3);
  });

  it("should have m2o relations.", () => {
    expect(contactTable.m2oRelations.length).toBe(2);
  });

  it("should have relations.", () => {
    expect(studentTable.relations.length).toBe(6);
  });

  it("should have throughConstraints.", () => {
    expect(accountTable.get("name").name).toBe("name");
  });
});
