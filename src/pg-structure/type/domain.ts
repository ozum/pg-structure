import IndexableArray from "indexable-array";
import Type, { TypeConstructorArgs } from "../base/type";
import { parseSQLType } from "../../util/helper";
import Schema from "../schema";
import { CheckConstraint } from "../..";

/** @ignore */
interface DomainConstructorArgs extends TypeConstructorArgs {
  sqlType: string;
  notNull: boolean;
  arrayDimension: number;
  default: boolean | number | string | null;
}

/**
 * Class which represent a PostgreSQL {@link Domain domain}. Provides attributes and methods for details of the {@link Domain domain}.
 */
export default class Domain extends Type {
  public constructor(args: DomainConstructorArgs) {
    super(args);
    // this._sqlType = args.sqlType;

    this.notNull = args.notNull;
    this.arrayDimension = args.arrayDimension;
    this.default = args.default;

    const { schema, typeName, length, precision, scale } = parseSQLType(this.db, args.sqlType);

    this._baseTypeSchema = schema;
    this._baseTypeName = typeName;
    this.length = length;
    this.precision = precision;
    this.scale = scale;
  }

  /** SQL name of the data type that is identified by its type OID and possibly a type modifier i.e. character varying(20), numeric(3,2), extra_modules."extra-domain"[], timestamp(0) without time zone etc. */
  // private readonly _sqlType: string;

  private _baseTypeSchema: Schema;
  private _baseTypeName: string;

  /** `true` if domain is not allowed to be null. */
  public readonly notNull: boolean;

  /** Data type of the domain. */
  public get type(): Type {
    return this._baseTypeSchema.typesIncludingEntities.get(this._baseTypeName) as Type;
  }

  /** If base type is a character type, then this is the length of the type.  */
  public readonly length?: number;

  /**
   * - If base data type identifies a numeric type, this contains the (declared or implicit) precision of
   *   the type for this column. The precision indicates the number of significant digits.
   * - If base data type identifies a date, time, timestamp, or interval type, this column contains the (declared or implicit)
   *   fractional seconds precision of the type for this attribute, that is, the number of decimal digits maintained
   *   following the decimal point in the seconds value.
   * - If base data type is an array. Same rules apply for the data type of the array, and this value would become precision
   *   of the data type of the array.
   * - For all other base data types, this is `undefined`.
   * For example: The number 23.5141 has a precision of 6 and a scale of 4.
   */
  public readonly precision?: number;

  /**
   * - If base data type identifies an exact numeric type, this contains the (declared or implicit) scale
   *   of the type for this attribute. The scale indicates the number of significant digits to the right of the decimal point.
   * - If base data type is an array. Same rule applies for the data type of the array, and this value would become scale
   *   of the data type of the array.
   * - For all other base data types, this is `undefined`.
   * For example: The number 23.5141 has a precision of 6 and a scale of 4. Integers can be considered to have a scale of zero.
   */
  public readonly scale?: number;

  /** If type is an array, this is the dimension of the array. Otherwise this is 0. */
  public readonly arrayDimension: number;

  /**
   * Default value without typecast. Default values includes single quotes except sql functions and numeric values.
   *
   * Please note numeric values which may not be represented by JavaScript values are returned as strings. See [here](https://github.com/brianc/node-pg-types/)
   *
   * @see [[Domain.defaultWithTypeCast]] for default values with typecast as returned by PostgreSQL
   * @example
   * const table = db('crm').schema('public').table('contact');
   * const defaultName = table.get("name").default;                     // "'George'"
   * const defaultNameWithCast = table.get("name").defaultWithTypeCast; // "'George'::character varying"
   * const defaultAge = table.get("age").default;                       // 20
   * const defaultStamp = table.get("created_at").default;              // "now()"
   */
  public readonly default: number | string | boolean | null;

  /**
   * All {@link Constraint constraints} of the constraint as an [[IndexableArray]] ordered by name.
   */
  public readonly checkConstraints: IndexableArray<CheckConstraint, "name", never, true> = IndexableArray.throwingFrom([], "name");
}
