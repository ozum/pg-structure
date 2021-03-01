/* eslint-disable prefer-destructuring */

import { Db, Table } from "../../src/index";
import { getRelationNameDb, getReverseRelationNameDb, getDescriptiveNameDb, getReverseDescriptiveNameDb } from "../test-helper/get-db";

let db: Db;
let reverseDb: Db;
let descriptiveDb: Db;
let reverseDescriptiveDb: Db;
let studentTable: Table;
let cartTable: Table;

const getNames = (table: string): string[][] => [
  (db.get(table) as Table).m2mRelations.map((r) => r.name),
  (reverseDb.get(table) as Table).m2mRelations.map((r) => r.name),
  (descriptiveDb.get(table) as Table).m2mRelations.map((r) => r.name),
  (reverseDescriptiveDb.get(table) as Table).m2mRelations.map((r) => r.name),
];

beforeAll(async () => {
  db = await getRelationNameDb();
  reverseDb = await getReverseRelationNameDb();
  descriptiveDb = await getDescriptiveNameDb();
  reverseDescriptiveDb = await getReverseDescriptiveNameDb();
  studentTable = db.get("public.student") as Table;
  cartTable = db.get("public.cart") as Table;
});

describe("M2MRelation", () => {
  it("should be type of 'm2m'.", () => {
    expect(studentTable.m2mRelations[0].type).toEqual("m2m");
  });

  it("should be toMany.", () => {
    expect(studentTable.m2mRelations[0].toMany).toEqual(true);
  });

  it("should have sourceTable.", () => {
    expect(studentTable.m2mRelations[0].sourceTable.name).toEqual("student");
  });

  it("should have joinTable.", () => {
    expect(studentTable.m2mRelations[0].joinTable.name).toEqual("registry");
  });

  it("should have targetTable.", () => {
    expect(studentTable.m2mRelations[0].targetTable.name).toEqual("class");
  });

  it("should have foreignKey.", () => {
    expect(studentTable.m2mRelations[0].foreignKey.name).toEqual("registry_member_student");
  });

  it("should have targetForeignKey.", () => {
    expect(studentTable.m2mRelations[0].targetForeignKey.name).toEqual("registry_class");
  });

  it("should have info.", () => {
    expect(studentTable.m2mRelations[0].info).toBe(
      "[public.student]――― registry_member_student ――⥷ [public.registry] ⭃―― public.registry.registry_class ―――[public.class]"
    );
  });

  it("should get source name.", () => {
    expect(cartTable.m2mRelations.get("cancelled_item_products").sourceName).toBe("cart");
    expect(cartTable.m2mRelations.get("cancelled_item_products").getSourceNameWithout("any")).toBe("");
  });

  it("should get source alias.", () => {
    expect(cartTable.m2mRelations.get("cancelled_item_products").sourceAlias).toBe("cart");
    expect(cartTable.m2mRelations.get("cancelled_item_products").getSourceAliasWithout("any")).toBe("");
  });

  it("should get source adjective.", () => {
    expect(cartTable.m2mRelations.get("cancelled_item_products").sourceAdjective).toBeUndefined();
  });

  it("should get join name.", () => {
    expect(cartTable.m2mRelations.get("cancelled_item_products").joinName).toBe("cancelled_item");
    expect(cartTable.m2mRelations.get("cancelled_item_products").getJoinNameWithout("any")).toBe("");
  });

  it("should get join alias.", () => {
    expect(cartTable.m2mRelations.get("favorite_item_products").joinAlias).toBe("favorite_item");
    expect(cartTable.m2mRelations.get("favorite_item_products").getJoinAliasWithout("join")).toBe("");
  });

  it("should get join adjective.", () => {
    expect(cartTable.m2mRelations.get("cancelled_item_products").joinAdjective).toBeUndefined();
  });

  it("should get target name.", () => {
    expect(cartTable.m2mRelations.get("cancelled_item_products").targetName).toBe("product");
  });

  it("should get target alias.", () => {
    expect(cartTable.m2mRelations.get("cancelled_item_products").targetAlias).toBe("first_product");
    expect(cartTable.m2mRelations.get("cancelled_item_products").getTargetAliasWithout("target")).toBe("first");
  });

  it("should get target adjective.", () => {
    expect(cartTable.m2mRelations.get("cancelled_item_products").targetAdjective).toBe("first");
  });

  describe("Names", () => {
    it("should be shortest names for 'size' table.", () => {
      const expectedShort = ["shirt_colors", "shoe_colors"];
      const expectedDescriptive = ["shirt_colors", "shoe_colors"];
      const result = getNames("public.size");

      expect(result[0]).toEqual(expectedShort);
      expect(result[1]).toEqual(expectedShort);
      expect(result[2]).toEqual(expectedDescriptive);
      expect(result[3]).toEqual(expectedDescriptive);
    });

    it("should be shortest names for 'color' table.", () => {
      const expectedShort = ["shirt_sizes", "shoe_sizes"];
      const expectedDescriptive = ["shirt_sizes", "shoe_sizes"];
      const result = getNames("public.color");

      expect(result[0]).toEqual(expectedShort);
      expect(result[1]).toEqual(expectedShort);
      expect(result[2]).toEqual(expectedDescriptive);
      expect(result[3]).toEqual(expectedDescriptive);
    });

    it("should be shortest names for 'status' table.", () => {
      const expectedShort = ["receiver_students", "sender_students"];
      const expectedDescriptive = ["receiver_students", "sender_students"];
      const result = getNames("public.status");

      expect(result[0]).toEqual(expectedShort);
      expect(result[1]).toEqual(expectedShort);
      expect(result[2]).toEqual(expectedDescriptive);
      expect(result[3]).toEqual(expectedDescriptive);
    });

    it("should be shortest names for 'student' table.", () => {
      const expectedShort = ["classes", "receiver_statuses", "receiver_students", "sender_statuses", "sender_students"];
      const expectedDescriptive = [
        "classes",
        "receiver_students",
        "receiver_student_statuses",
        "sender_students",
        "sender_student_statuses",
      ];
      const result = getNames("public.student");

      expect(result[0]).toEqual(expectedShort);
      expect(result[1]).toEqual(expectedShort);
      expect(result[2]).toEqual(expectedDescriptive);
      expect(result[3]).toEqual(expectedDescriptive);
    });

    it("should be shortest names for 'class' table.", () => {
      const expectedShort = ["students"];
      const expectedDescriptive = ["students"];
      const result = getNames("public.class");

      expect(result[0]).toEqual(expectedShort);
      expect(result[1]).toEqual(expectedShort);
      expect(result[2]).toEqual(expectedDescriptive);
      expect(result[3]).toEqual(expectedDescriptive);
    });

    it("should be shortest names for 'product' table.", () => {
      const expectedShort = [
        "alternative_line_item_first_carts",
        "alternative_line_item_second_carts",
        "alternative_products",
        "cancelled_item_carts",
        "favorite_item_carts",
        "main_line_item_first_carts",
        "main_line_item_second_carts",
        "main_products",
      ];
      const expectedDescriptive = [
        "alternative_products",
        "alternative_product_line_item_first_carts",
        "alternative_product_line_item_second_carts",
        "cancelled_item_carts",
        "favorite_item_carts",
        "main_products",
        "main_product_line_item_first_carts",
        "main_product_line_item_second_carts",
      ];
      const result = getNames("public.product");

      expect(result[0]).toEqual(expectedShort);
      expect(result[1]).toEqual(expectedShort);
      expect(result[2]).toEqual(expectedDescriptive);
      expect(result[3]).toEqual(expectedDescriptive);
    });

    it("should be shortest names for 'cart' table.", () => {
      const expectedShort = [
        "cancelled_item_products",
        "favorite_item_products",
        "first_carts",
        "first_line_item_alternative_products",
        "first_line_item_main_products",
        "second_carts",
        "second_line_item_alternative_products",
        "second_line_item_main_products",
      ];
      const expectedDescriptive = [
        "cancelled_item_products",
        "favorite_item_products",
        "first_carts",
        "first_cart_cart_line_item_alternative_products",
        "first_cart_cart_line_item_main_products",
        "second_carts",
        "second_cart_cart_line_item_alternative_products",
        "second_cart_cart_line_item_main_products",
      ];
      const result = getNames("public.cart");

      expect(result[0]).toEqual(expectedShort);
      expect(result[1]).toEqual(expectedShort);
      expect(result[2]).toEqual(expectedDescriptive);
      expect(result[3]).toEqual(expectedDescriptive);
    });

    it("should be shortest names for 'bike' table.", () => {
      const expectedShort = ["options"];
      const expectedDescriptive = ["options"];
      const result = getNames("public.bike");

      expect(result[0]).toEqual(expectedShort);
      expect(result[1]).toEqual(expectedShort);
      expect(result[2]).toEqual(expectedDescriptive);
      expect(result[3]).toEqual(expectedDescriptive);
    });

    it("should be shortest names for 'option' table.", () => {
      const expectedShort = ["bikes", "first_options", "second_options"];
      const expectedDescriptive = ["bikes", "first_options", "second_options"];
      const result = getNames("public.option");

      expect(result[0]).toEqual(expectedShort);
      expect(result[1]).toEqual(expectedShort);
      expect(result[2]).toEqual(expectedDescriptive);
      expect(result[3]).toEqual(expectedDescriptive);
    });
  });
});
