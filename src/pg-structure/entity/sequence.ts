import IndexableArray from "indexable-array";
import Entity from "../base/entity";
import Index from "..";

/**
 * Class which represent a {@link Sequence sequence}. Provides attributes and methods for details of the {@link Sequence sequence}.
 */
export default class Sequence extends Entity {
  /**
   * All {@link Index indexes} in the sequence as an [[IndexableArray]], ordered by name.
   */
  public readonly indexes: IndexableArray<Index, "name", never, true> = IndexableArray.throwingFrom([], "name");
}
