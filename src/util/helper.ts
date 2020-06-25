import fs from "fs";
import JSON5 from "json5";
import { Client, ClientConfig } from "pg";
import { join } from "path";
import memoize from "fast-memoize";
import { JSONData } from "../types/json";
import { CaseType } from "../types";
import { TypeQueryResult, EntityQueryResult, ColumnQueryResult, IndexQueryResult, ConstraintQueryResult } from "../types/query-result";
import Schema from "../pg-structure/schema";
import Db from "../pg-structure/db";
import BuiltInType from "../pg-structure/type/built-in-type";
import Table from "../pg-structure/entity/table";
import M2MRelation from "../pg-structure/relation/m2m-relation";
import memoizeSerializer from "./memoize-serializer";

const { readFile } = fs.promises;

/**
 * Extracts JSON5 between given tokens such as `[pg-structure]` and `[/pg-structure]` tags,
 * converts it to object and returns created object.
 *
 * @ignore
 * @param token is the token to search.
 * @param input is th string to extract JSON from.
 * @returns object created from JSON. Undefined if no input is provided or no token is found.
 * @example
 * let meta = extractJSON('Some comment [pg]{"type": "post"}[/pg]', "pg"); // meta = { type: 'post' }
 * let othr = extractJSON('Some comment [xx]{"type": "post"}[/xx]', "xx"); // othr = { type: 'post' }
 */
export function extractJSON(token: string, input?: string): JSONData | undefined {
  /* istanbul ignore next */
  if (!token) {
    throw new Error("Token is required.");
  }
  if (!input) {
    return undefined;
  }

  const reJSON = new RegExp(`\\s*?\\[${token}]((.|[\\s])+?)\\[\\/${token}]\\s*?`, "im");
  const json = reJSON.exec(input);
  return json ? JSON5.parse(json[1]) : undefined;
}

/**
 * Replaces JSON between given tokens such as `[pg-structure]` and `[/pg-structure]` tags including tags.
 *
 * @ignore
 * @param token is the token to search.
 * @param input is the string to replace JSON part.
 * @returns new string. Undefined if no input is provided.
 * @example
 * let meta = replaceJSON('Some comment [pg]{"type": "post"}[/pg]', "pg"); // meta = Some content
 * let othr = replaceJSON('Some comment [xx]{"type": "post"}[/xx]', "xx"); // othr = Some content
 */
export function replaceJSON(token: string, input?: string): string | undefined {
  /* istanbul ignore next */
  if (!token) {
    throw new Error("Token is required.");
  }
  if (!input) {
    return undefined;
  }

  const reJSON = new RegExp(`\\s*?\\[${token}]((.|[\\s])+?)\\[\\/${token}]\\s*?`, "im");
  return input.replace(reJSON, "");
}

/**
 * Parses enum labels defined in PostgreSQL and returns as an array of string values. PostgreSQL returns enum values
 * as comma separated values between curly braces. If string contains a comma, it wraps string with double quotes.
 * fk function considers fk situation.
 *
 * @ignore
 * @param values are enum values.
 * @returns enum labels as an array. If column is not an enum returns null.
 */
export function parseEnumValues(values: string | string[]): string[] {
  /* istanbul ignore next */
  if (Array.isArray(values)) {
    return values;
  }

  // Strip curly braces: {}
  const valuesWithoutCurlyBraces = values.substr(1, values.length - 2);

  // Split by comma considering quoted strings which includes comma.
  return (valuesWithoutCurlyBraces.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || []).map((value: string): string => {
    // Strip quotes at start and end of string;
    return value.charAt(0) === '"' && value.charAt(value.length - 1) === '"' ? value.substr(1, value.length - 2) : value;
  });
}

/**
 * Returns case type (CamelCase or snake_case) of the given string. Please note, fk function
 * uses simple checks and does not check comprehensively considering all language variations.
 *
 * @ignore
 * @param input is the string to get case type for.
 * @returns case type of the string.
 */
