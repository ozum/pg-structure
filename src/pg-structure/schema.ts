import IndexableArray from "indexable-array";
import { Memoize } from "@typescript-plus/fast-memoize-decorator";
import Db from "./db";
import Entity from "./base/entity";
import Table from "./entity/table";
import View from "./entity/view";
import Column from "./column";
import CompositeType from "./type/composite-type";
import Type from "./base/type";
import DbObject, { DbObjectConstructorArgs } from "./base/db-object";
import MaterializedView from "./entity/materialized-view";
import Func from "./base/func";
import { Procedure, NormalFunction, AggregateFunction, WindowFunction } from "..";

/** @ignore */
export interface SchemaConstructorArgs extends DbObjectConstructorArgs {
  oid: number;
  db: Db;
}

/**
 * Class which represent a PostgreSQL {@link Schema schema}. Provides attributes and methods for details of the {@link Schema schema}.
 */
export default class Schema extends DbObject {
  /** @ignore */
  public constructor(args: SchemaConstructorArgs) {
    super(args);
    this._db = args.db;
    this.oid = args.oid;

    ["_db"].forEach((property) => Object.defineProperty(this, property, { writable: true, enumerable: false })); // Make added fields non-enumerable.
  }

  /**
   * [[Db]] of the schema. Used by abstract class to get db of all db objects.
   *
   * @ignore
   */
  public readonly _db: Db;

  /** Object identifier for the {@link Schema} */
  public readonly oid: number;

  /**
   * All {@link Entity entities} ({@link Table tables} and {@link View views}) of the {@link Schema schema}
   * as an {@link IndexableArray indexable array} ordered by name.
   */
  @Memoize()
  public get entities(): IndexableArray<Entity, "name", never, true> {
    return IndexableArray.throwingFrom([...this.tables, ...this.views, ...this.materializedViews], "name");
  }

  /**
   * All {@link Table tables} of the {@link Schema schema} as an {@link IndexableArray indexable array} ordered by name.
   *
   * @example
   * const tableArray   = schema.tables;
   * const isAvailable  = schema.tables.has('person');
   * const table        = schema.tables.get('account');
   * const name         = table.name;
   *
   * schema.tables.forEach(table => console.log(table.name));
   */
  public readonly tables: IndexableArray<Table, "name", never, true> = IndexableArray.throwingFrom([], "name");

  /**
   * All {@link View views} of the {@link Schema schema} as an {@link IndexableArray indexable array} ordered by name.
   *
   * @example
   * const viewArray    = schema.views;
   * const isAvailable  = schema.views.has('admin_person');
   * const view         = schema.views.get('big_account');
   * const name         = view.name;
   *
   * schema.views.forEach(view => console.log(view.name));
   */
  public readonly views: IndexableArray<View, "name", never, true> = IndexableArray.throwingFrom([], "name");

  /**
   * All {@link MaterializedView materialized views} of the {@link Schema schema} as an {@link IndexableArray indexable array} ordered by name.
   *
   * @example
   * const mViewArray   = schema.materializedViews;
   * const isAvailable  = schema.materializedViews.has('admin_person');
   * const mView        = schema.materializedViews.get('big_account');
   * const name         = mView.name;
   *
   * schema.materializedViews.forEach(mView => console.log(mView.name));
   */
  public readonly materializedViews: IndexableArray<MaterializedView, "name", never, true> = IndexableArray.throwingFrom([], "name");

  /**
   * All {@link Function functions} of the {@link Schema schema} as an {@link IndexableArray indexable array} ordered by name.
   *
   * @example
   * const functionArray   = schema.functions;
   * const isAvailable     = schema.functions.has('some_function');
   * const function        = schema.functions.get('some_function');
   * const name            = function.name;
   *
   * schema.tables.forEach(table => console.log(table.name));
   */
  @Memoize()
  public get functions(): IndexableArray<Func, "name", never, true> {
    return IndexableArray.throwingFrom(
      [...this.normalFunctions, ...this.procedures, ...this.aggregateFunctions, ...this.windowFunctions],
      "name"
    );
  }

  /**
   * All {@link NormalFunction normalFunctions} of the {@link Schema schema} as an {@link IndexableArray indexable array} ordered by name.
   *
   * @example
   * const functionArray   = schema.normalFunctions;
   * const isAvailable     = schema.normalFunctions.has('some_function');
   * const function        = schema.normalFunctions.get('some_function');
   * const name            = normalFunctions.name;
   *
   * schema.tables.forEach(table => console.log(table.name));
   */
  public readonly normalFunctions: IndexableArray<NormalFunction, "name", never, true> = IndexableArray.throwingFrom([], "name");

