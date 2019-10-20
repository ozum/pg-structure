import Type, { TypeConstructorArgs } from "../base/type";
import { parseEnumValues } from "../../util/helper";

/** @ignore */
interface EnumConstructorArgs extends TypeConstructorArgs {
  values: string[];
}

/**
 * Class which represent a PostgreSQL {@link EnumType enum type}. Provides attributes and methods for details of the {@link EnumType enum type}.
 */
export default class EnumType extends Type {
  /** @ignore */
  public constructor(args: EnumConstructorArgs) {
    super(args);
    this.values = parseEnumValues(args.values);
  }

  /** Array of the textual labels for {@link EnumType enum type} values. */
  public readonly values: string[];
}
