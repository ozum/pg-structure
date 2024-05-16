/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client, ClientConfig } from "pg";
import { parse } from "pg-connection-string";
import dotenv from "dotenv";
import { Action, MatchType, Options } from "./types/index";
import {
  SchemaQueryResult,
  TypeQueryResult,
  EntityQueryResult,
  ColumnQueryResult,
  IndexQueryResult,
  ConstraintQueryResult,
  ActionLetter,
  MatchTypeLetter,
  QueryResults,
  FunctionQueryResult,
  TriggerQueryResult,
} from "./types/query-result";
import { executeSqlFile, getConnectedPgClient, getQueryVersionFor, getEnvValues, arrify } from "./util/helper";
import Db from "./pg-structure/db";
import Schema from "./pg-structure/schema";

import Domain from "./pg-structure/type/domain";
import EnumType from "./pg-structure/type/enum-type";
import BaseType from "./pg-structure/type/base-type";
import CompositeType from "./pg-structure/type/composite-type";
import Table from "./pg-structure/entity/table";
import View from "./pg-structure/entity/view";
import MaterializedView from "./pg-structure/entity/materialized-view";
import Sequence from "./pg-structure/entity/sequence";
import Entity from "./pg-structure/base/entity";
import Column from "./pg-structure/column";
import Index from "./pg-structure";
import PrimaryKey from "./pg-structure/constraint/primary-key";
import UniqueConstraint from "./pg-structure/constraint/unique-constraint";
import CheckConstraint from "./pg-structure/constraint/check-constraint";
import ExclusionConstraint from "./pg-structure/constraint/exclusion-constraint";
import ForeignKey from "./pg-structure/constraint/foreign-key";

import RangeType from "./pg-structure/type/range-type";
import MultiRangeType from "./pg-structure/type/multi-range-type";
import NormalFunction from "./pg-structure/function/normal-function";
import Procedure from "./pg-structure/function/procedure";
import AggregateFunction from "./pg-structure/function/aggregate-function";
import WindowFunction from "./pg-structure/function/window-function";
import PseudoType from "./pg-structure/type/pseudo-type";
import Trigger from "./pg-structure/trigger";
import getRelationNameFunctions from "./util/naming-function";

dotenv.config();

/**
 * Returns database name.
 *
 * @ignore
 * @param pgClientOrConfig is input to get database name from.
 * @returns database name.
 */
/* istanbul ignore next */
function getDatabaseName(pgClientOrConfig: Client | ClientConfig | string): string {
  if (!pgClientOrConfig || pgClientOrConfig instanceof Client) {
    return "database";
  }
  return (typeof pgClientOrConfig === "string" ? parse(pgClientOrConfig).database : pgClientOrConfig.database) || "database";
}

/**
 * Returns list of schemes in database. If no patterns are given returns all schemas except system schemas.
 * Patterns are feeded to `LIKE` operator of SQL, so `%` and `_` may be used.
 *
 * @ignore
 * @param client is pg client.
 * @param include is pattern to be used in SQL query `LIKE` part.
 * @param exclude is pattern to be used in SQL query `NOT LIKE` part.
 * @param system is whether to include system schemas in result.
 * @returns array of objects describing schemas.
 */
async function getSchemas(
  client: Client,
  { include = [], exclude = [], system = false }: { include?: string[]; exclude?: string[]; system?: boolean }
): Promise<SchemaQueryResult[]> {
  const where: string[] = ["NOT pg_is_other_temp_schema(oid)", "nspname <> 'pg_toast'"];
  const whereInclude: string[] = [];
  const parameters: string[] = [];
  const includedPatterns = include.concat(system && include.length > 0 ? ["information\\_schema", "pg\\_%"] : []);
  const excludedPatterns = exclude.concat(system ? [] : ["information\\_schema", "pg\\_%"]);

  includedPatterns.forEach((pattern, i) => {
    whereInclude.push(`nspname LIKE $${i + 1}`); // nspname LIKE $1
    parameters.push(pattern);
  });

  if (whereInclude.length > 0) where.push(`(${whereInclude.join(" OR ")})`);

  excludedPatterns.forEach((pattern, i) => {
    where.push(`nspname NOT LIKE $${i + include.length + 1}`); // nspname NOT LIKE $2
    parameters.push(pattern);
  });

  const whereQuery = `WHERE ${where.join(" AND ")}`;
  const sql = `SELECT oid, nspname AS name, obj_description(oid, 'pg_namespace') AS comment FROM pg_namespace ${whereQuery} ORDER BY nspname`;
  const result = await client.query(sql, parameters);
  return result.rows;
}

