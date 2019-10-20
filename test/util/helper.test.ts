import memoize from "fast-memoize";
import { memoizeSerializer, unquote, replaceTypeCast, strip, parseEnumValues, getRelationsMarkdown } from "../../src/util/helper";
import getDb from "../test-helper/get-db";
import { Db } from "../../src";

let db: Db;

beforeAll(async () => {
  db = await getDb();
});

describe("memoizeSerializer()", () => {
  it("should serialize non db-object parameters", () => {
    const memoized = memoize((a: number, b: number) => a + b, {
      serializer: memoizeSerializer,
    });

    const result1 = memoized(4, 5);
    const result2 = memoized(4, 5);

    expect(result1).toBe(result2);
  });
});

describe("unquote()", () => {
  it("should return empty if no input provided.", () => {
    expect(unquote("")).toBe("");
  });
});

describe("getRelationsMarkdown()", () => {
  it("should generate markdown with foreign key", () => {
    expect(getRelationsMarkdown(db)).toBeDefined();
  });

  it("should generate markdown without foreign key", () => {
    expect(getRelationsMarkdown(db, true)).toBeDefined();
  });
});

describe("replaceTypeCast()", () => {
  it("should return numeric argument as it is.", () => {
    expect(replaceTypeCast(1)).toBe(1);
  });
});

describe("strip()", () => {
  it("should strip from middle.", () => {
    expect(strip("some_prefixed_table_other_table", "table")).toBe("some_prefixed_other_table");
  });

  it("should strip multiple string.", () => {
    expect(strip("some_prefixed_table_other_table", ["prefixed", "table"])).toBe("some_other_table");
  });
});

describe("parseEnumValues()", () => {
  it("should return empty array for unmatched atrings.", () => {
    expect(parseEnumValues("x")).toEqual([]);
  });
});
