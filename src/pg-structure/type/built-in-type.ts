/* eslint-disable no-useless-constructor */
import Type, { TypeConstructorArgs } from "../base/type";
import { TypeCategory } from "../../types";

/** @ignore */
export interface BultInTypeConstructorArgs extends TypeConstructorArgs {
  shortName?: string;
  internalName?: string;
  category: TypeCategory;
  hasLength?: boolean;
  hasScale?: boolean;
  hasPrecision?: boolean;
}

/**
 * Class which represent a built-in PostgreSQL {@link Type type}. Provides attributes and methods for details of the built-in {@link Type type}.
 */
export default class BuiltInType extends Type {
  /** @ignore */
  public constructor(args: BultInTypeConstructorArgs) {
    super(args);

    this.shortName = args.shortName || args.name;
    this.internalName = args.internalName || args.shortName || args.name;
    this.category = args.category;
    this.hasLength = args.hasLength || false;
    this.hasScale = args.hasScale || false;
    this.hasPrecision = args.hasPrecision || false;
  }

  public internalName: string;
  public shortName: string;

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
