import IndexableArray from "indexable-array";
import { Memoize } from "@typescript-plus/fast-memoize-decorator";
import { readFileSync } from "fs";
import { join } from "path";
import Schema from "./schema";
import Table from "./entity/table";
import Column from "./column";
import Index from ".";
import Entity from "./base/entity";
import Type from "./base/type";
import Relation from "./base/relation";
import { RelationNameFunctions, RelationNameCollision, CollisionsByTable, BuiltinRelationNameFunctions } from "../types";
import { getDuplicateNames } from "../util/helper";
import { QueryResults } from "../types/query-result";
import { Func } from "..";

const packageJson = JSON.parse(readFileSync(join(__dirname, "../../package.json"), { encoding: "utf8" }));

/**
 * Function to get duplicate relation names from given relations.
 *
 * @ignore
 * @param relations are relations to get duplicate names.
 */
function getDuplicateRelations(relations: IndexableArray<Relation, "name", never, true>): RelationNameCollision[] {
  return getDuplicateNames(relations).map((name) => ({ [name]: relations.getAll(name).map((rel) => rel.info) }));
}

/** @ignore */
export interface Config {
  relationNameFunctions: RelationNameFunctions | BuiltinRelationNameFunctions;
  commentDataToken: string;
  foreignKeyAliasSeparator: string;
  foreignKeyAliasTargetFirst: boolean;
}

/**
 * Class which represent a {@link Db database}. Provides attributes and methods for details of the {@link Db database}.
 */
export default class Db {
  /** @ignore */
  public constructor(args: { name: string; serverVersion: string }, config: Config, queryResults: QueryResults) {
    if (!args.name) {
      throw new Error("Database name is required.");
    }

    this.name = args.name;
    this.serverVersion = args.serverVersion;
    this._config = config;
    this.queryResults = queryResults;
  }

  /**
   * Serializes object.
   *
   * CAVEATS:
   * - Serialized data may or may not be deserialized with another version of `pg-structure`. (Even between minor verisons are not guaranteed).
   * - Serialized data is not direct stringified version of objects.
   * - Ignores relation name function provided using `relationNameFunctions` args, if it is not a builtin function.
   *
   * @example
   * import pgStructure, { deserialize } from "pg-structure";
   * const db = await pgStructure({ database: "db", user: "u", password: "pass" });
   * const serialized = db.serialize();
   * const otherDb = deserialize(serialized);
   */
  public serialize(): string {
    return JSON.stringify({
      name: this.name,
      serverVersion: this.serverVersion,
      version: packageJson.version,
      config: this._config,
      queryResults: this.queryResults,
    });
  }

  /** SQL query results returned from database to build pg-structure. */
  private queryResults: QueryResults;

  /** Random assigned id to db. */
  public readonly id = Math.random();

  /**  Name  of {@link Db database}. */
  public readonly name: string;

  /** Version of the PostgreSQL Engine */
  public readonly serverVersion: string;

  /**
   * `pg-structure` configuration.
   *
   * @ignore
   */
  public readonly _config: Config;

  /**
   * PostgreSQL system schemas needed by `pg-structure`.
   *
   * @ignore
   */
  public readonly systemSchemas: IndexableArray<Schema, "name", "oid", true> = IndexableArray.throwingFrom([], "name", "oid");

  /**
   * All {@link Schema schemas} in the {@link Db database} as an {@link IndexableArray indexable array} ordered by their name.
   *
   * @example
   * const schemaArray  = db.schemas;
   * const isAvailable  = db.schemas.has('another_schema');
   * const public       = db.schemas.get('public');
   * const name         = public.name;
   * const names = db.schemas.map(schema => schema.name);
   */
  public readonly schemas: IndexableArray<Schema, "name", "oid", true> = IndexableArray.throwingFrom([], "name", "oid");

  /**
   * All {@link DbObject database objects} of given type of the database. Different PostgreSQL schemas may have same named objects.
   * `get` method of {@link IndexableArray https://www.npmjs.com/package/indexable-array} returns first one.
   * You may also use `getAll` or `get(1234, { key: oid })`.
   *
   * @ignore
   * @param type is type of objects to get from database.
   * @returns all objects of given type of the database.
   * @example
   * const allTables = db._allObjects(type: "tables");
   */
  private _allObjects<
    T extends "tables" | "entities" | "views" | "types" | "functions",
    E extends string = never,
    A extends T | "typesIncludingEntities" = T
  >(system: boolean, type: A, ...extra: string[]): IndexableArray<any, "name", "oid" | E, true> {
    const schemas = system ? this.systemSchemas : this.schemas;
    return schemas.reduce(
      (allObjects, schema) => allObjects.concat(schema[type] as any),
      IndexableArray.throwingFrom([], "name", "oid", ...(extra as any))
    );
  }

