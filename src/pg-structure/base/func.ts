/* eslint-disable no-plusplus */
import IndexableArray from "indexable-array";
import FunctionArgument, { FunctionArgumentConstructorArgs } from "../function-argument";
import { ArgumentMode, Volatility, ParallelSafety } from "../../types/index";
import { ArgumentModeLetter } from "../../types/query-result";
import Schema from "../schema";
import DbObject, { DbObjectConstructorArgs } from "./db-object";
import Type from "./type";
import Db from "../db";

/** @ignore */
export interface FunctionConstructorArgs extends DbObjectConstructorArgs {
  oid: number;
  schema: Schema;
  source: string;
  language: string;
  estimatedCost: number;
  estimatedRows: number;
  isLeakProof: boolean;
  isStrict: boolean;
  parallelSafety: ParallelSafety;
  volatility: Volatility;
  returnType: number;
  returnsSet: boolean;
  variadicArgumentType: number;
  argumentTypes: number[];
  argumentNames: string[] | null; // Note that subscripting is 1-based
  argumentModes: string | null; // If all the arguments are IN arguments, this field will be null.
  signature: string;
  comment: string;
}

/**
 * Returns type for given oid and whether it is an array.
 *
 * @ignore
 * @param db is the [[Db]] object.
 * @param oid is the oid of the type.
 * @returns type and whether type is an array.
 */
function getType(db: Db, oid: number): [Type, boolean] {
  const type = db.allTypes.getMaybe(oid, { key: "oid" });
  if (type) return [type, false];
  return [db.allTypes.get(oid, { key: "arrayOid" }), true];
}

/** @ignore */
const argumentModeLetterMap: Record<ArgumentModeLetter, ArgumentMode> = {
  i: "in",
  b: "inout",
  o: "out",
  v: "variadic",
  t: "table",
};

/**
 * Class which represent a PostgreSQL ({@link Func function}.
 * Provides attributes and methods for details of the function.
 * Class name is `Func` instead of `Function`, because `Function` is a reserved word in JavaScript,
 * and cannot be used as a class name.
 */
export default abstract class Func extends DbObject {
  /** @ignore */
  public constructor(args: FunctionConstructorArgs) {
    super(args);
    const { db } = args.schema;
    this.oid = args.oid;
    this.schema = args.schema;
    this.source = args.source;
    this.language = args.language;
    this.estimatedCost = args.estimatedCost;
    this.estimatedRows = args.estimatedRows;
    this.isLeakProof = args.isLeakProof;
    this.isStrict = args.isStrict;
    this.parallelSafety = args.parallelSafety;
    this.volatility = args.volatility;
    [this.returnType, this.returnsArray] = getType(db, args.returnType);
    this.returnsSet = args.returnsSet;

    const argumentModes =
      args.argumentModes === null ? null : (args.argumentModes.replace(/^\{(.+)\}$/, "$1").split(",") as ArgumentModeLetter[]);

    for (let i = 0; i <= args.argumentTypes.length - 1; i++) {
      const argArgs: FunctionArgumentConstructorArgs = {} as any;
      [argArgs.type, argArgs.isArray] = getType(db, args.argumentTypes[i]);
      argArgs.name = args.argumentNames === null ? "" : args.argumentNames[i];
      argArgs.mode = argumentModes === null ? "in" : argumentModeLetterMap[argumentModes[i]];
      argArgs.argumentNumber = i;
      this.arguments.push(new FunctionArgument(argArgs));
    }

    // this.variadicArgumentType = db.allTypes.get(args.variadicArgumentType, { key: "oid" });
  }

  /** Object identifier for the {@link Function} */
  public readonly oid: number;

  /** [[Schema]] of the object. */
  public readonly schema: Schema;

  /** Source definition of the function. */
  public readonly source: string;

  /** Language name of the function. */
  public readonly language: string;

  /** Estimated execution cost (in units of cpu_operator_cost); if proretset, this is cost per row returned */
  public readonly estimatedCost: number;

  /** Estimated number of result rows (zero if not proretset) */
  public readonly estimatedRows: number;

  /** The function has no side effects. No information about the arguments is conveyed except via the return value. Any function that might throw an error depending on the values of its arguments is not leak-proof. */
  public readonly isLeakProof: boolean;

  /** Whether function returns null if any call argument is null. */
  public readonly isStrict: boolean;

  /** whether the function can be safely run in parallel mode. */
  public readonly parallelSafety: ParallelSafety;

  /** Whether the function's result depends only on its input arguments, or is affected by outside factors. */
  public readonly volatility: Volatility;

  /** Data type of the return value. */
  public readonly returnType: Type;

  /** Whether function returns a set. */
  public readonly returnsSet: boolean;

  /** Whether function returns an array. */
  public readonly returnsArray: boolean = false;

  /**
   * All {@link FunctionArgument function arguments} of the {@link Function function} as an {@link IndexableArray indexable array} ordered by same order they are defined
   * in PostgreSQL {@link Function function}.
   *
   * Please note that, `name` is not required for PostgreSQL function arguments. There may be multiple empty string arguments.
   * {@link IndexableArray https://www.npmjs.com/package/indexable-array} returns first one.
   * You may also use `getAll` to get all unnamed arguments as an array.
   *
   * @example
   * myFunc.arguments.get("maxVal");
   * myFunc.arguments.getAll("");
   */
  public readonly arguments: IndexableArray<FunctionArgument, "name", "argumentNumber", true> = IndexableArray.throwingFrom(
    [],
    "name",
    "argumentNumber"
  );

  /**
   * Full name of the object with '.' notation including [[Schema]] name.
   *
   * @example
   * const fullName = func.fullName; // public.some_func
   */
  public get fullName(): string {
    return `${this.schema.name}.${this.name}`;
  }
}
