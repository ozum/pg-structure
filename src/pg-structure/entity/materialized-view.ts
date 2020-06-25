import IndexableArray from "indexable-array";
import Entity from "../base/entity";
import Index from "..";

/**
 * Class which represent a {@link MaterializedView materialized view}. Provides attributes and methods for details of the {@link MaterializedView materialized view}.
 */
export default class MaterializedView extends Entity {
  /**
   * All {@link Index indexes} in the materialized view as an [[IndexableArray]], ordered by name.
   */
  public readonly indexes: IndexableArray<Index, "name", never, true> = IndexableArray.throwingFrom([], "name");
}
