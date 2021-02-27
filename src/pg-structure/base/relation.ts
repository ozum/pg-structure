import { Table, ForeignKey } from "../..";
import strip from "../../util/strip";
import getAdjectives from "../../util/get-adjectives";

/**
 * Table type to exclude it's name from generated name, alias or adjectives.
 *
 * @example
 * const sourceAlias = relation.getSourceAliasWithout({ target }); // Generates source alias and replace target table name from it.
 */
export type RelationWithout = "any" | "source" | "target";

/** @ignore */
export interface RelationConstructorArgs {} // eslint-disable-line @typescript-eslint/no-empty-interface

/**
 * Class which represent a {@link Relation relationship}. Provides attributes and methods for details of the {@link Relation relationship}.
 * @abstract
 * @hideconstructor
 */
export default abstract class Relation {
  /** @ignore */
  public constructor(args: RelationConstructorArgs) {
    const stub: any = args; // eslint-disable-line @typescript-eslint/no-unused-vars
    stub.x = 3;
  }

  /** Whether this relationship targets many items. This is `true` for "one to many" and "many to many" relationships. */
  public toMany = false;

  /** @ignore */
  abstract readonly sourceTable: Table;
  /** @ignore */
  abstract readonly targetTable: Table;
  /** @ignore */
  abstract readonly foreignKey: ForeignKey;
  /** @ignore */
  abstract readonly info: string;
  /** @ignore */
  abstract get name(): string;

  /** @ignore */
  protected getWithout(string: string, without?: RelationWithout | RelationWithout[]): string {
    const withouts = new Set(Array.isArray(without) ? without : [without]);
    let result = string;

    if (withouts.has("source") || withouts.has("any")) {
      result = strip(result, this.sourceTable.name);
    }
    if (withouts.has("target") || withouts.has("any")) {
      result = strip(result, this.targetTable.name);
    }
    return result;
  }

  /**
   * Returns source table name after replacing given tables' names from it.
   *
   * @param without is type or types of tables to exclude names of.
   * @returns source table name after given tables' names replaced.
   */
  public getSourceNameWithout(without: RelationWithout | RelationWithout[]): string {
    return this.getWithout(this.sourceTable.name, without);
  }

  /**
   * Returns target table name after replacing given tables' names from it.
   *
   * @param without is type or types of tables to exclude names of.
   * @returns target table name after given tables' names replaced.
   */
  public getTargetNameWithout(without: RelationWithout | RelationWithout[]): string {
    return this.getWithout(this.targetTable.name, without);
  }

  /** Source table name. */
  public get sourceName(): string {
    return this.getWithout(this.sourceTable.name);
  }

  /** Target table name */
  public get targetName(): string {
    return this.getWithout(this.targetTable.name);
  }

  /** Source table's adjective extracted from foreign key name. */
  public get sourceAdjective(): string | undefined {
    return getAdjectives(this.foreignKey.name, this.sourceTable.name, this.targetTable.name)[0];
  }

  /** Source table's adjective extracted from foreign key name. */
  public get targetAdjective(): string | undefined {
    return getAdjectives(this.foreignKey.name, this.sourceTable.name, this.targetTable.name)[1];
  }
}
