import Constraint, { ConstraintConstructorArgs } from "../base/constraint";
import Index from "..";
import { Table, Schema } from "../..";

/** @ignore */
export interface ExclusionConstructorArgs extends ConstraintConstructorArgs {
  index: Index;
  table: Table;
}

/**
 * Class which represent a PostgreSQL exclusion constraint. Provides attributes and methods related to constraint.
 */
export default class ExclusionConstraint extends Constraint {
  /** @ignore */
  public constructor(args: ExclusionConstructorArgs) {
    super(args);

    this.index = args.index;
    this.table = args.table;
  }

  /**
   * The @{link Index index}} supporting this constraint.
   */
  public readonly index: Index;

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
