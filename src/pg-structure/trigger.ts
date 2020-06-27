import { TriggerOrientation, TriggerTiming, TriggerEvent, TriggerEnabled } from "../types/index";
import DbObject, { DbObjectConstructorArgs } from "./base/db-object";
import Schema from "./schema";
import View from "./entity/view";
import Table from "./entity/table";
import NormalFunction from "./function/normal-function";

/** @ignore */
export interface TriggerObjectConstructorArgs extends DbObjectConstructorArgs {
  oid: number;
  parent: Table | View;
  name: string;
  function: NormalFunction;
  orientation: TriggerOrientation;
  timing: TriggerTiming;
  events: TriggerEvent[];
  condition: string | null;
  isEnabled: TriggerEnabled;
  isDeferrable: boolean;
  isInitiallyDeferred: boolean;
}

/**
 * Class which represent a PostgreSQL {@link Trigger trigger}. Provides attributes and methods for details of the {@link Trigger trigger}.
 */
export default class Trigger extends DbObject {
  /** @ignore */
  public constructor(args: TriggerObjectConstructorArgs) {
    super(args);
    this.oid = args.oid;
    this.parent = args.parent;
    this.function = args.function;
    this.orientation = args.orientation;
    this.timing = args.timing;
    this.events = args.events;
    this.condition = args.condition === null ? null : args.condition;
    this.isEnabled = args.isEnabled;
    this.isDeferrable = args.isDeferrable;
    this.isInitiallyDeferred = args.isInitiallyDeferred;
  }

  /** Object identifier for the {@link Trigger} */
  public readonly oid: number;

  /**
   * Parent {@link DbObject database object} this trigger is defined in.
   */
  public readonly parent: Table | View;

  /**
   * {@link Table} this trigger defined in if it belongs to a {@link Table table}.
   *
   * @example
   * const table = trigger.table; // Table instance
   */
  public get table(): Table | undefined {
    /* istanbul ignore next */
    return this.parent instanceof Table ? this.parent : undefined;
  }

  /**
   * {@link View} this trigger defined in if it belongs to a {@link View view}.
   *
   * @example
   * const view = trigger.view; // View instance
   */
  public get view(): View | undefined {
    /* istanbul ignore next */
    return this.parent instanceof View ? this.parent : undefined;
  }

  /** [[Schema]] of the object. */
  public get schema(): Schema {
    return this.parent.schema;
  }

  /**
   * Full name of the object with '.' notation including [[Schema]] name.
   *
   * @example
   * const fullName = trigger.fullName; // public.member.updated_at
   */
  public get fullName(): string {
    return `${this.schema.name}.${this.parent.name}.${this.name}`;
  }

  /**  [[Function]] of trigger. */
  public readonly function: NormalFunction;

  /** whether the trigger fires once for each processed row or once for each statement. */
  public readonly orientation: TriggerOrientation;

  /** Time at which the trigger fires. */
  public readonly timing: TriggerTiming;

  /** Events that fires the trigger. */
  public readonly events: TriggerEvent[];

  /** WHEN condition of the trigger, `null` if none. */
  public readonly condition: string | null;

  /** In which session_replication_role modes the trigger fires */
  public readonly isEnabled: TriggerEnabled;

  /** Whether constraint trigger is deferrable */
  public readonly isDeferrable: boolean;

  /** Whether constraint trigger is initially deferred */
  public readonly isInitiallyDeferred: boolean;
}
