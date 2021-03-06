import { Memoize } from "@typescript-plus/fast-memoize-decorator/dist/src";
import { RelationNameFunctions, RelationType } from "../../types/index";
import ForeignKey from "../constraint/foreign-key";
import Table from "../entity/table";
import Relation, { RelationConstructorArgs, RelationWithout } from "../base/relation";
import getAliases from "../../util/get-aliases";
import strip from "../../util/strip";
import getAdjectives from "../../util/get-adjectives";
import getRelationNameFunctions from "../../util/naming-function";

/**
 * Table type to exclude it's name from generated name, alias or adjectives.
 *
 * @example
 * const sourceAlias = m2m.getSourceAliasWithout({ target }); // Generates source alias and replace target table name from it.
 */
type M2MWithout = "any" | "source" | "join" | "target";

/** @ignore */
interface M2MRelationConstructorArgs extends RelationConstructorArgs {
  foreignKey: ForeignKey;
  targetForeignKey: ForeignKey;
}

/**
 * Class which represent a many to many relationship which resembles `belongsToMany` or `hasManyThrough` relations in ORMs (Object Relational Mappers).
 * Provides attributes and methods for details of the relationship.
 *
 * Actually there isn't such a thing called **many to many relationship** or **through constraint** in the database engine.
 * They are concepts to describe records which may be related more than one record on both sides.
 * For example an invoice may contain more than one product and a product may related to more than one invoice.
 * Those relationships are solved using a **join table**.
 *
 * Since those relations are not present in database engine, they are extracted by estimation/interpretation.
 * Many non-join tables in a database could have more than one foreign keys,
 * and they may not meant to be join tables, but they still appear to have through relationships.
 *
 * <span id="exampleSchema"></span>Below is a database schema as an example:
 * ![Database Schema](/images/schema-through.png)
 *
 * Some definitions used in descriptions for {@link M2MRelation}.
 * * ** Source Table: ** Table which this relationship belongs to.
 * * ** Join Table: ** Table that contains common fields from two or more other tables.
 * * ** Target Table: ** Table that is related to base table through a join table.
 * <br><br>
 * Product table has 3 foreign keys. Product table is not meant to be a many to many join table.
 * However product could have been join table for `size & vendor`, `color & vendor` and `size & color`. As a result size,
 * color and vendor tables would have many to many relationships.
 *
 * @example
 * // Example tables have single primary key and and examples first relation. So zero index ([0]) is used. Use all array elements if necessary.
 * // product ----< line_item >---- cart
 * // (source)        (join)       (target)
 *
 * const relation             = product.m2mRelations[0];              // RELATION:    product ---< line_item >--- cart
 * const foreignKey           = relation.foreignKey;                  // FOREIGNKEY:           ^-- product_has_carts
 * const targetForeignKey     = relation.targetForeignKey;            // FOREIGNKEY:       cart_has_products --^
 * const sourceTable          = relation.sourceTable;                 // TABLE:       product
 * const targetTable          = relation.targetTable;                 // TABLE:       cart
 * const sourceJoinFKColumn   = relation.foreignKey.columns[0];       // COLUMN:      product_id  (from line_item table)
 * const targetJoinFKColumn   = relation.targetForeignKey.columns[0]; // COLUMN:      cart_id     (from line_item table)
 * const sourcePKColumn       = relation.sourceTable.primaryKeys[0];  // COLUMN:      id          (from product table)
 * const targetPKColumn       = relation.targetTable.primaryKeys[0];  // COLUMN:      id          (from cart table)
 */
export default class M2MRelation extends Relation {
  /** @ignore */
  public constructor(args: M2MRelationConstructorArgs) {
    super(args);
    this.foreignKey = args.foreignKey;
    this.targetForeignKey = args.targetForeignKey;
  }

  /**
   * Type of the relation, which is `m2m` for [[M2MRelation]].
   * For TypeScript it is enum of `RelationType.M2M`.
   */
  public readonly type = RelationType.M2M;

  /**
   * Whether the relation targets to many. Since, many to many relations targets many, this is `true`.
   */
  public readonly toMany: boolean = true;

  /**
   * Suggested name for {@link Relation relation}.
   *
   * @see {@link ../relation-names.md Relation Names}
   */
  @Memoize()
  public get name(): string {
    return this.foreignKey.db._relationNameFunctions.m2m(this);
  }

  /**
   * Returns name for the relation using given naming function.
   *
   * @param relationNameFunctions are custom functions or name of the module that exports relation name functions to generate names with. `pg-structure` provides some builtin modules (`short`, `optimal` and `descriptive`), but you can use your own.
   * @returns name for the relation using naming function.
   */
  @Memoize()
  public getName(relationNameFunctions: RelationNameFunctions | string): string {
    return getRelationNameFunctions(relationNameFunctions).m2m(this);
  }

  /**
   * Informational text representation of the relation.
   *
   * @example
   * const info = relation.info; // [public.product]――― line_item_product ――⥷ [public.line_item] ⭃―― line_item_cart ―――[public.cart]
   */
  public get info(): string {
    return `[${this.sourceTable.fullName}]――― ${this.foreignKey.name} ――⥷ [${this.joinTable.fullName}] ⭃―― ${this.targetForeignKey.fullName} ―――[${this.targetTable.fullName}]`;
  }

  /**
   * {@link Table} which this relation belongs to.
   *
   * @example
   * const relation = product.M2MRelationRelations[0];  // RELATION:    product ---< line_item >--- cart
   * const source   = relation.sourceTable;             // TABLE:       product
   */
  public get sourceTable(): Table {
    return this.foreignKey.referencedTable;
  }

