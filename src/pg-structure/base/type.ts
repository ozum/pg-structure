import DbObject, { DbObjectConstructorArgs } from "./db-object";
import Schema from "../schema";

/** @ignore */
export interface TypeConstructorArgs extends DbObjectConstructorArgs {
  oid: number;
  classOid: number;
  schema: Schema;
}

export default abstract class Type extends DbObject {
  /** @ignore */
  public constructor(args: TypeConstructorArgs) {
    super(args);
    this.oid = args.oid;
    this.classOid = args.classOid;
    this.schema = args.schema;
  }

  /** Object identifier for the {@link Entity} */
  public readonly oid: number;

  /** Object identifier of PostgreSQL class (`pg_catalog.pg_class`) for the {@link Entity} */
  public readonly classOid: number;

  /**
   * {@link Schema} this {@link Type type} belongs to.
   */
  public schema: Schema;

  /**
   * Full name of the object with '.' notation including [[Schema]] name.
   *
   * @example
   * const fullName = type.fullName; // public.phone_number
   */
  public get fullName(): string {
    return `${this.schema.name}.${this.name}`;
  }

  /**
   * Short name of type. Available for some builtin types.
   *
   * @example
   * const name = timetzType.name; // time with time zone
   * const shortName = timetzType.shortName; // time with time zone
   * const name2 = varcharType.name; // character varying
   * const shortName2 = varcharType.name; // varchar
   */
  public readonly shortName?: string;
}