  /**
   * All {@link Table tables} of the database. Returned array have all objects, you may loop over them.
   * However Returned array have all objects, you may loop over them.
   * However two PostgreSQL schemas may have same named table. `get` method of
   * {@link IndexableArray https://www.npmjs.com/package/indexable-array} returns first one.
   * You may also use `getAll` or `get(1234, { key: oid })`.
   */
  @Memoize()
  public get tables(): IndexableArray<Table, "name", "oid", true> {
    return this._allObjects<"tables">(false, "tables");
  }

  /**
   * All {@link Entity entities} of the database. Returned array have all objects, you may loop over them.
   * However two PostgreSQL schemas may have same named entity. `get` method of
   * {@link IndexableArray https://www.npmjs.com/package/indexable-array} returns first one.
   * You may also use `getAll` or `get(1234, { key: oid })`.
   */
  @Memoize()
  public get entities(): IndexableArray<Entity, "name", "oid", true> {
    return this._allObjects(false, "entities");
  }

  /**
   * All user defined {@link Type types} of the database excluding {@link entity entities} such as
   * {@link Table table}, {@link Views view} and {@link MaterializedView materialized view} types.
   * Entities are also composite types in PostgreSQL. To get all types including entites use `typesIncludingEntities` method.
   * Returned array have all objects, you may loop over them.
   * However two PostgreSQL schemas may have same named type. `get` method of
   * {@link IndexableArray https://www.npmjs.com/package/indexable-array} returns first one.
   * You may also use `getAll` or `get(1234, { key: oid })`.
   *
   * @see [[typesIncludingEntities]], [[systemTypes]], [[allTypes]]
   */
  @Memoize()
  public get types(): IndexableArray<Type, "name", "oid" | "classOid" | "arrayOid" | "internalName", true> {
    return this._allObjects<"types", "classOid">(false, "types", "classOid", "arrayOid", "internalName");
  }

  /**
   * All user defined {@link Type types} of the database including {@link entity entities} such as
   * {@link Table table}, {@link Views view} and {@link MaterializedView materialized view} types.
   * Entities are also composite types in PostgreSQL. To get all types excluding entites use `types` method.
   * {@link IndexableArray https://www.npmjs.com/package/indexable-array} returns first one.
   * You may also use `getAll` or `get(1234, { key: oid })`.
   *
   * @see [[types]], [[systemTypes]], [[allTypes]]
   */
  @Memoize()
  public get typesIncludingEntities(): IndexableArray<Type, "name", "oid" | "classOid" | "arrayOid" | "internalName", true> {
    return this._allObjects<"types", "classOid", "typesIncludingEntities">(
      false,
      "typesIncludingEntities",
      "classOid",
      "arrayOid",
      "internalName"
    );
  }

  /**
   * All system {@link Type types} of the database. Returned array have all objects, you may loop over them.
   * However two PostgreSQL schemas may have same named type. `get` method of
   * {@link IndexableArray https://www.npmjs.com/package/indexable-array} returns first one.
   * You may also use `getAll` or `get(1234, { key: oid })`.
   *
   * @see [[types]], [[typesIncludingEntities]], [[allTypes]]
   */
  @Memoize()
  public get systemTypes(): IndexableArray<Type, "name", "oid" | "classOid" | "arrayOid" | "internalName", true> {
    return this._allObjects<"types", "classOid", "typesIncludingEntities">(
      true,
      "typesIncludingEntities",
      "classOid",
      "arrayOid",
      "internalName"
    );
  }

  /**
   * All {@link Type types} of the database including system types and {@link entity entities}.
   * Returned array have all objects, you may loop over them.
   * However two PostgreSQL schemas may have same named type. `get` method of
   * {@link IndexableArray https://www.npmjs.com/package/indexable-array} returns first one.
   * You may also use `getAll` or `get(1234, { key: oid })`.
   *
   * @see [[types]], [[typesIncludingEntities]], [[systemTypes]]
   */
  @Memoize()
  public get allTypes(): IndexableArray<Type, "name", "oid" | "classOid" | "arrayOid" | "internalName", true> {
    return this.typesIncludingEntities.concat(this.systemTypes);
  }