  /**
   * Join {@link Table} of this relationship. This table contains foreign key columns referring both
   * {@link M2MRelation.sourceTable sourceTable} and {@link M2MRelation.targetTable targetTable}.
   *
   * @example
   * const relation  = product.M2MRelationRelations[0]; // RELATION:    product ---< line_item >--- cart
   * const joinTable = relation.joinTable;              // TABLE:       line_item
   */
  public get joinTable(): Table {
    return this.foreignKey.table;
  }

  /**
   * {@link Table} which this relation is referring to (Through a join table).
   *
   * @example
   * const relation = product.M2MRelationRelations[0];  // RELATION:    product ---< line_item >--- cart
   * const target   = relation.targetTable;             // TABLE:       cart
   */
  public get targetTable(): Table {
    return this.targetForeignKey.referencedTable;
  }

  /**
   * {@link ForeignKey Foreign key} between {@link M2MRelation.sourceTable source table} and {@link M2MRelation.joinTable join table}.
   *
   * @example
   * const relation             = product.M2MRelationRelations[0];        // RELATION:    product ---< line_item >--- cart
   * const foreignKey           = relation.sourceForeignKey;              // CONSTRAINT:           ^-- product_has_carts
   * const sourceJoinFKColumn   = relation.sourceForeignKey.columns[0];   // COLUMN:      product_id (from line_item table)
   */
  public readonly foreignKey: ForeignKey;

  /**
   * {@link ForeignKey Foreign key} between {@link M2MRelation.joinTable join table} and {@link M2MRelation.targetTable target table}.
   *
   * @example
   * const relation             = product.M2MRelationRelations[0];      // RELATION:    product ---< line_item >--- cart
   * const targetForeignKey     = relation.targetForeignKey;            // CONSTRAINT:       cart_has_products --^
   * const targetJoinFKColumn   = relation.targetForeignKey.columns[0]; // COLUMN:      cart_id (from line_item table)
   */
  public readonly targetForeignKey: ForeignKey;

  /** @ignore */
  protected getWithout(string: string, without?: M2MWithout | M2MWithout[]): string {
    const withouts = new Set(Array.isArray(without) ? without : [without]);
    let result = string;

    if (without !== "join") {
      result = super.getWithout(string, without as RelationWithout);
    }

    if (withouts.has("join") || withouts.has("any")) {
      result = strip(result, this.joinTable.name);
    }
    return result;
  }

  /**
   * Returns source table name after replacing given tables' names from it.
   *
   * @param without is type or types of tables to exclude names of.
   * @returns source table name after given tables' names replaced.
   */
  public getSourceNameWithout(without: M2MWithout | M2MWithout[]): string {
    return this.getWithout(this.sourceTable.name, without);
  }

  /**
   * Returns join table name after replacing given tables' names from it.
   *
   * @param without is type or types of tables to exclude names of.
   * @returns join table name after given tables' names replaced.
   */
  public getJoinNameWithout(without: M2MWithout | M2MWithout[]): string {
    return this.getWithout(this.joinTable.name, without);
  }

  /**
   * Returns target table name after replacing given tables' names from it.
   *
   * @param without is type or types of tables to exclude names of.
   * @returns target table name after given tables' names replaced.
   */
  public getTargetNameWithout(without: M2MWithout | M2MWithout[]): string {
    return this.getWithout(this.targetTable.name, without);
  }

  /**
   * Returns source table alias after replacing given tables' names from it.
   *
   * @param without is type or types of tables to exclude names of.
   * @returns source table alias after given tables' names replaced.
   */
  public getSourceAliasWithout(without: M2MWithout | M2MWithout[]): string {
    return this.getWithout(getAliases(this.foreignKey)[1], without);
  }

  /**
   * Returns join table alias after replacing given tables' names from it.
   *
   * @param without is type or types of tables to exclude names of.
   * @returns join table alias after given tables' names replaced.
   */
  public getJoinAliasWithout(without: M2MWithout | M2MWithout[]): string {
    return this.getWithout(getAliases(this.foreignKey)[0], without);
  }

  /**
   * Returns target table alias after replacing given tables' names from it.
   *
   * @param without is type or types of tables to exclude names of.
   * @returns target table alias after given tables' names replaced.
   */
  public getTargetAliasWithout(without: M2MWithout | M2MWithout[]): string {
    return this.getWithout(getAliases(this.targetForeignKey)[1], without);
  }

  /** Source table name */
  public get sourceName(): string {
    return this.getWithout(this.sourceTable.name);
  }

  /** Join table name. */
  public get joinName(): string {
    return this.getWithout(this.joinTable.name);
  }

  /** Target table name */
  public get targetName(): string {
    return this.getWithout(this.targetTable.name);
  }

  /** Source table alias */
  public get sourceAlias(): string {
    return this.getWithout(getAliases(this.foreignKey)[1]);
  }

  /** Join table alias */
  public get joinAlias(): string {
    return this.getWithout(getAliases(this.foreignKey)[0]);
  }

  /** Target table alias */
  public get targetAlias(): string {
    return this.getWithout(getAliases(this.targetForeignKey)[1]);
  }

  /** Source table adjective */
  public get sourceAdjective(): string | undefined {
    return getAdjectives(this.foreignKey.name, this.sourceTable.name, this.joinTable.name)[0];
  }

  /** Join table adjective */
  public get joinAdjective(): string | undefined {
    return getAdjectives(this.foreignKey.name, this.sourceTable.name, this.joinTable.name)[1];
  }

  /** Target table adjective */
  public get targetAdjective(): string | undefined {
    return getAdjectives(this.targetForeignKey.name, this.joinTable.name, this.targetTable.name)[1];
  }
}