/**
 * Returns list of system schames required by pg-structure.
 * Patterns are feeded to `LIKE` operator of SQL, so `%` and `_` may be used.
 *
 * @ignore
 * @param client is pg client.
 * @returns array of objects describing schemas.
 */
async function getSystemSchemas(client: Client): Promise<SchemaQueryResult[]> {
  const sql = `SELECT oid, nspname AS name, obj_description(oid, 'pg_namespace') AS comment FROM pg_namespace WHERE nspname IN ('pg_catalog') ORDER BY nspname`;
  return (await client.query(sql)).rows;
}

/**
 * Adds system schemas required by pg-structure.
 *
 * @ignore
 * @param db is Db object.
 */
function addSystemSchemas(db: Db, rows: SchemaQueryResult[]): void {
  rows.forEach((row) => db.systemSchemas.push(new Schema({ ...row, db })));
}

/**
 * Adds schema instances to database.
 *
 * @ignore
 * @param db is Db object.
 */
function addSchemas(db: Db, rows: SchemaQueryResult[]): void {
  rows.forEach((row) => db.schemas.push(new Schema({ ...row, db })));
}

const builtinTypeAliases: Record<string, Record<string, string | boolean>> = {
  int2: { name: "smallint" },
  int4: { name: "integer", shortName: "int" },
  int8: { name: "bigint" },
  numeric: { internalName: "decimal", hasPrecision: true, hasScale: true },
  float4: { name: "real" },
  float8: { name: "double precision" },
  varchar: { name: "character varying", hasLength: true },
  char: { name: "character", hasLength: true },
  timestamp: { name: "timestamp without time zone", hasPrecision: true },
  timestamptz: { name: "timestamp with time zone", hasPrecision: true },
  time: { name: "time without time zone", hasPrecision: true },
  timetz: { name: "time with time zone", hasPrecision: true },
  interval: { hasPrecision: true },
  bool: { name: "boolean" },
  bit: { hasLength: true },
  varbit: { name: "bit varying", hasLength: true },
};

/**
 * Adds types to database.
 *
 * @ignore
 * @param db  is DB object
 * @param rows are query result of types to be added.
 */
function addTypes(db: Db, rows: TypeQueryResult[]): void {
  const typeKinds = { d: Domain, e: EnumType, b: BaseType, c: CompositeType, r: RangeType, p: PseudoType, m: MultiRangeType }; // https://www.postgresql.org/docs/9.5/catalog-pg-type.html
  rows.forEach((row) => {
    const schema = db.systemSchemas.getMaybe(row.schemaOid, { key: "oid" }) || db.schemas.get(row.schemaOid, { key: "oid" });
    const builtinTypeData = builtinTypeAliases[row.name] ? { internalName: row.name, ...builtinTypeAliases[row.name] } : {};
    const kind = row.kind as keyof typeof typeKinds;
    const type = new typeKinds[kind]({ ...row, ...builtinTypeData, schema, sqlType: row.sqlType as string }); // Only domain type has `sqlType` and it's required.
    schema.typesIncludingEntities.push(type);
  });
}

/**
 * Adds entities to database.
 *
 * @ignore
 * @param db  is DB object
 * @param rows are query result of entities to be added.
 */
function addEntities(db: Db, rows: EntityQueryResult[]): void {
  rows.forEach((row) => {
    const schema = db.schemas.get(row.schemaOid, { key: "oid" }) as Schema;

    /* istanbul ignore else */
    if (row.kind === "r" || row.kind === "p") schema.tables.push(new Table({ ...row, schema }));
    else if (row.kind === "v") schema.views.push(new View({ ...row, schema }));
    else if (row.kind === "m") schema.materializedViews.push(new MaterializedView({ ...row, schema }));
    else if (row.kind === "S") schema.sequences.push(new Sequence({ ...row, schema }));
  });
}

