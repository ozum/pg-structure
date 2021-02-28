/* eslint-disable prefer-destructuring, @typescript-eslint/no-non-null-assertion  */
import { Db, Table, View, Column, CompositeType } from "../src/index";
import getDb from "./test-helper/get-db";

let db: Db;
let accountTable: Table;
let contactTable: Table;
let typeTable: Table;
let vAccountPrimaryContactView: View;
let idColumn: Column;
let compositeColumn: Column;

beforeAll(async () => {
  db = await getDb();
  accountTable = db.get("public.account") as Table;
  contactTable = db.get("public.contact") as Table;
  typeTable = db.get("public.type_table") as Table;
  compositeColumn = (db.types.get("udt_composite") as CompositeType).columns[0];
  idColumn = accountTable.get("id");
  vAccountPrimaryContactView = db.get("public.v_account_primary_contact") as View;
});

describe("Column", () => {
  it("should have name.", () => {
    expect(idColumn.attributeNumber).toBeGreaterThan(0);
  });

  it("should have parent.", () => {
    expect(idColumn.parent.name).toBe("account");
  });

  it("should have entity.", () => {
    expect(idColumn.entity!.name).toBe("account");
    expect(compositeColumn.entity).toBeUndefined();
  });

  it("should have table.", () => {
    expect(idColumn.table!.name).toBe("account");
    expect(compositeColumn.table).toBeUndefined();
  });

  it("should have view.", () => {
    expect(vAccountPrimaryContactView.get("account_id")!.view!.name).toBe("v_account_primary_contact");
    expect(compositeColumn.view).toBeUndefined();
  });

  it("should have parentalName.", () => {
    expect(idColumn.parentalName).toBe("account.id");
  });

  it("should have fullName.", () => {
    expect(idColumn.fullName).toBe("public.account.id");
  });

  it("should have fullCatalogName.", () => {
    expect(idColumn.fullCatalogName).toBe("pg-structure-test-main.public.account.id");
  });

  it("should have notNull.", () => {
    expect(idColumn.notNull).toBe(true);
    expect(accountTable.get("c").notNull).toBe(false);
  });

  it("should have type.", () => {
    expect(accountTable.get("c").type.name).toBe("circle");
  });

  it("should have isSerial.", () => {
    expect(idColumn.isSerial).toBe(true);
    expect(accountTable.get("c").isSerial).toBe(false);
  });

  it("should have scale.", () => {
    expect(idColumn.scale).toBeUndefined();
    expect(accountTable.get("created_at").scale).toBeUndefined();
    expect(accountTable.get("name").scale).toBeUndefined();
    expect(typeTable.get("field2_a").scale).toBe(undefined);
    expect(typeTable.get("field2_b").scale).toBe(2);
  });

  it("should have precision.", () => {
    expect(idColumn.precision).toBeUndefined();
    expect(typeTable.get("field2_a").precision).toBe(undefined);
    expect(typeTable.get("field2_b").precision).toBe(3);
    expect(typeTable.get("field7_b").precision).toBe(0);
  });

  it("should have arrayDimension.", () => {
    expect(idColumn.arrayDimension).toBe(0);
    expect(typeTable.get("a_field1").arrayDimension).toBe(1);
    expect(typeTable.get("a_field2").arrayDimension).toBe(2);
  });

  it("should have defaultWithTypeCast.", () => {
    expect(idColumn.defaultWithTypeCast).toBe("nextval('account_id_seq'::regclass)");
    expect(accountTable.get("created_at").defaultWithTypeCast).toBe("now()");
    expect(accountTable.get("name").defaultWithTypeCast).toBe("'no_name'::character varying");
    expect(typeTable.get("field11").defaultWithTypeCast).toBe("1");
  });

  it("should have default.", () => {
    expect(idColumn.default).toBe("nextval('account_id_seq'::regclass)");
    expect(accountTable.get("created_at").default).toBe("now()");
    expect(accountTable.get("name").default).toBe("'no_name'");
    expect(typeTable.get("field11").default).toBe("1");
  });

  it("should have foreignKeys.", () => {
    expect(contactTable.get("primary_account_id").foreignKeys.length).toBe(1);
    expect(contactTable.get("primary_account_id").foreignKeys[0].name).toBe("contact_primary_account");
    expect(compositeColumn.foreignKeys.length).toBe(0);
  });

  it("should have indexes.", () => {
    expect(accountTable.get("id").indexes.length).toBe(4);
    expect(compositeColumn.indexes.length).toBe(0);
    expect(accountTable.get("id").indexes.map((i) => i.name)).toEqual([
      "ix_column_and_expression",
      "ix_columns",
      "ix_partial_unique",
      "KeyEntity11",
    ]);
  });

  it("should have isForeignKey.", () => {
    expect(contactTable.get("primary_account_id").isForeignKey).toBe(true);
    expect(idColumn.isForeignKey).toBe(false);
  });

  it("should have isPrimaryKey.", () => {
    expect(contactTable.get("primary_account_id").isPrimaryKey).toBe(false);
    expect(idColumn.isPrimaryKey).toBe(true);
    expect(compositeColumn.isPrimaryKey).toBe(false);
  });

  it("should have length.", () => {
    expect(accountTable.get("name").length).toBe(20);
  });

  it("should have minimum value for serial column.", () => {
    expect(accountTable.get("id").minValue).toBe(1);
  });

  it("should have maximum value for serial column.", () => {
    expect(accountTable.get("id").maxValue).toBe(2147483647);
  });

  it("should not have minimum value for numeric column without precision.", () => {
    expect(typeTable.get("field2_a").minValue).toBe(undefined);
  });

  it("should not have maximum value for numeric column without precision.", () => {
    expect(typeTable.get("field2_a").maxValue).toBe(undefined);
  });

  it("should have minimum value for numeric column.", () => {
    expect(typeTable.get("field2_b").minValue).toBe(-10);
  });

  it("should have maximum value for numeric column.", () => {
    expect(typeTable.get("field2_b").maxValue).toBe(10);
  });

  it("should have minimum value for numeric column with only scale but without scale.", () => {
    expect(typeTable.get("field2_c").minValue).toBe(-1000);
  });

  it("should have maximum value for numeric column with only scale but without scale.", () => {
    expect(typeTable.get("field2_c").maxValue).toBe(1000);
  });

  it("should not have minimum value for floating column.", () => {
    expect(typeTable.get("field21").minValue).toBe(undefined);
  });

  it("should nt have maximum value for floating column.", () => {
    expect(typeTable.get("field21").maxValue).toBe(undefined);
  });

  it("should have referencedColumns.", () => {
    expect(contactTable.get("primary_account_id").referencedColumns.map((c) => c.name)).toEqual(["id"]);
    expect(idColumn.referencedColumns.length).toBe(0);
  });

  it("should have schema.", () => {
    expect(idColumn.schema.name).toBe("public");
  });

  it("should have uniqueIndexes.", () => {
    expect(idColumn.uniqueIndexes.map((i) => i.name)).toEqual(["ix_partial_unique", "KeyEntity11"]);
  });

  it("should have uniqueIndexesNoPk.", () => {
    expect(idColumn.uniqueIndexesNoPk.map((i) => i.name)).toEqual(["ix_partial_unique"]);
  });
});
