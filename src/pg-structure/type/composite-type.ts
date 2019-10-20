import IndexableArray from "indexable-array";
import Type from "../base/type";
import Column from "../column";

/**
 * Class which represent a PostgreSQL {@link CompositeType composite type}. Provides attributes and methods for details of the {@link CompositeType composite type}.
 */
export default class CompositeType extends Type {
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
