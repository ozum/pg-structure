import IndexableArray from "indexable-array";
import { Memoize } from "@typescript-plus/fast-memoize-decorator";
import Db from "./db";
import Entity from "./base/entity";
import Table from "./entity/table";
import View from "./entity/view";
import Column from "./column";
import Type from "./base/type";
import DbObject, { DbObjectConstructorArgs } from "./base/db-object";
import MaterializedView from "./entity/materialized-view";

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
   * All {@link Type custom database types} of the {@link Schema schema} as an {@link IndexableArray indexable array} ordered by name.
   *
   * @example
   * const typeArray    = schema.types;
   * const isAvailable  = schema.types.has('address');
   * const type         = schema.types.get('address');
   * const columns      = type.columns;
   */
  public readonly types: IndexableArray<Type, "name", "shortName", true> = IndexableArray.throwingFrom([], "name", "shortName");

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
