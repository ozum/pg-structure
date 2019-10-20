import IndexableArray from "indexable-array";
import DBObject, { DbObjectConstructorArgs } from "./db-object";
import Column from "../column";
import Schema from "../schema";

/** @ignore */
export interface EntityObjectConstructorArgs extends DbObjectConstructorArgs {
  oid: number;
  schema: Schema;
}

/**
 * Class which represent an entity ({@link Table table }, {@link View view} etc.).
 * Provides attributes and methods for details of the entity.
 */
export default abstract class Entity extends DBObject {
  /** @ignore */
  public constructor(args: EntityObjectConstructorArgs) {
    super(args);
    this.oid = args.oid;
    this.schema = args.schema;
  }

  /** Object identifier for the {@link Entity} */
  public readonly oid: number;

  /**
   * Full name of the object with '.' notation including [[Schema]] name.
   *
   * @example
   * const fullName = entity.fullName; // public.member
   */
  public get fullName(): string {
    return `${this.schema.name}.${this.name}`;
  }

  /**
   * [[Schema]] of the object.
   */
  public readonly schema: Schema;

  /**
   * All {@link Column columns} of the {@link Entity entity} as an {@link IndexableArray indexable array} ordered by same order they are defined
   * in database {@link Entity entity}.
   *
   * @name Entity#columns
   * @example
   * const isAvailable  = table.columns.has('id');
   * const columnNames  = table.columns.map(column => column.name);
   * const column       = table.columns.get('user_id');
   * const name         = column.name;
   *
   * table.columns.forEach(column => console.log(column.name));
   */
  public readonly columns: IndexableArray<Column, "name", "attributeNumber", true> = IndexableArray.throwingFrom(
    [],
    "name",
    "attributeNumber"
  );

  /**
   * Returns {@link Column column} with given name from {@link Entity entity}.
   *
   * @param path is the name of the {@link Column column}.
   * @returns requested {@link Column columns}.
   * @example
   * const column = entity.get('contact'),  // Returns contact column from entity.
   */
  public get(column: string): Column {
    return this.columns.get(column);
  }
}
