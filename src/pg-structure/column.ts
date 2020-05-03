import IndexableArray from "indexable-array";
import { Memoize } from "@typescript-plus/fast-memoize-decorator/dist/src";
import Schema from "./schema";
import Index from ".";
import DbObject, { DbObjectConstructorArgs } from "./base/db-object";
import ForeignKey from "./constraint/foreign-key";
import Type from "./base/type";
import Entity from "./base/entity";
import Table from "./entity/table";
import { replaceTypeCast, isSerial, parseSQLType } from "../util/helper";
import CompositeType from "./type/composite-type";
import View from "./entity/view";

/** @ignore */
export interface ColumnConstructorArgs extends DbObjectConstructorArgs {
  parent: Entity | CompositeType;
  notNull: boolean;
  sqlType: string;
  arrayDimension: number;
  defaultWithTypeCast: string | null;
  attributeNumber: number;
}

/**
 * Class which represent a column. Provides attributes and methods for details of the column.
 */
export default class Column extends DbObject {
  /** @ignore */
  public constructor(args: ColumnConstructorArgs) {
    super(args);

    this.parent = args.parent;
    const { schema, typeName, length, precision, scale } = parseSQLType(this.db, args.sqlType);
    this.notNull = args.notNull;
    this.type = schema.types.getMaybe(typeName, { key: "shortName" }) || schema.types.get(typeName);
    this.length = length;
    this.precision = precision;
    this.scale = scale;
    this.arrayDimension = args.arrayDimension || 0;
    this.defaultWithTypeCast = args.defaultWithTypeCast;
    this.attributeNumber = args.attributeNumber;
  }

  /**
   * The number of the column. Ordinary columns are numbered from 1 up. Since dropped columns have an attribute number too,
   * attribute number may be different from array index number.
   */
  public readonly attributeNumber: number;

  /**
   * Parent {@link DbObject database object} this column belongs to.
   */
  public readonly parent: Entity | CompositeType;

  /**
   * {@link Entity} this column belongs to if it belongs to a {@link Table table} or {@link View view}.
   *
   * @example
   * const entity = column.entity; // Entity instance
   */
  public get entity(): Entity | undefined {
    return this.parent instanceof Entity ? this.parent : undefined;
  }

  /**
   * {@link Table} this column belongs to if it belongs to a {@link Table table}.
   *
   * @example
   * const table = column.table; // Table instance
   */
  public get table(): Table | undefined {
    return this.parent instanceof Table ? this.parent : undefined;
  }

  /**
   * {@link View} this column belongs to if it belongs to a {@link View view}.
   *
   * @example
   * const table = column.view; // Table instance
   */
  public get view(): View | undefined {
    return this.parent instanceof View ? this.parent : undefined;
  }

  /**
   * Full name of the object with '.' notation including [[Schema]] name.
   *
   * @example
   * const fullName = column.fullName; // public.member.name
   */
  public get fullName(): string {
    return `${this.parent.fullName}.${this.name}`;
  }

  /** `true` if column is not allowed to be null. */
  public readonly notNull: boolean;

  /**  Data type of the column. */
  public readonly type: Type;

  /** Whether this column has `nextval()` default value or one of `serial` (auto incremented) types. */
  public get isSerial(): boolean {
    return isSerial(this.defaultWithTypeCast);
  }

  /**
   * - If data type identifies an exact numeric type, this contains the (declared or implicit) scale
   *   of the type for this attribute. The scale indicates the number of significant digits to the right of the decimal point.
   * - If data type is an array. Same rule applies for the data type of the array, and this value would become scale
   *   of the data type of the array.
   * - For all other data types, this is `undefined`.
   * For example: The number 23.5141 has a precision of 6 and a scale of 4. Integers can be considered to have a scale of zero.
   */
  public readonly scale?: number;

  /**
   * - If data type identifies a numeric type, this contains the (declared or implicit) precision of
   *   the type for this column. The precision indicates the number of significant digits.
   * - If data type identifies a date, time, timestamp, or interval type, this column contains the (declared or implicit)
   *   fractional seconds precision of the type for this attribute, that is, the number of decimal digits maintained
   *   following the decimal point in the seconds value.
   * - If data type is an array. Same rules apply for the data type of the array, and this value would become precision
   *   of the data type of the array.
   * - For all other data types, this is `undefined`.
   * For example: The number 23.5141 has a precision of 6 and a scale of 4.
   */
  public readonly precision?: number;

  /** If type is an array, this is the dimension of the array. Otherwise this is 0. */
  public readonly arrayDimension: number;