export function caseTypeOf(input: string): CaseType {
  const alphaName = input.replace(/\d/g, "");
  return alphaName.charAt(0).toUpperCase() === alphaName.charAt(0) ? CaseType.CamelCase : CaseType.SnakeCase;
}

/**
 * Executes given sql file and assign callback function an error events for the query.
 *
 * @ignore
 * @param file is SQL file
 * @param client is node-postgres client to query database.
 * @param schemas is PostgreSQL schemas to be used in query.
 * @param eventCallback is callback to call on 'row' event.
 * @returns void promise
 */
export async function executeSqlFile(file: "type.sql", client: Client, schemas: any[]): Promise<TypeQueryResult[]>;
export async function executeSqlFile(file: "entity.sql", client: Client, schemas: any[]): Promise<EntityQueryResult[]>;
export async function executeSqlFile(file: "column.sql", client: Client, schemas: any[]): Promise<ColumnQueryResult[]>;
export async function executeSqlFile(file: "index.sql", client: Client, schemas: any[]): Promise<IndexQueryResult[]>;
export async function executeSqlFile(file: "constraint.sql", client: Client, schemas: any[]): Promise<ConstraintQueryResult[]>;
export async function executeSqlFile(file: string, client: Client, schemas: any[]): Promise<Record<string, any>[]> {
  const filePath = join(__dirname, "../../module-files/sql", file);
  const sql = await readFile(filePath, "utf8");
  const result = await client.query(sql, [schemas]);
  return result.rows;
}

/**
 * Returns whether given argument is a PostgreSQL client or pool.
 * @returns boolean
 */
function isPgClient(pgClientOrConfig: any): pgClientOrConfig is Client {
  return typeof pgClientOrConfig.query === "function" && typeof pgClientOrConfig.connect === "function";
}

/**
 * Returns pg client. If given object is already pg client returns it directly, otherwise creates pg object
 * based on given options.
 *
 * @ignore
 * @param is pg client or Connection parameters.
 * @returns pg client.
 */
export async function getPgClient(
  pgClientOrConfig: Client | ClientConfig | string
): Promise<{ client: Client; closeConnectionAfter: boolean }> {
  let closeConnectionAfter = false;

  if (isPgClient(pgClientOrConfig)) {
    if (!(pgClientOrConfig as any)._connected) {
      await pgClientOrConfig.connect();
      closeConnectionAfter = true;
    }
    return { client: pgClientOrConfig, closeConnectionAfter };
  }

  const client = new Client(pgClientOrConfig);
  await client.connect();
  return { client, closeConnectionAfter: true };
}

/**
 * Returns given value after replacing type cast.
 *
 * @ignore
 * @param defaultWithTypeCast is default value with type cast.
 * @returns default value without type cast.
 * @example
 * replaceTypeCast("'George'::character varying"); // 'George'
 */
export function replaceTypeCast(defaultWithTypeCast: string | number | boolean | null): number | boolean | string | null {
  if (defaultWithTypeCast === null || typeof defaultWithTypeCast === "boolean" || typeof defaultWithTypeCast === "number") {
    return defaultWithTypeCast;
  }
  return defaultWithTypeCast.replace(/^('.*?')::.+$/, "$1");
}

/**
 * Checks whether given ddefault value is a serial type.
 *
 * @ignore
 * @param defaultValue is the default value to test whether it is serial type.
 * @returns whether default value is a serial.
 */
export function isSerial(defaultValue: string | null): boolean {
  return defaultValue !== null && defaultValue.startsWith("nextval");
}

/**
 * Removes quotes around given string and returns it.
 *
 * @ignore
 * @param input is string to remove quotes from.
 * @returns unquoted string.
 */
