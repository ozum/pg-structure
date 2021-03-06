import { Memoize } from "@typescript-plus/fast-memoize-decorator/dist/src";
import { RelationNameFunctions, RelationType } from "../../types/index";
import Relation, { RelationConstructorArgs, RelationWithout } from "../base/relation";
import Table from "../entity/table";
import ForeignKey from "../constraint/foreign-key";
import getAliases from "../../util/get-aliases";
import getRelationNameFunctions from "../../util/naming-function";

/** @ignore */
export interface O2MRelationConstructorArgs extends RelationConstructorArgs {
  foreignKey: ForeignKey;
}

/**
 * Class which represent one to many relationship which resembles `hasMany` relation in ORMs (Object Relational Mappers).
 * Provides attributes and methods for details of the relationship.
 *
 * <span id="exampleSchema"></span>Below is a database schema as an example:
 * ![Database Schema](/images/schema-through.png)
 *
 * Some definitions used in descriptions for {@link O2MRelation}.
 * * ** Source Table: ** Table which this relationship belongs to.
 * * ** Target Table: ** Table that is related to base table.
 *
 * @example
 * // Example tables have single primary key and examples first relation. So zero index ([0]) is used. Use all array elements if necessary.
 * // product ----< line_item
 * // (source)       (target)
 *
 * const relation         = product.o2mRelations[0];              // RELATION:    product ---< line_item
 * const foreignKey       = relation.foreignKey;                  // FOREIGN KEY:          ^-- product_has_carts
 * const sourceTable      = relation.sourceTable;                 // TABLE:       product
 * const targetTable      = relation.targetTable;                 // TABLE:       line_item
 * const FKColumn         = relation.foreignKey.columns[0];       // COLUMN:      product_id  (from line_item table)
 * const sourcePKColumn   = relation.sourceTable.primaryKeys[0];  // COLUMN:      id          (from product table)
 */
export default class O2MRelation extends Relation {
  /** @ignore */
  public constructor(args: O2MRelationConstructorArgs) {
    super(args);
    this.foreignKey = args.foreignKey;
  }

  /**
   * Type of the relation, which is `o2m` for [[O2MRelation]].
   * For TypeScript it is enum of `RelationType.O2M`.
   */
  public readonly type = RelationType.O2M;

  /**
   * Whether the relation targets to many. Since, one to many relations targets many, this is `true`.
   */
  public readonly toMany: boolean = true;

  /**
   * Suggested name for {@link Relation relation}.
   *
   * @see {@link ../relation-names.md Relation Names}
   */
  @Memoize()
  public get name(): string {
    return this.foreignKey.db._relationNameFunctions.o2m(this);
  }

  /**
   * Retunrs name for the relation using given naming function.
   *
   * @param relationNameFunctions are custom functions or name of the modulethat exports relation name functions to generate names with. `pg-structure` provides some builtin modules (`short`, `optimal` and `descriptive`), but you can use your own.
   * @returns name for the relation using naming function.
   */
  @Memoize()
  public getName(relationNameFunctions: RelationNameFunctions | string): string {
    return getRelationNameFunctions(relationNameFunctions).o2m(this);
  }

  /**
   * Informational text representation of the relation.
   *
   * @example
   * const info = relation.info; // [public.contact]――― cart_contact ――⥷ [public.cart]
   */
  public get info(): string {
    return `[${this.sourceTable.fullName}]――― ${this.foreignKey.name} ――⥷ [${this.targetTable.fullName}]`;
  }

  /**
   * {@link Table} which this {@link O2MRelation relation} belongs to.
   *
   * @example
   * const relation     = product.O2MRelationRelations[0];  // RELATION:    product ---< line_item
   * const sourceTable  = relation.sourceTable;             // TABLE:       product
   */
  public get sourceTable(): Table {
    return this.foreignKey.referencedTable;
  }

  /**
   * {@link Table} which this {@link O2MRelation relation} is referring to.
   *
   * @example
   * const relation     = product.O2MRelationRelations[0];  // RELATION:    product ---< line_item
   * const targetTable  = relation.targetTable;             // TABLE:       line_item
   */
  public get targetTable(): Table {
    return this.foreignKey.table;
  }

  /**
   * {@link ForeignKey Foreign key} between {@link O2MRelation.sourceTable source table} and {@link O2MRelation.targetTable target table}.
   *
   * @example
   * const relation     = product.O2MRelationRelations[0];  // RELATION:    product ---< line_item
   * const foreignKey   = relation.foreignKey;              // CONSTRAINT:           ^-- product_has_carts
   * const FKColumn     = relation.foreignKey.columns[0];   // COLUMN:      product_id (from line_item table)
   */
  public foreignKey: ForeignKey;

  /**
   * Returns source table alias after replacing given tables' names from it.
   *
   * @param without is type or types of tables to exclude names of.
   * @returns source table alias after given tables' names replaced.
   */
  public getSourceAliasWithout(without: RelationWithout | RelationWithout[]): string {
    return this.getWithout(getAliases(this.foreignKey)[1], without);
  }

  /**
   * Returns target table alias after replacing given tables' names from it.
   *
   * @param without is type or types of tables to exclude names of.
   * @returns target table alias after given tables' names replaced.
   */
  public getTargetAliasWithout(without: RelationWithout | RelationWithout[]): string {
    return this.getWithout(getAliases(this.foreignKey)[0], without);
  }

  /** Source table alias */
  public get sourceAlias(): string {
    return this.getWithout(getAliases(this.foreignKey)[1]);
  }

  /** Target table alias */
  public get targetAlias(): string {
    return this.getWithout(getAliases(this.foreignKey)[0]);
  }
}
