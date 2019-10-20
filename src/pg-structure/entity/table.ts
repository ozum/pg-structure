import IndexableArray from "indexable-array";
import { Memoize } from "@typescript-plus/fast-memoize-decorator/dist/src";
import Entity from "../base/entity";
import Constraint from "../base/constraint";
import PrimaryKey from "../constraint/primary-key";
import ForeignKey from "../constraint/foreign-key";
import M2ORelation from "../relation/m2o-relation";
import O2MRelation from "../relation/o2m-relation";
import M2MRelation from "../relation/m2m-relation";
import Index from "..";
import { isForeignKey, isPrimaryKey, isUniqueConstraint, isCheckConstraint, isExclusionConstraint } from "../../util/type-guard";
import UniqueConstraint from "../constraint/unique-constraint";
import CheckConstraint from "../constraint/check-constraint";
import ExclusionConstraint from "../constraint/exclusion-constraint";
import { Column } from "../..";
import { getForeignKeysTo } from "../../util/helper";

/**
 * Class which represent a table. Provides attributes and methods for details of the table.
 * Tables may have relationships with other tables.
 *
 * <span id="exampleSchema"></span>Below is a database schema which is used in code examples.
 * ![Database Schema](/images/schema-through.png)
 */
export default class Table extends Entity {
  /**
   * All {@link Constraint constraints} in the table as an [[IndexableArray]] ordered by name.
   */
  public readonly constraints: IndexableArray<Constraint, "name", never, true> = IndexableArray.throwingFrom([], "name");

  /**
   * All {@link ForeignKey foreign keys} which are referring to this {@link Table table} as an [[IndexableArray]].
   *
   * @see [[Table.o2mRelations]], [[Table.m2oRelations]], [[Table.m2mRelations]] to get more details about relations.
   */
  public readonly foreignKeysToThis: IndexableArray<ForeignKey, "name", never, true> = IndexableArray.throwingFrom([], "name");

  /**
   * All {@link Index indexes} in the table as an [[IndexableArray]], ordered by name.
   */
  public readonly indexes: IndexableArray<Index, "name", never, true> = IndexableArray.throwingFrom([], "name");

  /**
   * Returns {@link ForeignKey foreign keys} from this table to `target` table.
   *
   * @param target is target {@link Table table} to get foreign keys for. It could be name, full name or {@link Table table} object.
   * @returns foreign keys from this table to target table.
   */
  public getForeignKeysTo(target: Table | string): IndexableArray<ForeignKey, "name", never, true> {
    const targetTable = typeof target === "string" ? this.schema.tables.getMaybe(target) || this.db.tables.get(target) : target;
    return getForeignKeysTo(this, targetTable);
  }

  /**
   * Returns {@link ForeignKey foreign keys} from given table to this table.
   *
   * @param from is {@link Table table} to get foreign keys targeting this table. It could be name, full name or {@link Table table} object.
   * @returns foreign keys from given table to this table.
   */
  public getForeignKeysFrom(from: Table | string): IndexableArray<ForeignKey, "name", never, true> {
    const sourceTable = typeof from === "string" ? this.schema.tables.getMaybe(from) || this.db.tables.get(from) : from;
    return getForeignKeysTo(sourceTable, this);
  }

  /**
   * Returns joıin tables between this table and target table.
   *
   * @param target is target {@link Table table} to get join tables for. It could be name, full name or {@link Table table} object.
   */
  public getJoinTablesTo(target: Table | string): IndexableArray<Table, "name", never, true> {
    const targetTable = typeof target === "string" ? this.schema.tables.getMaybe(target) || this.db.tables.get(target) : target;
    const joinTables = this.getThroughConstraints()
      .filter(tc => tc.toOther.referencedTable === targetTable)
      .map(tc => tc.toOther.table);
    const uniqueJoinTables = new Set(joinTables);
    return IndexableArray.throwingFrom(uniqueJoinTables, "name").sortBy("name");
  }

  /**
   * All {@link ForeignKey foreign keys} in the {@link Table table} as an [[IndexableArray]] ordered by name.
   *
   * @see {@link Table.o2mRelations o2mRelations}, {@link Table.m2oRelations m2oRelations}, {@link Table.m2mRelations m2mRelations} to get more details about relations.
   */
  public get foreignKeys(): IndexableArray<ForeignKey, "name", never, true> {
    return this.constraints.filter(isForeignKey);
  }