  /**
   * All {@link Index indexes} of the database. Returned array have all objects, you may loop over them.
   * However two PostgreSQL schemas may have same named index. `get` method of
   * {@link IndexableArray https://www.npmjs.com/package/indexable-array} returns first one.
   * You may also use `getAll` or `get(1234, { key: oid })`.
   */
  @Memoize()
  public get indexes(): IndexableArray<Index, "name", "oid", true> {
    return this.schemas.reduce((allIndexes, schema) => {
      const indexes = schema.tables.reduce((schemaIndexes, table) => schemaIndexes.concat(table.indexes), [] as Index[]);
      return allIndexes.concat(indexes);
    }, IndexableArray.throwingFrom([] as Index[], "name", "oid"));
  }

  /**
   * All {@link Entity entities} of the database. Returned array have all objects, you may loop over them.
   * However two PostgreSQL schemas may have same named entity. `get` method of
   * {@link IndexableArray https://www.npmjs.com/package/indexable-array} returns first one.
   * You may also use `getAll` or `get(1234, { key: oid })`.
   */
  @Memoize()
  public get functions(): IndexableArray<Func, "name", "oid", true> {
    return this._allObjects(false, "functions");
  }

  /**
   * Returns {@link Schema schema}, {@link Table table} or {@link Column column} for given path. Path should be in dot (.) notation.
   * If no schema is provided looks into `public` schema as PostgreSQL does.
   *
   * Note for TypeScript users: Since `get()` could return one of the many possible types, you may need to specify your expected type using `as`.
   * i.e. `const result = db.get("public") as Schema`;
   *
   * @param path is the path of the requested item in dot (.) notation such as `public.contact`
   * @returns requested {@link DbObject database object}.
   * @example
   * const schema   = db.get('public');               // Returns public schema.
   * const table    = db.get('public.contact');       // Returns contact table in public schema.
   * const table2   = db.get('contact');              // Returns contact table in public schema.
   * const column   = db.get('public.contact.name');  // Returns name column of the contact table in public schema.
   * const column2  = db.get('contact.name');         // Returns name column of the contact table in public schema.
   */
  public get(path: string): Schema | Entity | Column {
    const [firstPart, ...parts] = path.split(".");

    if (this.schemas.has(firstPart)) {
      const schema = this.schemas.get(firstPart);
      return parts.length > 0 && schema ? schema.get(parts.join(".")) : schema;
    }

    return this.schemas.get("public").get(path);
  }

  /**
   * Name colisions of table relations if there are any, otherwise undefined.
   */
  @Memoize()
  public get relationNameCollisions(): CollisionsByTable | undefined {
    const result: CollisionsByTable = {};

    // const a = getDuplicateNames(this.tables[0].m2oRelations).map(name => ({
    //   [name]: this.tables[0].m2oRelations.getAll(name).map(rel => rel.info),
    // }));

    this.tables.forEach((table) => {
      // const duplicates: { m2o: Collision; o2m: Collision; m2m: Collision } = {
      //   m2o: getDuplicateNames(table.m2oRelations).map(name => ({ [name]: table.m2oRelations.getAll(name).map(rel => rel.info) })),
      //   o2m: getDuplicateNames(table.o2mRelations).map(name => ({ [name]: table.o2mRelations.getAll(name).map(rel => rel.info) })),
      //   m2m: getDuplicateNames(table.m2mRelations).map(name => ({ [name]: table.m2mRelations.getAll(name).map(rel => rel.info) })),
      // };
      const duplicates = {
        m2o: getDuplicateRelations(table.m2oRelations),
        o2m: getDuplicateRelations(table.o2mRelations),
        m2m: getDuplicateRelations(table.m2mRelations),
      };
      const tableDuplicateCount = duplicates.m2o.length + duplicates.o2m.length + duplicates.m2m.length;

      if (tableDuplicateCount > 0) {
        result[table.fullName] = duplicates;
      }
    });

    return Object.keys(result).length > 0 ? result : undefined;
  }
}
