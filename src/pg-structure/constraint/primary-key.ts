import IndexableArray from "indexable-array";
import Constraint, { ConstraintConstructorArgs } from "../base/constraint";
import Column from "../column";
import Index from "..";
import { Table, Schema } from "../..";

/** @ignore */
export interface PrimaryKeyConstructorArgs extends ConstraintConstructorArgs {
  index: Index;
  table: Table;
}

/**
 * Class which represent a primary key. Provides attributes and methods for details of the primary key.
 */
export default class PrimaryKey extends Constraint {
  /** @ignore */
  public constructor(args: PrimaryKeyConstructorArgs) {
    super(args);

    this.index = args.index;
    this.table = args.table;
  }

  /**
   * The @{link Index index}} supporting this constraint.
   */
  public readonly index: Index;

  /**
   * IndexableArray of {@link Column columns} this {@link PrimaryKeyConstraint primary key constraint} has. Columns are in order they are defined in database.
   */
  public get columns(): IndexableArray<Column, "name", never, true> {
    return this.index.columns;
  }

  /**
   * {@link Table} which this {@link Constraint constraint} defined in.
   */
  public readonly table: Table;

  /**
   * Full name of the {@link Constraint constraint} including table name.
   */
  public get fullName(): string {
    return `${this.schema.name}.${this.table.name}.${this.name}`;
  }

  /**
   * [[Schema]] of the {@link Constraint constraint}'s table defined in.
   */
  public get schema(): Schema {
    return this.table.schema;
  }
}
