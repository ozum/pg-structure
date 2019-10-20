import Relation, { RelationConstructorArgs, RelationWithout } from "../base/relation";
import Table from "../entity/table";
import ForeignKey from "../constraint/foreign-key";
import { getAliases } from "../../util/helper";

/** @ignore */
export interface M2ORelationConstructorArgs extends RelationConstructorArgs {
  foreignKey: ForeignKey;
}

/**
 * Class which represent many to one relationship which resembles `belongsTo` relation in ORMs (Object Relational Mappers).
 * Provides attributes and methods for details of the relationship.
 *
 * Actually there is no many to one relation in database engine. It is basically one to many relation in reverse direction.
 *
 * <span id="exampleSchema"></span>Below is a database schema as an example:
 * ![Database Schema](/images/schema-through.png)
 *
 * Some definitions used in descriptions for {@link M2ORelation}.
 * * ** Source Table: ** Table which this relationship belongs to.
 * * ** Target Table: ** Table that is related to base table.
 * @example
 * // Example tables have single primary key and examples first relation. So zero index ([0]) is used. Use all array elements if necessary.
 * // line_item >---- product
 * // (source)        (target)
 *
 * const relation     = line_item.m2oRelations[0];            // RELATION:    line_item >---- product
 * const foreignKey   = relation.foreignKey;                  // CONSTRAINT:               ^-- product_has_carts
 * const sourceTable  = relation.sourceTable;                 // TABLE:       line_item
 * const targetTable  = relation.targetTable;                 // TABLE:       product
 * const FKColumn     = relation.foreignKey.columns[0];       // COLUMN:      product_id  (from line_item table)
 * const PKColumn     = relation.targetTable.primaryKeys[0];  // COLUMN:      id          (from product table)
 */
export default class M2ORelation extends Relation {
  /** @ignore */
  public constructor(args: M2ORelationConstructorArgs) {
    super(args);
    this.foreignKey = args.foreignKey;
  }

  /**
   * Informational text representation of the relation.
   *
   * @example
   * const info = relation.info; // [public.cart] ⭃―― cart_contact ―――[public.contact]
   */
  public get info(): string {
    return `[${this.sourceTable.fullName}] ⭃―― ${this.foreignKey.name} ―――[${this.targetTable.fullName}]`;
  }

  /**
   * {@link Table} which this {@link M2ORelation relation} belongs to.
   *
   * @example
   * const relation     = product.M2ORelationRelations[0];  // RELATION:    line_item >---- product
   * const sourceTable  = relation.sourceTable;             // TABLE:       line_item
   */
  public get sourceTable(): Table {
    return this.foreignKey.table;
  }

  /**
   * {@link Table} which this {@link M2ORelation relation} is referred by.
   *
   * @example
   * const relation     = product.M2ORelationRelations[0];  // RELATION:    line_item >---- product
   * const targetTable  = relation.targetTable;             // TABLE:       product
   */
  public get targetTable(): Table {
    return this.foreignKey.referencedTable;
  }

  /**
   * {@link ForiegnKey Foreign key} between {@link M2ORelation.sourceTable source table} and {@link M2ORelation.targetTable target table}.
   *
   * @example
   * const relation     = product.M2ORelationRelations[0];  // RELATION:    line_item >---- product
   * const foreignKey   = relation.foreignKey;              // CONSTRAINT:               ^-- product_has_carts
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
    return this.getWithout(getAliases(this.foreignKey)[0], without);
  }

  /**
   * Returns target table alias after replacing given tables' names from it.
   *
   * @param without is type or types of tables to exclude names of.
   * @returns target table alias after given tables' names replaced.
   */
  public getTargetAliasWithout(without: RelationWithout | RelationWithout[]): string {
    return this.getWithout(getAliases(this.foreignKey)[1], without);
  }

  /** Source table alias */
  public get sourceAlias(): string {
    return this.getWithout(getAliases(this.foreignKey)[0]);
  }

  /** Target table alias */
  public get targetAlias(): string {
    return this.getWithout(getAliases(this.foreignKey)[1]);
  }
}
