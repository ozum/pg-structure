import DbObject, { DbObjectConstructorArgs } from "./db-object";

/** @ignore */
export interface ConstraintConstructorArgs extends DbObjectConstructorArgs {} // eslint-disable-line @typescript-eslint/no-empty-interface

/**
 * Abstract class which represent a database constraint. Provides attributes and methods related to constraint.
 */
export default abstract class Constraint extends DbObject {
  /** @ignore */
}