  /**
   * All {@link UniqueConstraint unique constraints} in the {@link Table table} as an [[IndexableArray]] ordered by name.
   */
  public get uniqueConstraints(): IndexableArray<UniqueConstraint, "name", never, true> {
    return this.constraints.filter(isUniqueConstraint);
  }

  /**
   * All {@link CheckConstraint check constraints} in the {@link Table table} as an [[IndexableArray]] ordered by name.
   */
  public get checkConstraints(): IndexableArray<CheckConstraint, "name", never, true> {
    return this.constraints.filter(isCheckConstraint);
  }

  /**
   * All {@link ExclusionConstraint exclusion constraints} in the {@link Table table} as an [[IndexableArray]] ordered by name.
   */
  public get exclusionConstraints(): IndexableArray<ExclusionConstraint, "name", never, true> {
    return this.constraints.filter(isExclusionConstraint);
  }

  /**
   * {@link PrimaryKey Primary key} of this {@link Table table}.
   *
   * @see {@link Table.primaryKeyColumns primaryKeyColumns} to get primary key columns directly.
   * @example
   * table.primaryKey.columns.forEach(colunn => console.log(column.name));
   */
  public get primaryKey(): PrimaryKey | undefined {
    return this.constraints.find(isPrimaryKey);
  }

  /**
   * {@link Table Tables}, which this {@link Table table} has {@link O2MRelation one to many relationship}, ordered by table name.
   * Please note that same table will appear more than once if there are more than one relationship between tables or same named tables from
   * different schemas (i.e. `public.account` may have relations with `public.contact` and `vip.contact`).
   *
   * @see [Example schema](.exampleSchema), {@link IndexableArray}
   * @example
   * vendorTable.hasManyTables.forEach(table => console.log(table.name));
   * vendorTable.hasManyTables.getAll("contact"); // All related tables named contact.
   */
  public get hasManyTables(): IndexableArray<Table, "name", never, true> {
    return this.foreignKeysToThis.map(fk => fk.table).sortBy("name");
  }

  /**
   * {@link Table Tables}, which this {@link Table table} has {@link M2ORelation belongs to relationship} (a.k.a. many to one) which is reverse direction of
   * {@link O2MRelation one to many relationship} (a.k.a one to many), ordered by table name.
   * Please note that same table will appear more than once if there are more than one relationship between tables or same named tables from
   * different schemas (i.e. `public.account` may have relations with `public.contact` and `vip.contact`).
   *
   * @see [Example schema](.exampleSchema), {@link IndexableArray}
   * @example
   * productTable.belongsToTables.forEach(table => console.log(table.name));
   * productTable.belongsToTables.getAll("contact"); // All related tables named contact.
   */
  public get belongsToTables(): IndexableArray<Table, "name", never, true> {
    return this.foreignKeys.map(fk => fk.referencedTable).sortBy("name");
  }

  /**
   * {@link Table Tables} which this {@link Table table} has {@link M2MRelation many to many relationship}, ordered by table name
   * Please note that same table will appear more than once if there are more than one relationship between tables or same named tables from
   * different schemas (i.e. `public.account` may have relations with `public.contact` and `vip.contact`).
   *
   * @see [Example schema](.exampleSchema)
   * @example
   * // Cart (id) has many products (id) through line_item join table.
   * cartTable.belongsToManyTables.forEach(table => console.log(table.name));
   * cartTable.belongsToManyTables.getAll("contact"); // All related tables named contact.
   */
  @Memoize()
  public get belongsToManyTables(): IndexableArray<Table, "name", never, true> {
    const tables = this.getThroughConstraints().map(constraint => constraint.toOther.referencedTable) as Table[];
    return IndexableArray.throwingFrom(tables, "name").sortBy("name");
  }

  /**
   * {@link Table Tables} which this {@link Table table} has {@link M2MRelation many to many relationship} joined by primary keys only in join table, ordered by table name
   * Please note that same table will appear more than once if there are more than one relationship between tables or same named tables from
   * different schemas (i.e. `public.account` may have relations with `public.contact` and `vip.contact`).
   *
   * @see [Example schema](.exampleSchema), {@link IndexableArray}
   * @example
   * // Cart (id) has many products (id) through line_item join table.
   * cartTable.belongsToManyTablesPk.forEach(table => console.log(table.name));
   * cartTable.belongsToManyTablesPk.getAll("contact"); // All related tables named contact.
   */
  @Memoize()
  public get belongsToManyTablesPk(): IndexableArray<Table, "name", never, true> {
    const tables = this.getThroughConstraints(true).map(constraint => constraint.toOther.referencedTable) as Table[];
    return IndexableArray.throwingFrom(tables, "name").sortBy("name");
  }

