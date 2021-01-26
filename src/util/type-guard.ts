/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import ForeignKey from "../pg-structure/constraint/foreign-key";
import PrimaryKey from "../pg-structure/constraint/primary-key";
import CheckConstraint from "../pg-structure/constraint/check-constraint";
import UniqueConstraint from "../pg-structure/constraint/unique-constraint";
import ExclusionConstraint from "../pg-structure/constraint/exclusion-constraint";

/** @ignore */
export function isForeignKey(input: any): input is ForeignKey {
  return input instanceof ForeignKey;
}

/** @ignore */
export function isPrimaryKey(input: any): input is PrimaryKey {
  return input instanceof PrimaryKey;
}

/** @ignore */
export function isCheckConstraint(input: any): input is CheckConstraint {
  return input instanceof CheckConstraint;
}

/** @ignore */
export function isUniqueConstraint(input: any): input is UniqueConstraint {
  return input instanceof UniqueConstraint;
}

/** @ignore */
export function isExclusionConstraint(input: any): input is ExclusionConstraint {
  return input instanceof ExclusionConstraint;
}