/**
 * Adds columns to database.
 *
 * @ignore
 * @param db  is DB object
 * @param rows are query result of columns to be added.
 */
function addColumns(db: Db, rows: ColumnQueryResult[]): void {
  rows.forEach((row) => {
    const parent = (
      row.parentKind === "c"
        ? db.typesIncludingEntities.get(row.parentOid as any, { key: "classOid" })
        : db.entities.get(row.parentOid as any, { key: "oid" })
    ) as CompositeType | Entity;

    parent.columns.push(new Column({ parent, ...row }));
  });
}

/**
 * Adds indexes to database.
 *
 * @ignore
 * @param db  is DB object
 * @param rows are query result of indexes to be added.
 */
function addIndexes(db: Db, rows: IndexQueryResult[]): void {
  rows.forEach((row) => {
    const parent = db.entities.get(row.tableOid, { key: "oid" }) as Table | MaterializedView;
    const index = new Index({ ...row, parent });
    const indexExpressions = [...row.indexExpressions]; // Non column reference index expressions.

    row.columnPositions.forEach((position) => {
      // If position is 0, then it's an index attribute that is not simple column references. It is an expression which is stored in indexExpressions.
      const columnOrExpression = (
        position > 0 ? parent.columns.find((c: Column) => c.attributeNumber === position) : indexExpressions.shift()
      ) as string | Column;
      index.columnsAndExpressions.push(columnOrExpression);
    });

    parent.indexes.push(index);
  });
}

/**
 * Add functions to database.
 *
 * @ignore
 * @param db is DB object.
 * @param rows are query result of functions to be added.
 */
function addFunctions(db: Db, rows: FunctionQueryResult[]): void {
  rows.forEach((row) => {
    const schema = db.schemas.get(row.schemaOid, { key: "oid" }) as Schema;

    /* istanbul ignore else */
    if (row.kind === "f") schema.normalFunctions.push(new NormalFunction({ ...row, schema }));
    else if (row.kind === "p") schema.procedures.push(new Procedure({ ...row, schema }));
    else if (row.kind === "a") schema.aggregateFunctions.push(new AggregateFunction({ ...row, schema }));
    else if (row.kind === "w") schema.windowFunctions.push(new WindowFunction({ ...row, schema }));
  });
}

/**
 *
 * @ignore
 * @param db is DB object.
 * @param rows are query result of triggers to be added.
 */
function addTriggers(db: Db, rows: TriggerQueryResult[]): void {
  rows.forEach((row) => {
    const entity = db.entities.get(row.entityOid, { key: "oid" }) as Table | View;
    const func = db.functions.get(row.functionOid, { key: "oid" });
    entity.triggers.push(new Trigger({ ...row, function: func, parent: entity }));
  });
}

/**
 * Adds constraints to database.
 *
 * @ignore
 * @param db  is DB object
 * @param rows are query result of constraints to be added.
 */