  /**
   * Array of {@link M2MRelation many to many relationships} of the {@link Table table}. {@link M2MRelation Many to many relationships} resembles
   * `has many through` and `belongs to many` relations in ORMs. It has some useful methods and information for generating ORM classes.
   */
  @Memoize()
  public get m2mRelations(): IndexableArray<M2MRelation, "name", never, true> {
    return IndexableArray.throwingFrom(this.getM2MRelations(false), "name").sortBy("name");
  }

  /**
   * Array of {@link M2MRelation many to many relationships} of the {@link Table table}. Different from {@link Table.m2mRelations m2mRelations},
   * this only includes relations joined by `Primary Foreign Keys` in join table. `Primary Foreign Key` means
   * foreign key of join table which are also primary key of join table at the same time.
   * {@link M2MRelation} resembles `has many through` and `belongs to many` relations in ORMs.
   * It has some useful methods and information for generating ORM classes.
   */
  @Memoize()
  public get m2mRelationsPk(): IndexableArray<M2MRelation, "name", never, true> {
    return IndexableArray.throwingFrom(this.getM2MRelations(true), "name").sortBy("name");
  }

  /**
   * Array of {@link O2MRelation one to many relationships} of the {@link Table table}. {@link O2MRelation} resembles
   * `has many` relations in ORMs. It has some useful methods and information for generating ORM classes.
   */
  @Memoize()
  public get o2mRelations(): IndexableArray<O2MRelation, "name", never, true> {
    return this.foreignKeysToThis.map(fk => new O2MRelation({ foreignKey: fk })).sortBy("name");
  }

  /**
   * Array of {@link M2ORelation many to one relationships} of the {@link Table table}. {@link M2ORelation} resembles
   * `belongs to` relations in ORMs. It has some useful methods and information for generating ORM classes.
   */
  @Memoize()
  public get m2oRelations(): IndexableArray<M2ORelation, "name", never, true> {
    return this.foreignKeys.map(fk => new M2ORelation({ foreignKey: fk })).sortBy("name");
  }

  /**
   * List of all relationships of the {@link Table table}. They are sort by type ([[O2MRelation]], [[M2ORelation]], [[M2MRelation]]).
   */
  @Memoize()
  public get relations(): IndexableArray<O2MRelation | M2ORelation | M2MRelation, "name", never, true> {
    return IndexableArray.throwingFrom([...this.o2mRelations, ...this.m2oRelations, ...this.m2mRelations], "name");
  }

  /**
   * Returns through constraints.
   *
   * @param onlyPk is whether to include only PK column constraints.
   * @returns through constraints and their details.
   */
  @Memoize()
  private getThroughConstraints(
    onlyPk = false
  ): {
    toThis: ForeignKey;
    toOther: ForeignKey;
  }[] {
    const result: ReturnType<Table["getThroughConstraints"]> = [];
    this.foreignKeysToThis.forEach(fkToThis => {
      const joinTable = fkToThis.table;
      joinTable.foreignKeys
        .filter(fkToOther => fkToThis !== fkToOther)
        .forEach(fkToOther => {
          result.push({
            toThis: fkToThis,
            toOther: fkToOther,
          });
        });
    });

    return onlyPk
      ? result.filter(c => c.toThis.columns.every(col => col.isPrimaryKey) && c.toOther.columns.every(col => col.isPrimaryKey))
      : result;
  }

  /** @ignore */
  private getM2MRelations(onlyPk: boolean): M2MRelation[] {
    return this.getThroughConstraints(onlyPk).map(tc => new M2MRelation({ foreignKey: tc.toThis, targetForeignKey: tc.toOther }));
  }

  /**
   * Returns {@link Column column} with given name from {@link Table table}.
   *
   * @param path is the name of the {@link Column column}.
   * @returns requested {@link Column columns}.
   * @example
   * const column = entity.get('contact'),  // Returns contact column from entity.
   */
  public get(column: string): Column {
    return this.columns.get(column);
  }
}
