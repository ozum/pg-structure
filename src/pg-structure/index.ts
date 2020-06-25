import IndexableArray from "indexable-array";
import { Memoize } from "@typescript-plus/fast-memoize-decorator/dist/src";
import Schema from "./schema";
import Table from "./entity/table";
import Column from "./column";
import DbObject, { DbObjectConstructorArgs } from "./base/db-object";
import MaterializedView from "./entity/materialized-view";

/** @ignore */
interface IndexConstructorArgs extends DbObjectConstructorArgs {
  oid: number;
  parent: Table | MaterializedView;
  name: string;
  isUnique: boolean;
  isPrimaryKey: boolean;
  isExclusion: boolean;
  partialIndexExpression: string | null;
}

/**
 * Class which represent a database index. Provides attributes and methods for details of the index.
 */
export default class Index extends DbObject {
  /** @ignore */
  public constructor(args: IndexConstructorArgs) {
    super(args);
    this.oid = args.oid;
    this.isUnique = args.isUnique;
    this.isPrimaryKey = args.isPrimaryKey;
    this.isExclusion = args.isExclusion;
    this.parent = args.parent;
    this.partialIndexExpression = args.partialIndexExpression || undefined;
  }

  /** Object identifier for the {@link Schema} */
  public readonly oid: number;

  public get fullName(): string {
    return `${this.schema.name}.${this.parent.name}.${this.name}`;
  }

  /**
   * If true, this is a unique index. Please note that all unique constraints have a unique index created by PostgreSQL automatically,
   * but unique indexes may not have unqiue constraint.
   */
  public readonly isUnique: boolean;

  /**
   * If true, this index represents the primary key of the table ({@link Index#isUnique isUnique} is always true for primary keys.)
   */
  public readonly isPrimaryKey: boolean;

  /**
   * If true, this index supports an exclusion constraint.
   */
  public readonly isExclusion: boolean;

  /**
   * If true, this index is a partial index.
   */
  public get isPartial(): boolean {
    return this.partialIndexExpression !== undefined;
  }

  /** If index is a partial index, partial index expression */
  public readonly partialIndexExpression: string | undefined;

  /**
   * {@link Table} which this {@link Index index} belongs to.
   */
  public get table(): Table | undefined {
    return this.parent instanceof Table ? this.parent : undefined;
  }

  /**
   * {@link MaterializedView} which this {@link Index index} belongs to.
   */
  public get materializedView(): MaterializedView | undefined {
    return this.parent instanceof MaterializedView ? this.parent : undefined;
  }

  /**
   * Parent {@link DbObject database object} this column belongs to.
   */
  public readonly parent: Table | MaterializedView;

  /**
   * {@link Schema} this {@link Index index} belongs to.
   */
  public get schema(): Schema {
    return this.parent.schema;
  }

  /**
   * List of {@link Column columns} of {@link Index index}, in order their ordinal position
   * within the index. If {@link Index index} does not have any {@link Column columns} this is empty array.
   * Please note that, non reference expressions such as `CONCAT(name, surname)` is not included. To access expressions and
   * columns together use [[columnsAndExpressions]] method.
   */
  @Memoize()
  public get columns(): IndexableArray<Column, "name", never, true> {
    const columns = this.columnsAndExpressions.filter((col) => col instanceof Column) as Column[];
    return IndexableArray.throwingFrom(columns, "name");
  }

  /**
   * List of {@link Column columns} and {@link Expression expressions} of {@link Index index}, in order their ordinal position
   * within the index. If {@link Index index} does not have any {@link Column columns} or {@link Expression expressions} this is empty array.
   * To get only columns use [[columns]] method.
   */
  public readonly columnsAndExpressions: Array<Column | string> = [];
}