function addConstraints(db: Db, rows: ConstraintQueryResult[]): void {
  const actionLetterMap: { [key in ActionLetter]: Action } = {
    a: Action.NoAction,
    r: Action.Restrict,
    c: Action.Cascade,
    n: Action.SetNull,
    d: Action.SetDefault,
  };

  const matchTypeLetterMap: { [key in MatchTypeLetter]: MatchType } = {
    f: MatchType.Full,
    p: MatchType.Partial,
    s: MatchType.Simple,
  };

  rows.forEach((row) => {
    const table = db.tables.getMaybe(row.tableOid, { key: "oid" });
    const index = db.indexes.getMaybe(row.indexOid, { key: "oid" }) as Index;
    const domain = db.typesIncludingEntities.getMaybe(row.typeOid, { key: "oid" }) as Domain | undefined;

    /* istanbul ignore else */
    if (table) {
      /* istanbul ignore else */
      if (row.kind === "p") table.constraints.push(new PrimaryKey({ ...row, index, table }));
      else if (row.kind === "u") table.constraints.push(new UniqueConstraint({ ...row, index, table }));
      else if (row.kind === "x") table.constraints.push(new ExclusionConstraint({ ...row, index, table }));
      else if (row.kind === "c") table.constraints.push(new CheckConstraint({ ...row, table, expression: row.checkConstraintExpression }));
      else if (row.kind === "f") {
        const foreignKey = new ForeignKey({
          ...row,
          table,
          index,
          columns: row.constrainedColumnPositions.map((pos) => table.columns.get(pos, { key: "attributeNumber" })) as Column[],
          onUpdate: actionLetterMap[row.onUpdate],
          onDelete: actionLetterMap[row.onDelete],
          matchType: matchTypeLetterMap[row.matchType],
        });

        table.constraints.push(foreignKey);
        foreignKey.referencedTable.foreignKeysToThis.push(foreignKey);
      }
    } else if (domain) {
      /* istanbul ignore else */
      if (row.kind === "c") {
        domain.checkConstraints.push(new CheckConstraint({ ...row, domain, expression: row.checkConstraintExpression }));
      }
    }
  });
}

/**
 * Returns results of SQL queries of meta data.
 *
 * @ignore
 */
async function getQueryResultsFromDb(
  serverVersion: string,
  client: Client,
  includeSchemasArray?: string[],
  excludeSchemasArray?: string[],
  includeSystemSchemas?: boolean
  // ): Promise<QueryResults> {
): Promise<any> {
  const schemaRows = await getSchemas(client, { include: includeSchemasArray, exclude: excludeSchemasArray, system: includeSystemSchemas });
  const systemSchemaRows = await getSystemSchemas(client);
  const schemaOids = schemaRows.map((schema) => schema.oid);
  const schemaOidsIncludingSystem = schemaOids.concat(systemSchemaRows.map((schema) => schema.oid));
  const queryVersions = await getQueryVersionFor(serverVersion);

  return Promise.all([
    schemaRows,
    systemSchemaRows,
    executeSqlFile(queryVersions, "type", client, schemaOidsIncludingSystem),
    executeSqlFile(queryVersions, "entity", client, schemaOids),
    executeSqlFile(queryVersions, "column", client, schemaOids),
    executeSqlFile(queryVersions, "index", client, schemaOids),
    executeSqlFile(queryVersions, "constraint", client, schemaOids),
    executeSqlFile(queryVersions, "function", client, schemaOids),
    executeSqlFile(queryVersions, "trigger", client, schemaOids),
  ]);
}

/**
 * Adds database objects to database.
 *
 * @ignore
 * @param db  is DB object
 * @param queryResults are query results to get object details from.
 */
function addObjects(db: Db, queryResults: QueryResults): void {
  addSchemas(db, queryResults[0]);
  addSystemSchemas(db, queryResults[1]);
  addTypes(db, queryResults[2]);
  addEntities(db, queryResults[3]);
  addColumns(db, queryResults[4]);
  addIndexes(db, queryResults[5]);
  addConstraints(db, queryResults[6]);
  addFunctions(db, queryResults[7]);
  addTriggers(db, queryResults[8]);
}

/**
 * Checks whether given object are options for the `pgStructure` function.
 *
 * @param input is the input to check.
 * @returns whether given input are options for the `pgStructure` function.
 */
function isOptions(input?: Client | ClientConfig | string | Options): input is Options {
  /* istanbul ignore next */
  if (input === undefined) return false;
  const optionsAvailable: Required<{ [K in keyof Options]: true }> = {
    envPrefix: true,
    name: true,
    commentDataToken: true,
    includeSchemas: true,
    excludeSchemas: true,
    includeSystemSchemas: true,
    foreignKeyAliasSeparator: true,
    foreignKeyAliasTargetFirst: true,
    relationNameFunctions: true,
    keepConnection: true,
  };

  return Object.keys(input).some((key) => Object.prototype.hasOwnProperty.call(optionsAvailable, key));
}

