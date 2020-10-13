/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client, ClientConfig } from "pg";
import { parse } from "pg-connection-string";
import { Action, MatchType, RelationNameFunctions, BuiltinRelationNameFunctions } from "./types/index";
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
import { executeSqlFile, getPgClient, getQueryVersionFor } from "./util/helper";
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
import NormalFunction from "./pg-structure/function/normal-function";
import Procedure from "./pg-structure/function/procedure";
import AggregateFunction from "./pg-structure/function/aggregate-function";
import WindowFunction from "./pg-structure/function/window-function";
import PseudoType from "./pg-structure/type/pseudo-type";
import Trigger from "./pg-structure/trigger";

export { default as Column } from "./pg-structure/column";
export { default as Db } from "./pg-structure/db";
export { default as Index } from "./pg-structure";
export { default as Schema } from "./pg-structure/schema";
export { default as Constraint } from "./pg-structure/base/constraint";
export { default as DbObject } from "./pg-structure/base/db-object";
export { default as Entity } from "./pg-structure/base/entity";
export { default as Relation } from "./pg-structure/base/relation";
export { default as Type } from "./pg-structure/base/type";
export { default as CheckConstraint } from "./pg-structure/constraint/check-constraint";
export { default as ExclusionConstraint } from "./pg-structure/constraint/exclusion-constraint";
export { default as ForeignKey } from "./pg-structure/constraint/foreign-key";
export { default as PrimaryKey } from "./pg-structure/constraint/primary-key";
export { default as UniqueConstraint } from "./pg-structure/constraint/unique-constraint";
export { default as MaterializedView } from "./pg-structure/entity/materialized-view";
export { default as Sequence } from "./pg-structure/entity/sequence";
export { default as Table } from "./pg-structure/entity/table";
export { default as View } from "./pg-structure/entity/view";
export { default as M2MRelation } from "./pg-structure/relation/m2m-relation";
export { default as M2ORelation } from "./pg-structure/relation/m2o-relation";
export { default as O2MRelation } from "./pg-structure/relation/o2m-relation";
export { default as BaseType } from "./pg-structure/type/base-type";
export { default as CompositeType } from "./pg-structure/type/composite-type";
export { default as Domain } from "./pg-structure/type/domain";
export { default as EnumType } from "./pg-structure/type/enum-type";
export { default as PseudoType } from "./pg-structure/type/pseudo-type";
export { default as RangeType } from "./pg-structure/type/range-type";
export { default as Func } from "./pg-structure/base/func";
export { default as NormalFunction } from "./pg-structure/function/normal-function";
export { default as Procedure } from "./pg-structure/function/procedure";
export { default as AggregateFunction } from "./pg-structure/function/aggregate-function";
export { default as FunctionArgument } from "./pg-structure/function-argument";
export { default as WindowFunction } from "./pg-structure/function/window-function";
export { default as Trigger } from "./pg-structure/trigger";
export * from "./types/index";

/** @ignore */
interface Options {
  name?: string;
  includeSchemas?: string | string[];
  excludeSchemas?: string | string[];
  includeSystemSchemas?: boolean;
  /**
   * Character to separate {@link ForeignKey.sourceAlias source alias} and {@link ForeignKey.targetAlias target alias}
   * in {@link ForeignKey foreign key} name.
   */
  foreignKeyAliasSeparator?: string;
  foreignKeyAliasTargetFirst?: boolean;

  /**
   * Optional function to generate names for relationships. If not provided, default naming functions are used.
   * All necessary information such as {@link Table table} names, {@link Column columns}, {@link ForeignKey foreign key},
   * {@link DbObject.commentData comment data} can be accessed via passed {@link Relation relation} parameter.
   *
   * It is also possible to use one of the builtin naming functions: `short`, `descriptive`.
   *
   * @example
   * const config = {
   *   relationNameFunctions: {
   *     o2m: (relation) => some_func(relation.foreignKey.name),
   *     m2o: (relation) => some_func(relation.foreignKey.name),
   *     m2m: (relation) => some_func(relation.foreignKey.name),
   *   },
   * }
   *
   * const config2 = {
   *   relationNameFunctions: "short",
   * }
   */
  relationNameFunctions?: RelationNameFunctions | BuiltinRelationNameFunctions;

  /**
   * Tag name to extract JSON data from from database object's comments. For example by default JSON data between `[pg-structure][/pg-structure]`
   * is available imn database objects. Data can be retrieved with {@link DbObject.commentData commentData} method.
   *
   * @example
   * const config = {
   *   commentDataToken: "pg-structure"
   * }
   *
   * // Assuming `[pg-structure]{ level: 3 }[/pg-structure]` is written in database table comment/description.
   * const someData = db.get("public.account").commentData; // { level: 3 }
   */
  commentDataToken?: string;

  /** Prevents pg-strucrture to close given database connection. */
  keepConnection?: boolean;
}

/**
 * Returns database name.
 *
 * @ignore
 * @param pgClientOrConfig is input to get database name from.
 * @returns database name.
 */
