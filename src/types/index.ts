/* eslint-disable no-shadow */
import O2MRelation from "../pg-structure/relation/o2m-relation";
import M2ORelation from "../pg-structure/relation/m2o-relation";
import M2MRelation from "../pg-structure/relation/m2m-relation";

export * from "./json";

/**
 * Actions performed when the data in the foreign key referenced columns is changed.
 */
export const enum Action {
  Cascade = "CASCADE",
  SetNull = "SET NULL",
  SetDefault = "SET DEFAULT",
  Restrict = "RESTRICT",
  NoAction = "NO ACTION",
}

/**
 * A value inserted into the referencing column(s) is matched against the values of the referenced table and referenced columns using the given match type.
 */
export enum MatchType {
  Full = "FULL",
  Partial = "PARTIAL",
  Simple = "SIMPLE",
}

/**
 * Case type for database object names.
 */
export const enum CaseType {
  CamelCase = "camelCase",
  SnakeCase = "snakeCase",
}

/** PostgreSQL system-defined values of typcategory. See [pg_type](https://www.postgresql.org/docs/current/catalog-pg-type.html) in PostgreSQL docs. */
export type TypeCategory = "A" | "B" | "C" | "D" | "E" | "G" | "I" | "N" | "P" | "R" | "S" | "T" | "U" | "V" | "X"; // https://www.postgresql.org/docs/current/catalog-pg-type.html#CATALOG-TYPCATEGORY-TABLE

/**
 * Type for functions to generate names for relations. All necessary information such as {@link Table table} names,
 * {@link Column columns}, {@link ForeignKey foreign key}, {@link DbObject.commentData comment data} can be accessed via passed {@link Relation relation} parameter.
 *
 * @example
 * const config = {
 *   relationNameFunctions: {
 *     o2m: (relation) => some_function(relation.targetTable.name),
 *     m2o: (relation) => some_function(relation.targetTable.name),
 *     m2m: (relation) => some_function(relation.targetTable.name),
 *   },
 * }
 */
export type RelationNameFunctions = {
  o2m: (relation: O2MRelation) => string;
  m2o: (relation: M2ORelation) => string;
  m2m: (relation: M2MRelation) => string;
};

/**
 * Name of the builtin relation name function.
 */
export type BuiltinRelationNameFunctions = "short" | "descriptive";

/**
 * Type to store a relation name collision. Keys are relation names and values are information about relations with that name.
 */
export type RelationNameCollision = { [relationName: string]: string[] };

/**
 * Type to store relation name collisions by tables.
 *
 * @example
 * {
 *   'public.contact': {
 *     m2o: [],
 *     o2m: [
 *       {
 *         carts: [
 *           '[public.contact]――― cart_contact ――⥷ [public.cart]',
 *           '[public.contact]――― other_cart_contact ――⥷ [other_schema.cart]'
 *         ]
 *       }
 *     ],
 *     m2m: []
 *    }
 * }
 */
export type CollisionsByTable = {
  [tableFullName: string]: { m2o: RelationNameCollision[]; o2m: RelationNameCollision[]; m2m: RelationNameCollision[] };
};

/** Volatility of the PostgreSQL function. */
export type Volatility = "immutable" | "stable" | "volatile";

/** Parallel safety of the PostgreSQL function. */
export type ParallelSafety = "safe" | "unsafe" | "restricted";

/** Modes of the PostgreSQL function arguments. */
export type ArgumentMode = "in" | "inout" | "out" | "variadic" | "table";

/** whether the trigger fires once for each processed row or once for each statement. */
export type TriggerOrientation = "row" | "statement";

/** Time at which the trigger fires */
export type TriggerTiming = "before" | "after" | "insteadOf";

/** Event that fires the trigger */
export type TriggerEvent = "insert" | "delete" | "update" | "truncate";

/** In which session_replication_role modes the trigger fires. */
export type TriggerEnabled = "origin" | "disabled" | "replica" | "always";

/**
 * Options for the `pgStructure` function.
 */
export interface Options {
  /**
   * Environment variable prefix to get database client details. If no client configuration is provided `pg-structure` tries to
   * get client details from environment variables to populate `node-postgres` config (See [ClientConfig](https://node-postgres.com/api/client) of `pg`).
   * All keys are built using this prefix in uppercase.
   *
   * |Environment Varibale|[ClientConfig](https://node-postgres.com/api/client) Key|
   * |---|---|
   * |DB_DATABASE|database|
   * |DB_USER|user|
   * |DB_PASSWORD|password|
   * |DB_HOST|host|
   * |DB_PORT|port|
   * |DB_CONNECTION_STRING|connectionString|
   * |DB_SSL|ssl|
   * |...|...|
   *
   * @example
   * const config = { envPrefix: "DB" }
   */
  envPrefix?: string;

  /** Name of the database. This is inferred if possible from client or connection string. */
  name?: string;

  /**
   * List of the schemas or a pattern similar to SQL's `LIKE` to select included schemas.
   *
   * @example
   * const config = { includeSchemas: "public_%" }; // include all schemas starting with "public_"
   *
   * @example
   * const config = { includeSchemas: ["public", "extra"] };
   */
  includeSchemas?: string | string[];

  /** List of the schemas or a pattern similar to SQL's `LIKE` to select excluded schemas. */
  excludeSchemas?: string | string[];

  /** Whether to include PostgreSQL system schemas (i.e. `pg_catalog`) from database. */
  includeSystemSchemas?: boolean;

  /** Character to separate {@link ForeignKey.sourceAlias source alias} and {@link ForeignKey.targetAlias target alias} in {@link ForeignKey foreign key} name. */
  foreignKeyAliasSeparator?: string;

  /** Whether first part of the foreign key aliases contains target alias (i.e `company_employees`) or source alias (i.e. `employee_company`). */
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
   * @example
   * const config = {
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

  /** Prevents pg-structure to close given database connection. */
  keepConnection?: boolean;
}