/**
 * Reverse engineers a PostgreSQL database and creates [[Db]] instance which represents given database's structure.
 * There are several options such as to include or exclude schemas, provide custom names to relations. Please refer to [[Options]]
 * for detailed explanations.
 *
 * **IMPORTANT:** Please note that if included schemas contain references to a non-included schema, this function throws exception.
 * (e.g. a foreign key to another schema or a type in another schema which is not included)
 *
 * @param client is either a [node-postgres client](https://node-postgres.com/api/client) or a configuration object or a connection string to create a [node-postgres client](https://node-postgres.com/api/client).
 * @param options are preferences to modify reverse engineering process.
 * @returns [[Db]] object which represents given database's structure.
 *
 * @example
 * const db = await pgStructure({ database: "db", user: "u", password: "pass" }, { includeSchemas: ["public"] });
 */
export async function pgStructure(client?: Client | ClientConfig | string, options?: Options): Promise<Db>;
/**
 * Reads configuration details from environment variables to create [node-postgres client](https://node-postgres.com/api/client).
 * Keys are upper case environment variables prefixed with `options.envPrefix` (default is `DB`).
 *
 * |Environment Varibale|[ClientConfig](https://node-postgres.com/api/client) Key|
 * |---|---|
 * |DB_DATABASE|database|
 * |DB_USER|user|
 * |DB_PASSWORD|password|
 * |...|...|
 *
 * @param options are preferences to modify reverse engineering process.
 * @returns [[Db]] object which represents given database's structure.
 *
 * @example
 * const db = await pgStructure({ includeSchemas: ["public"] });
 *
 * @example
 * const db = await pgStructure(); // Read connection details from environmet variables.
 */
export async function pgStructure(options?: Options): Promise<Db>;
export async function pgStructure(clientOrOptions?: Client | ClientConfig | string | Options, maybeOptions: Options = {}): Promise<Db> {
  const [maybePgClientOrConfig, options] = isOptions(clientOrOptions) ? [undefined, clientOrOptions] : [clientOrOptions, maybeOptions];
  /* istanbul ignore next */
  const pgClientOrConfig = maybePgClientOrConfig ?? getEnvValues(options.envPrefix ?? "DB");
  const { client, shouldCloseConnection } = await getConnectedPgClient(pgClientOrConfig);

  const serverVersion = (await client.query("SHOW server_version")).rows[0].server_version;
  const queryResults = await getQueryResultsFromDb(
    serverVersion,
    client,
    arrify(options.includeSchemas),
    arrify(options.excludeSchemas),
    options.includeSystemSchemas
  );

  const db = new Db(
    { name: options.name || getDatabaseName(pgClientOrConfig), serverVersion },
    {
      commentDataToken: options.commentDataToken ?? "pg-structure",
      relationNameFunctions: options.relationNameFunctions ?? "short",
      foreignKeyAliasSeparator: options.foreignKeyAliasSeparator ?? ",",
      foreignKeyAliasTargetFirst: options.foreignKeyAliasTargetFirst ?? false,
    },
    queryResults,
    getRelationNameFunctions(options.relationNameFunctions ?? "short")
  );

  addObjects(db, queryResults);

  if (!options.keepConnection && shouldCloseConnection) client.end(); // If a connected client is provided, do not close connection.
  return db;
}

/**
 * Deserializes given data to create [[Db]] object. Please note that custom relation name functions are not serialized.
 * To serialize, provide functions as a module and use them with `{ relationNameFunctions: "my-module" }`.
 *
 * @param serializedData is serialized data of the `Db` object.
 * @returns [[Db]] object for given serialized data.
 * @example
 * import pgStructure, { deserialize } from "pg-structure";
 * const db = await pgStructure({ database: "db", user: "u", password: "pass" });
 * const serialized = db.serialize();
 * const otherDb = deserialize(serialized);
 */
export function deserialize(serializedData: string): Db {
  const data = JSON.parse(serializedData);
  const db = new Db(
    { name: data.name, serverVersion: data.serverVersion },
    data.config,
    data.queryResults,
    getRelationNameFunctions(data.config.relationNameFunctions)
  );
  addObjects(db, data.queryResults);
  return db;
}
