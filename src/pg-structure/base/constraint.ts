import DbObject, { DbObjectConstructorArgs } from "./db-object";

/** @ignore */
export interface ConstraintConstructorArgs extends DbObjectConstructorArgs {
  isDeferrable: boolean;
  isDeferred: boolean;
}

/**
 * Abstract class which represent a database constraint. Provides attributes and methods related to constraint.
 */
export default abstract class Constraint extends DbObject {
  /** @ignore */
  public constructor(args: ConstraintConstructorArgs) {
    super(args);
    this.isDeferrable = args.isDeferrable;
    this.isDeferred = args.isDeferred;
  }

  /** Is the {@link Constraint} deferrable? */
  public readonly isDeferrable: boolean;

  /** Is the {@link Constraint} deferred by default? */
  public readonly isDeferred: boolean;
}
