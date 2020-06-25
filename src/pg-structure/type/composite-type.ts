import IndexableArray from "indexable-array";
import { RelationKindLetter } from "../../types/query-result";
import Type, { TypeConstructorArgs } from "../base/type";

import Column from "../column";
import Entity from "../base/entity";

/** @ignore */
export interface CompositeTypeConstructorArgs extends TypeConstructorArgs {
  relationKind?: RelationKindLetter;
}

/**
 * Class which represent a PostgreSQL {@link CompositeType composite type}. Provides attributes and methods for details of the {@link CompositeType composite type}.
 */
export default class CompositeType extends Type {
  /** @ignore  */
  public constructor(args: CompositeTypeConstructorArgs) {
    super(args);
    this.relationKind = args.relationKind;
  }

  /**
   * All entities such as tables, views and materialized view are also composite types in PostgreSQL. This is the entity type of composite type if any.
   */
  public relationKind?: RelationKindLetter;

  /**
   * All entities such as tables, views and materialized view are also composite types in PostgreSQL. This is the entity composite type is based on, if any.
   */
  public get entity(): Entity | undefined {
    return this.relationKind && this.relationKind !== "c" ? this.schema.entities.get(this.name) : undefined;
  }

  /**
   * All {@link Column columns} of the {@link CompositeType composite type} as an {@link IndexableArray indexable array} ordered by same order they are defined
   * in database {@link CompositeType composite type}.
   *
   * @name Entity#columns
   * @example
   * const isAvailable  = composite.columns.has('id');
   * const columnNames  = composite.columns.map(column => column.name);
   * const column       = composite.columns.get('user_id');
   * const name         = column.name;
   *
   * composite.columns.forEach(column => console.log(column.name));
   */
  public readonly columns: IndexableArray<Column, "name", never, true> = IndexableArray.throwingFrom([], "name");
}
