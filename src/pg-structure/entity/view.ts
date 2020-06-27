import IndexableArray from "indexable-array";
import Trigger from "../trigger";
import Entity from "../base/entity";

/**
 * Class which represent a {@link View view}. Provides attributes and methods for details of the {@link View view}.
 */
export default class View extends Entity {
  /**
   * All {@link Trigger triggers} in the view as an [[IndexableArray]] ordered by name.
   */
  public readonly triggers: IndexableArray<Trigger, "name", never, true> = IndexableArray.throwingFrom([], "name");
}