export function unquote(input: string): string {
  let result = input;
  const reg = /['"]/;

  if (!result) {
    return "";
  }

  if (reg.test(result.charAt(0))) {
    result = result.substr(1);
  }
  if (reg.test(result.charAt(result.length - 1))) {
    result = result.substr(0, result.length - 1);
  }
  return result;
}

/**
 * Parses SQL type name returned from `format_type(type_oid, typemod)` PostgrSQL System Information Function.
 * such as `character varying(20)`, `numeric(3,2)`, `extra_modules."extra-domain"[]`, `timestamp(0) without time zone` etc.
 *
 * @ignore
 * @param sqlType is SQL type name returned from `format_type` PostgrSQL System Information Function.
 * @returns type details.
 */
export function parseSQLType(
  db: Db,
  sqlType: string
): { schema: Schema; typeName: string; length?: number; precision?: number; scale?: number } {
  const modifierRegExp = /\((.+?)\)/;
  const match = modifierRegExp.exec(sqlType); // Match modifiers such as (1,2) or (2)
  const modifiers = match ? match[1].split(",").map((n) => parseInt(n, 10)) : [];
  const parts = sqlType
    .replace("[]", "") // Remove [] from arrays
    .replace(modifierRegExp, "") // Remove modifier numbers (1), (1,2)
    .split(".");
  const schemaName = parts.length === 2 ? unquote(parts[0]) : undefined;
  const typeName = unquote(parts.length === 2 ? parts[1] : parts[0]);
  const builtInType = !schemaName
    ? (db._systemSchema.typesIncludingEntities.getMaybe(typeName) as BuiltInType) ||
      (db._systemSchema.typesIncludingEntities.getMaybe(typeName, { key: "shortName" }) as BuiltInType)
    : undefined;
  const schema = builtInType ? db._systemSchema : (db.schemas.get(schemaName || "public") as Schema);

  return {
    schema,
    typeName,
    length: builtInType && builtInType.hasLength ? modifiers[0] : undefined,
    precision: builtInType && builtInType.hasPrecision ? modifiers[0] : undefined,
    scale: builtInType && builtInType.hasScale ? modifiers[1] : undefined,
  };
}

/**
 * Finds and returns duplicate names from given Indexable array.
 *
 * @ignore
 * @param accessor is one of the attribute names of the Table class which is type of [[IndexableArray]].
 * @returns duplicate names.
 */
export function getDuplicateNames(indexableArray: { name: string }[]): string[] {
  const seen: { [name: string]: number } = {};
  const duplicates: string[] = [];

  indexableArray.forEach((element: { name: string }) => {
    const { name } = element;
    const count = seen[name] || 0;

    if (count === 1) {
      duplicates.push(name);
    }
    seen[name] = count + 1;
  });
  return duplicates;
}

// Memoize uses JSON.stringify to cache arguments. DB objects has circular data structures which cannot be serialized. Below are manually memoized functions:
/**
 * Memoized function to get foreign keys from source table to target table.
 * @hidden
 */
export const getForeignKeysTo = memoize(
  (source: Table, target?: Table) => source.foreignKeys.filter((fk) => fk.referencedTable === target),
  {
    serializer: memoizeSerializer,
  }
);

/**
 * Creates a summary table in markdown format for all relations in database.
 *
 * @ignore
 * @returns markdown table.
 *
 * @example
 * pgStructure({ database: "db", user: "user", password: "password" }).then(db => {
 *  console.log(getRelationsMarkdown(db));
 *  console.log(db.relationNameCollisions);
 * });
 */
export function getRelationsMarkdown(db: Db, fk = false): string {
  let result: string[] = [
    `| Tables | Type | Short | Descriptive |   | ${fk ? "Foreign Key |" : ""}`,
    `| ------ | ---- | ----- |------------ | - | ${fk ? "--- |" : ""}`,
  ];

  db.tables.forEach((t) => {
    const rels = t.relations.map((r) => {
      const tables = `${r.sourceTable.name}_ → ${r instanceof M2MRelation ? " ... →" : ""} _${r.targetTable.name}`;
      const type = r.constructor.name.replace("Relation", "");
      const short = r.getName("short");
      const descriptive = r.getName("descriptive");
      const diff = short === descriptive ? "" : "•";

      return `| _${tables}_ | ${type} | **${short}** | **${descriptive}** | ${diff} | ${fk ? `_${r.foreignKey.name}_ |` : ""}`;
    });
    result = result.concat(rels);
  });
  return result.join("\n");
}
