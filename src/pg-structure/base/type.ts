import { TypeCategory } from "../../types";
import DbObject, { DbObjectConstructorArgs } from "./db-object";
import Schema from "../schema";

/** @ignore */
export interface TypeConstructorArgs extends DbObjectConstructorArgs {
  oid: number;
  arrayOid: number;
  internalName?: string;
  shortName?: string;
  classOid: number;
  schema: Schema;
  category: TypeCategory;
  hasLength?: boolean;
  hasScale?: boolean;
  hasPrecision?: boolean;
}

export default abstract class Type extends DbObject {
  /** @ignore */
  public constructor(args: TypeConstructorArgs) {
    super(args);
    this.oid = args.oid;
    this.arrayOid = args.arrayOid;
    this.classOid = args.classOid;
    this.schema = args.schema;
    this.internalName = args.internalName;
    this.shortName = args.shortName || args.name;
    this.category = args.category;
    this.hasLength = args.hasLength || false;
    this.hasScale = args.hasScale || false;
    this.hasPrecision = args.hasPrecision || false;
  }

  /** Object identifier for the {@link Entity} */
  public readonly oid: number;

  /** If typarray is not 0 then it identifies another row in pg_type, which is the array type having this type as element. */
  public readonly arrayOid: number;

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
   * Internal name of type. Available for some builtin types.
   *
   * @example
   * const name = doublePrecisionType.name; // double precision
   * const shortName = doublePrecisionType.internalName; // float8
   */
  public readonly internalName?: string;

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

  /**
   * An arbitrary classification of PostgreSQL data types that is used by the PostgreSQL parser
   * to determine which implicit casts should be “preferred”.
   * See related doc [here](https://www.postgresql.org/docs/current/catalog-pg-type.html#CATALOG-TYPCATEGORY-TABLE)
   */
  public category: TypeCategory;

  /** Whether the type has length property. */
  public hasLength: boolean;

  /** Whether the type has scale property. */
  public hasScale: boolean;

  /** Whether the type has precision property. */
  public hasPrecision: boolean;
}
