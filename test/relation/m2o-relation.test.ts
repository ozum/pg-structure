/* eslint-disable prefer-destructuring */

import { Db, Table } from "../../src/index";
import { getRelationNameDb, getReverseRelationNameDb, getOptimalNameDb, getReverseOptimalNameDb } from "../test-helper/get-db";

let db: Db;
let reverseDb: Db;
let optimalDb: Db;
let reverseOptimalDb: Db;
let messageTable: Table;

const getNames = (table: string): string[][] => [
  (db.get(table) as Table).m2oRelations.map((r) => r.name),
  (reverseDb.get(table) as Table).m2oRelations.map((r) => r.name),
  (optimalDb.get(table) as Table).m2oRelations.map((r) => r.name),
  (reverseOptimalDb.get(table) as Table).m2oRelations.map((r) => r.name),
];

beforeAll(async () => {
  db = await getRelationNameDb();
  reverseDb = await getReverseRelationNameDb();
  optimalDb = await getOptimalNameDb();
  reverseOptimalDb = await getReverseOptimalNameDb();
  messageTable = db.get("public.message") as Table;
});

describe("M2ORelation", () => {
  it("should be type of 'm2o'.", () => {
    expect(messageTable.m2oRelations[0].type).toEqual("m2o");
  });

  it("should not be toMany.", () => {
    expect(messageTable.m2oRelations[0].toMany).toEqual(false);
  });

  it("should have sourceTable.", () => {
    expect(messageTable.m2oRelations[0].sourceTable.name).toEqual("message");
  });

  it("should have targetTable.", () => {
    expect(messageTable.m2oRelations[0].targetTable.name).toEqual("student");
  });

  it("should have foreignKey.", () => {
    expect(messageTable.m2oRelations[0].foreignKey.name).toEqual("message_receiver_student");
  });

  it("should have info.", () => {
    expect(messageTable.m2oRelations[0].info).toEqual("[public.message] ⭃―― message_receiver_student ―――[public.student]");
  });

  it("should have target alias.", () => {
    expect(messageTable.m2oRelations[0].targetAlias).toEqual("receiver_student");
  });

  it("should have name for foreign keys with alias separators.", () => {
    expect(db.tables.get("person").m2oRelations.get("main_group").targetAlias).toEqual("main_group");
    expect(reverseDb.tables.get("person").m2oRelations.get("main_group").targetAlias).toEqual("main_group");
  });

  it("should throw if functions are not compatible.", () => {
    expect(() => messageTable.m2oRelations[0].getName({ o2m: "j" } as any)).toThrow("No compatible");
  });

  it("should throw if module exports functions taht are not compatible.", () => {
    expect(() => messageTable.m2oRelations[0].getName(require.resolve("./m2o-relation.test"))).toThrow("does not export");
  });

  describe("Names", () => {
    it("should be shortest names for 'message' table.", () => {
      const expectedShort = ["receiver_student", "sender_student", "status"];
      const expectedOptimal = ["receiver_student", "sender_student", "status"];
      const result = getNames("public.message");

      expect(result[0]).toEqual(expectedShort);
      expect(result[1]).toEqual(expectedShort);
      expect(result[2]).toEqual(expectedOptimal);
      expect(result[3]).toEqual(expectedOptimal);
    });

    it("should be shortest names for 'registry' table.", () => {
      const expectedShort = ["class", "student"];
      const expectedOptimal = ["class", "student"];
      const result = getNames("public.registry");

      expect(result[0]).toEqual(expectedShort);
      expect(result[1]).toEqual(expectedShort);
      expect(result[2]).toEqual(expectedOptimal);
      expect(result[3]).toEqual(expectedOptimal);
    });

    it("should be shortest names for 'car' table.", () => {
      const expectedShort = ["first_option", "second_option"];
      const expectedOptimal = ["main_car_first_option", "second_car_second_option"];
      const result = getNames("public.car");

      expect(result[0]).toEqual(expectedShort);
      expect(result[1]).toEqual(expectedShort);
      expect(result[2]).toEqual(expectedOptimal);
      expect(result[3]).toEqual(expectedOptimal);
    });

    it("should be shortest names for 'shirt' table.", () => {
      const expectedShort = ["color", "size"];
      const expectedOptimal = ["color", "size"];
      const result = getNames("public.shirt");

      expect(result[0]).toEqual(expectedShort);
      expect(result[1]).toEqual(expectedShort);
      expect(result[2]).toEqual(expectedOptimal);
      expect(result[3]).toEqual(expectedOptimal);
    });

    it("should be shortest names for 'cart_line_item' table.", () => {
      const expectedShort = ["alternative_product", "first_cart", "main_product", "second_cart"];
      const expectedOptimal = ["alternative_product", "first_cart", "main_product", "second_cart"];
      const result = getNames("public.cart_line_item");

      expect(result[0]).toEqual(expectedShort);
      expect(result[1]).toEqual(expectedShort);
      expect(result[2]).toEqual(expectedOptimal);
      expect(result[3]).toEqual(expectedOptimal);
    });

    it("should be shortest names for 'bike_option' table.", () => {
      const expectedShort = ["bike", "option"];
      const expectedOptimal = ["bike", "option"];
      const result = getNames("public.bike_option");

      expect(result[0]).toEqual(expectedShort);
      expect(result[1]).toEqual(expectedShort);
      expect(result[2]).toEqual(expectedOptimal);
      expect(result[3]).toEqual(expectedOptimal);
    });

    it("should be shortest names for 'game' table.", () => {
      const expectedShort = ["max_difficulty", "max_difficulty", "min_difficulty"];
      const expectedOptimal = ["main_game_max_difficulty", "other_game_max_difficulty", "popular_game_min_difficulty"];
      const result = getNames("public.game");

      expect(result[0]).toEqual(expectedShort);
      expect(result[1]).toEqual(expectedShort);
      expect(result[2]).toEqual(expectedOptimal);
      expect(result[3]).toEqual(expectedOptimal);
    });
  });
});
