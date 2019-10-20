import Constraint, { ConstraintConstructorArgs } from "../base/constraint";
import { Table, Domain, Schema } from "../..";

/** @ignore */
export interface CheckConstraintConstructorArgs extends ConstraintConstructorArgs {
  expression: string;
  table?: Table;
  domain?: Domain;
}

/**
 * Class which represent a PostgreSQL check constraint. Provides attributes and methods related to constraint.
 */
export default class CheckConstraint extends Constraint {
  /** @ignore */
  public constructor(args: CheckConstraintConstructorArgs) {
    super(args);

    this.expression = args.expression;
    this.table = args.table;
    this.domain = args.domain;
  }

  private get parent(): Table | Domain {
    return (this.table ? this.table : this.domain) as Table | Domain;
  }

  /** Expression for check constraint. */
  public readonly expression: string;

  /**
   * {@link Table} which this {@link Constraint constraint} defined in if it is defined in a table.
   */
  public readonly table?: Table;

  /**
   * {@link Domain} which this {@link Constraint constraint} defined in if it is defined in a domain.
   */
  public readonly domain?: Domain;

  /**
   * Full name of the {@link Constraint constraint} including table name.
   */
  public get fullName(): string {
    return `${this.schema.name}.${this.parent.name}.${this.name}`;
  }

  /**
   * [[Schema]] of the {@link Constraint constraint}'s table defined in.
   */
  public get schema(): Schema {
    return this.parent.schema;
  }
}