/* istanbul ignore next */
function getDatabaseName(pgClientOrConfig: Client | ClientConfig | string): string {
  if (pgClientOrConfig instanceof Client) {
    return "database";
  }
  return (typeof pgClientOrConfig === "string" ? parse(pgClientOrConfig).database : pgClientOrConfig.database) || "database";
}

/**
 * Returns list of schames in database. If no patterns are given returns all schemas except system schemas.
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
  const includedPatterns = include.concat(system && include.length > 0 ? ["information_schema", "pg_%"] : []);
  const excludedPatterns = exclude.concat(system ? [] : ["information_schema", "pg_%"]);

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
  const typeKinds = { d: Domain, e: EnumType, b: BaseType, c: CompositeType, r: RangeType, p: PseudoType }; // https://www.postgresql.org/docs/9.5/catalog-pg-type.html
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
    if (row.kind === "r") schema.tables.push(new Table({ ...row, schema }));
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
    const parent = (row.parentKind === "c"
      ? db.typesIncludingEntities.get(row.parentOid as any, { key: "classOid" })
      : db.entities.get(row.parentOid as any, { key: "oid" })) as CompositeType | Entity;

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
      const columnOrExpression = position > 0 ? parent.columns.find((c) => c.attributeNumber === position)! : (indexExpressions.shift() as string);
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
): Promise<QueryResults> {
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
 * Creates and returns [[Db]] object which represents given database's structure. It is possible to include or exclude some schemas
 * using options. Please note that if included schemas contain references (i.e. foreign key to other schema or type in other schema)
 * to non-included schema, throws exception.
 *
 * @param pgClientOrConfig is connection string or [node-postgres client](https://node-postgres.com/api/client) or [node-postgres client](https://node-postgres.com/api/client) configuration.
 * @param name is name of the database. This is inferred if possible from client or connection string.
 * @param commentDataToken is tag name to extract JSON data from from database object's comments. For example by default JSON data between `[pg-structure][/pg-structure]` is available imn database objects. Data can be retrieved with {@link DbObject.commentData commentData} method.
 * @param includeSchemas is pattern similar to `SQL LIKE` (i.e `public_%`) or list of schemas to include.
 * @param excludeSchemas is pattern similar to `SQL LIKE` (i.e `public_%`) or list of schemas to exclude.
 * @param includeSystemSchemas is whether to include PostgreSQL system schemas (i.e. `pg_catalog`) from database.
 * @param foreignKeyAliasSeparator is character to separate {@link ForeignKey.sourceAlias source alias} and {@link ForeignKey.targetAlias target alias} in {@link ForeignKey foreign key} name. For example: `prime_color,product`.
 * @param foreignKeyAliasTargetFirst is whether first part of the foreign key aliases contains target alias (i.e `company_employees`) or source alias (i.e. `employee_company`).
 * @param relationNameFunctions Optional functions to generate names for relationships. If not provided, default naming functions are used. All necessary information such as {@link Table table} names, {@link Column columns}, {@link ForeignKey foreign key}, {@link DbObject.commentData comment data} can be accessed via passed {@link Relation relation} parameter. It is also possible to use one of the builtin naming functions such as `short`, `descriptive`.
 * @returns [[Db]] object which represents given database's structure.
 */
export default async function pgStructure(
  pgClientOrConfig: Client | ClientConfig | string,
  {
    name,
    commentDataToken = "pg-structure",
    includeSchemas,
    excludeSchemas,
    includeSystemSchemas,
    foreignKeyAliasSeparator = ",",
    foreignKeyAliasTargetFirst = false,
    relationNameFunctions = "short",
    keepConnection = false,
  }: Options = {}
): Promise<Db> {
  const { client, closeConnectionAfter } = await getPgClient(pgClientOrConfig);

  const includeSchemasArray = Array.isArray(includeSchemas) || includeSchemas === undefined ? includeSchemas : [includeSchemas];
  const excludeSchemasArray = Array.isArray(excludeSchemas) || excludeSchemas === undefined ? excludeSchemas : [excludeSchemas];

  const serverVersion = (await client.query("SHOW server_version")).rows[0].server_version;
  const queryResults = await getQueryResultsFromDb(serverVersion, client, includeSchemasArray, excludeSchemasArray, includeSystemSchemas);

  const db = new Db(
    { name: name || getDatabaseName(pgClientOrConfig), serverVersion },
    {
      commentDataToken,
      relationNameFunctions,
      foreignKeyAliasSeparator,
      foreignKeyAliasTargetFirst,
    },
    queryResults
  );

  addObjects(db, queryResults);

  if (!keepConnection && closeConnectionAfter) client.end(); // If a connected client is provided, do not close connection.
  return db;
}

/**
 * Deserializes given data to create [[Db]] object.
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
  const db = new Db({ name: data.name, serverVersion: data.serverVersion }, data.config, data.queryResults);
  addObjects(db, data.queryResults);
  return db;
}
