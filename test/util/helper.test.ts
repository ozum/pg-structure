import memoize from "fast-memoize";
import { unquote, replaceTypeCast, parseEnumValues, getRelationsMarkdown, executeSqlFile, getEnvValues } from "../../src/util/helper";
import memoizeSerializer from "../../src/util/memoize-serializer";
import strip from "../../src/util/strip";
import getDb from "../test-helper/get-db";
import { Db } from "../../src";

let db: Db;

const mockClient = {
  query: async (sql?: string) => ({ rows: sql ? [] : undefined }),
};

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

describe("getEnvValues()", () => {
  it("should get environment variables.", () => {
    process.env.XYZ_DATABASE = "db";
    process.env.XYZ_USER = "user";
    process.env.XYZ_SOME_DATA = "data";
    expect(getEnvValues("XYZ")).toEqual({ database: "db", user: "user", someData: "data" });
  });
});

describe("getRelationsMarkdown()", () => {
  it("should generate markdown with foreign key.", () => {
    expect(getRelationsMarkdown(db)).toBeDefined();
  });

  it("should generate markdown without foreign key.", () => {
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

describe("executeSqlFile", () => {
  it("should execute query file.", async () => {
    const result = await executeSqlFile(["11", "9"], "function", mockClient as any, ["public"]);
    expect(result).toEqual([]);
  });

  it("should execute query file which best fits for given server version.", async () => {
    const result = await executeSqlFile(["11", "9"], "type", mockClient as any, ["public"]);
    expect(result).toEqual([]);
  });

  it("should throw if sutiable file cannot be found.", async () => {
    const result = executeSqlFile(["11", "9"], "xyz" as any, mockClient as any, ["public"]);
    await expect(result).rejects.toThrow("Cannot find xyz.sql");
  });
});