  /**
   * Default expression of the column with typecast. PostgreSQL returns default values with typecast.
   * Default values includes single quotes except sql functions and numeric values. Also sql functions and numeric values
   * do not contain type cast.
   *
   * Numeric values are returned as string too. Please see: https://github.com/brianc/node-postgres/issues/1300
   *
   * @see [[Column.default]] for accessing default values without typecast.
   * @example
   * const table = db('crm').schema('public').table('contact');
   * const defaultName = table.get("name").default;                     // "'George'"
   * const defaultNameWithCast = table.get("name").defaultWithTypeCast; // "'George'::character varying"
   * const defaultAge = table.get("age").default;                       // 20
   * const defaultStamp = table.get("created_at").default;              // "now()"
   */
  public readonly defaultWithTypeCast: string | null;

  /**
   * Default value without typecast. Default values includes single quotes except sql functions and numeric values.
   *
   * Numeric values are returned as string too. Please see: https://github.com/brianc/node-postgres/issues/1300
   *
   * @see [[Column.defaultWithTypeCast]] for default values with typecast as returned by PostgreSQL
   * @example
   * const table = db('crm').schema('public').table('contact');
   * const defaultName = table.get("name").default;                     // "'George'"
   * const defaultNameWithCast = table.get("name").defaultWithTypeCast; // "'George'::character varying"
   * const defaultAge = table.get("age").default;                       // 20
   * const defaultStamp = table.get("created_at").default;              // "now()"
   */
  public get default(): number | boolean | string | null {
    return replaceTypeCast(this.defaultWithTypeCast);
  }

  /**
   * [[IndexableArray]] of {@link ForeignKey foreign keys} which column is part of.
   */
  @Memoize()
  public get foreignKeys(): IndexableArray<ForeignKey, "name", never, true> {
    return this.entity instanceof Table
      ? this.entity.foreignKeys.filter((e) => e.columns.has(this.name))
      : IndexableArray.throwingFrom([], "name");
  }

  /**
   * IndexableArray of {@link Index indexes}, which column is part of.
   */
  @Memoize()
  public get indexes(): IndexableArray<Index, "name", never, true> {
    return this.entity instanceof Table
      ? this.entity.indexes.filter((e) => e.columns.has(this.name))
      : IndexableArray.throwingFrom([], "name");
  }

  /**
   * Whether this column is part of a {@link ForeignKey foreign key}.
   * Please note that a foreign key may contain more than one column and a column may part of more than one
   * {@link ForeignKey foreign key}.
   */
  public get isForeignKey(): boolean {
    return this.foreignKeys.length > 0;
  }

  /**
   * Whether column is part of a {@link PrimaryKey primary key}. Please note that a primary key may contain more than one column.
   */
  public get isPrimaryKey(): boolean {
    return this.table instanceof Table && this.table.primaryKey ? this.table.primaryKey.columns.has(this.name) : false;
  }

  /**
   * Length of the column.
   * - For data type identified as a character or bit string type, this is the declared
   * maximum length. If column is an array, same rule applies data type of the array.
   * - For character arrays or bit string type arrays, this is the declared maximum length of the array's data type.
   * - For arrays atttypmod records type-specific data supplied at table creation time (for example, the maximum length
   * of a varchar column). It is passed to type-specific input functions and length coercion functions.
   * - This value is `undefined` for all other data types or if no maximum length was declared.
   */
  public readonly length?: number;

  /**
   * All referenced columns in all {@link ForeignKey foreign keys} by this column.
   */
  @Memoize()
  public get referencedColumns(): IndexableArray<Column, "name", never, true> {
    return (
      this.foreignKeys
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        .map((fk) => fk.referencedColumnsBy.find((by) => by.column === this)!.references)
        .filter(Boolean)
    );
  }

  /**
   * {@link Schema} this column belongs to.
   */
  public get schema(): Schema {
    return this.parent.schema;
  }

  /**
   * [[IndexableArray]] of unique {@link Index indexes}, which column is part of. Excludes primary key indexes. PostgreSQL already creates a unique index for unique
   * {@link Constraint constraints}. So there is no need to look for unique constraints which will result duplicates.
   *
   * @see [[Column.uniqueIndexes]] for all unique indexes including primary key indexes.
   */
  @Memoize()
  public get uniqueIndexesNoPk(): IndexableArray<Index, "name", never, true> {
    return this.uniqueIndexes.filter((e) => !e.isPrimaryKey);
  }

  /**
   * [[IndexableArray]] of unique {@link Index indexes}, which column is part of. PostgreSQL already creates a unique index for unique
   * {@link Constraint constraints}. So there is no need to look for unique constraints which will result duplicates.
   *
   * @see [[Column.uniqueIndexesNoPk]] for unique indexes excluding primary key indexes.
   */
  @Memoize()
  public get uniqueIndexes(): IndexableArray<Index, "name", never, true> {
    return this.indexes.filter((e) => e.isUnique);
  }
}