  /**
   * All {@link Procedure procedures} of the {@link Schema schema} as an {@link IndexableArray indexable array} ordered by name.
   *
   * @example
   * const functionArray   = schema.procedures;
   * const isAvailable     = schema.procedures.has('some_procedure');
   * const function        = schema.procedures.get('some_procedure');
   * const name            = procedures.name;
   *
   * schema.tables.forEach(table => console.log(table.name));
   */
  public readonly procedures: IndexableArray<Procedure, "name", never, true> = IndexableArray.throwingFrom([], "name");

  /**
   * All {@link AggregateFunction aggregateFunctions} of the {@link Schema schema} as an {@link IndexableArray indexable array} ordered by name.
   *
   * @example
   * const functionArray   = schema.aggregateFunctions;
   * const isAvailable     = schema.aggregateFunctions.has('some_function');
   * const function        = schema.aggregateFunctions.get('some_function');
   * const name            = aggregateFunctions.name;
   *
   * schema.tables.forEach(table => console.log(table.name));
   */
  public readonly aggregateFunctions: IndexableArray<AggregateFunction, "name", never, true> = IndexableArray.throwingFrom([], "name");

  /**
   * All {@link WindowFunction windowFunctions} of the {@link Schema schema} as an {@link IndexableArray indexable array} ordered by name.
   *
   * @example
   * const functionArray   = schema.windowFunctions;
   * const isAvailable     = schema.windowFunctions.has('some_function');
   * const function        = schema.windowFunctions.get('some_function');
   * const name            = windowFunctions.name;
   *
   * schema.tables.forEach(table => console.log(table.name));
   */
  public readonly windowFunctions: IndexableArray<WindowFunction, "name", never, true> = IndexableArray.throwingFrom([], "name");

  /**
   * All {@link Type custom database types} of the {@link Schema schema} as an {@link IndexableArray indexable array} ordered by name.
   * This list includes types originated from entities such as tables, views and materialized views. Entities are also composite types in PostgreSQL.
   * To exclude types originated from entities use `types` method.
   *
   * @example
   * const typeArray    = schema.typesIncludingEntities;
   * const isAvailable  = schema.typesIncludingEntities.has('address');
   * const type         = schema.typesIncludingEntities.get('address');
   * const columns      = type.columns;
   */
  public readonly typesIncludingEntities: IndexableArray<
    Type,
    "name",
    "oid" | "classOid" | "internalName",
    true
  > = IndexableArray.throwingFrom([], "name", "oid", "classOid", "internalName");

  /**
   * All {@link Type custom database types} of the {@link Schema schema} as an {@link IndexableArray indexable array} ordered by name.
   * This list excludes types originated from entities such as tables, views and materialized views. Entities are also composite types in PostgreSQL.
   * To get all types including entities use `typesIncludingEntities` method.
   *
   * @example
   * const typeArray    = schema.types;
   * const isAvailable  = schema.types.has('address');
   * const type         = schema.types.get('address');
   * const columns      = type.columns;
   */
  @Memoize()
  public get types(): IndexableArray<Type, "name", "oid" | "classOid" | "internalName", true> {
    return this.typesIncludingEntities.filter((type) => !(type instanceof CompositeType) || (type as CompositeType).relationKind === "c");
  }

  /**
   * {@link Schema} of the object.
   */
  public readonly schema: Schema = this;

  public get fullName(): string {
    return this.name;
  }

  /**
   * Returns {@link Table table}, {@link View view} or {@link Column column} on given path in {@link Schema schema}. Path should be in dot (.) notation.
   *
   * Note for TypeScript users: Since `get()` could return one of the many possible types, you may need to specify your expected type using `as`.
   * i.e. `const result = db.get("public.account") as Table`;
   *
   * @param path is the path of the requested item in dot (.) notation such as 'public.contact'
   * @returns requested {@link DbObject database object}.
   * @example
   * const table  = db.get('contact');      // Returns contact table in public schema.
   * const column = db.get('contact.name'); // Returns name column of the contact table.
   */
  public get(path: string): Entity | Column {
    const [entityName, ...parts] = path.split(".");
    const entity = this.entities.get(entityName);
    return parts.length > 0 && entity ? entity.get(parts.join(".")) : entity;
  }
}
