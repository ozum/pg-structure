import { ArgumentMode } from "../types/index";
import Type from "./base/type";

/** @ignore */
export interface FunctionArgumentConstructorArgs {
  type: Type;
  isArray: boolean;
  name: string;
  mode: ArgumentMode;
  argumentNumber: number;
}

export default class FunctionArgument {
  /** @ignore */
  public constructor(args: FunctionArgumentConstructorArgs) {
    this.type = args.type;
    this.isArray = args.isArray;
    this.name = args.name;
    this.mode = args.mode;
    this.argumentNumber = args.argumentNumber;
  }

  /** Type of the argument */
  public readonly type: Type;

  /** Whether given argument is an array. */
  public readonly isArray: boolean;

  /** Name of the argument. Empty string if arguments is without a name. */
  public readonly name: string;

  /** Mode of the function arguments such as `in`, `inout`, `out`, `variadic` or `table`. */
  public readonly mode: ArgumentMode;

  /** The order number of the argument. It is zero based index. */
  public readonly argumentNumber: number;
}
