/* eslint-disable prefer-destructuring */

import { Db, Table } from "../../src/index";
import getDb, {
  getRelationNameDb,
  getReverseRelationNameDb,
  getDescriptiveNameDb,
  getReverseDescriptiveNameDb,
} from "../test-helper/get-db";

let db: Db;
let nameDb: Db;
let reverseDb: Db;
let descriptiveDb: Db;
let reverseDescriptiveDb: Db;
let studentTable: Table;

const getNames = (table: string): string[][] => [
  (nameDb.get(table) as Table).o2mRelations.map((r) => r.name),
  (reverseDb.get(table) as Table).o2mRelations.map((r) => r.name),
  (descriptiveDb.get(table) as Table).o2mRelations.map((r) => r.name),
  (reverseDescriptiveDb.get(table) as Table).o2mRelations.map((r) => r.name),
];

beforeAll(async () => {
  db = await getDb();
  nameDb = await getRelationNameDb();
  reverseDb = await getReverseRelationNameDb();
  descriptiveDb = await getDescriptiveNameDb();
  reverseDescriptiveDb = await getReverseDescriptiveNameDb();
  studentTable = nameDb.get("public.student") as Table;
});

describe("O2MRelation", () => {
  it("should be type of 'o2m'.", () => {
    expect(studentTable.o2mRelations[0].type).toEqual("o2m");
  });

  it("should be toMany.", () => {
    expect(studentTable.o2mRelations[0].toMany).toEqual(true);
  });

  it("should have sourceTable.", () => {
    expect(studentTable.o2mRelations[0].sourceTable.name).toEqual("student");
  });

  it("should have targetTable.", () => {
    expect(studentTable.o2mRelations[0].targetTable.name).toEqual("message");
  });

  it("should have foreignKey.", () => {
    expect(studentTable.o2mRelations[0].foreignKey.name).toEqual("message_receiver_student");
  });

  it("should have sourceAlias.", () => {
    expect(studentTable.o2mRelations[0].sourceAlias).toEqual("receiver_student");
  });

  it("should have camel case name.", () => {
    expect(db.tables.get("PartGroup").o2mRelations[0].name).toEqual("PartGroupParts");
  });

  describe("Names", () => {
    it("should have shortest names for 'difficulty' table.", () => {
      const expectedShort = ["main_games", "other_games", "popular_games"];
      const expectedDescriptive = ["max_difficulty_main_games", "max_difficulty_other_games", "min_difficulty_popular_games"];
      const result = getNames("public.difficulty");

      expect(result[0]).toEqual(expectedShort);
      expect(result[1]).toEqual(expectedShort);
      expect(result[2]).toEqual(expectedDescriptive);
      expect(result[3]).toEqual(expectedDescriptive);
    });

    it("should have shortest names for 'class' table.", () => {
      const expectedShort = ["registries"];
      const expectedDescriptive = ["registries"];
      const result = getNames("public.class");

      expect(result[0]).toEqual(expectedShort);
      expect(result[1]).toEqual(expectedShort);
      expect(result[2]).toEqual(expectedDescriptive);
      expect(result[3]).toEqual(expectedDescriptive);
    });

    it("should have shortest names for 'student' table.", () => {
      const expectedShort = ["receiver_messages", "registries", "sender_messages"];
      const expectedDescriptive = ["receiver_student_messages", "registries", "sender_student_messages"];
      const result = getNames("public.student");

      expect(result[0]).toEqual(expectedShort);
      expect(result[1]).toEqual(expectedShort);
      expect(result[2]).toEqual(expectedDescriptive);
      expect(result[3]).toEqual(expectedDescriptive);
    });

    it("should have shortest names for 'option' table.", () => {
      const expectedShort = ["bike_options", "main_cars", "second_cars"];
      const expectedDescriptive = ["bike_options", "first_option_main_cars", "second_option_second_cars"];
      const result = getNames("public.option");

      expect(result[0]).toEqual(expectedShort);
      expect(result[1]).toEqual(expectedShort);
      expect(result[2]).toEqual(expectedDescriptive);
      expect(result[3]).toEqual(expectedDescriptive);
    });

    it("should have shortest names for 'color' table.", () => {
      const expectedShort = ["shirts", "shoes"];
      const expectedDescriptive = ["shirts", "shoes"];
      const result = getNames("public.color");

      expect(result[0]).toEqual(expectedShort);
      expect(result[1]).toEqual(expectedShort);
      expect(result[2]).toEqual(expectedDescriptive);
      expect(result[3]).toEqual(expectedDescriptive);
    });

    it("should have shortest names for 'size' table.", () => {
      const expectedShort = ["shirts", "shoes"];
      const expectedDescriptive = ["shirts", "shoes"];
      const result = getNames("public.size");

      expect(result[0]).toEqual(expectedShort);
      expect(result[1]).toEqual(expectedShort);
      expect(result[2]).toEqual(expectedDescriptive);
      expect(result[3]).toEqual(expectedDescriptive);
    });

    it("should have shortest names for 'product' table.", () => {
      const expectedShort = ["alternative_cart_line_items", "cancelled_items", "favorite_items", "main_cart_line_items"];
      const expectedDescriptive = [
        "alternative_product_cart_line_items",
        "cancelled_items",
        "favorite_items",
        "main_product_cart_line_items",
      ];
      const result = getNames("public.product");

      expect(result[0]).toEqual(expectedShort);
      expect(result[1]).toEqual(expectedShort);
      expect(result[2]).toEqual(expectedDescriptive);
      expect(result[3]).toEqual(expectedDescriptive);
    });

    it("should have shortest names for 'cart' table.", () => {
      const expectedShort = ["cancelled_items", "favorite_items", "first_cart_line_items", "second_cart_line_items"];
      const expectedDescriptive = ["cancelled_items", "favorite_items", "first_cart_cart_line_items", "second_cart_cart_line_items"];
      const result = getNames("public.cart");

      expect(result[0]).toEqual(expectedShort);
      expect(result[1]).toEqual(expectedShort);
      expect(result[2]).toEqual(expectedDescriptive);
      expect(result[3]).toEqual(expectedDescriptive);
    });
  });
});
