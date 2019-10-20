import { transform } from "inflection";
import { O2MRelation, M2ORelation, M2MRelation, Relation } from "../../index";
import { CaseType } from "../../types";

/**
 * M2M name generator function.
 *
 * @ignore
 * @param relation is the relation to generate name for.
 */
function m2mName(relation: M2MRelation): string {
  // (Student --< Message >-- Student) causes `receiver_senders` and `sender_receivers`. Make them senders and receivers.
  const tolerableCorrespondence = relation.targetTable === relation.sourceTable ? 1 : 0;
  const sep = relation.sourceTable.separator;
  let result = "";

  if (relation.foreignKey.correspondingForeignKeys.length > tolerableCorrespondence) {
    result += relation.getSourceAliasWithout("any") + sep; // If multiple "source -> same join", add source alias to distinguish between source fks.
  }

  if (relation.sourceTable.getJoinTablesTo(relation.targetTable).length > 1) {
    result += relation.getJoinNameWithout(["source", "target"]) + sep; // If multiple "any join -> target", add join name to distinguish between target fks.
  }

  if (relation.targetForeignKey.correspondingForeignKeys.length > 0) {
    result += relation.getTargetAliasWithout("join"); // If multiple "same join -> target", add target alias to distinguish between target fks.
  } else {
    result += relation.getTargetNameWithout("join");
  }

  return result;
}

/**
 * O2M name generator function. (REF = SOURCE)
 *
 * @ignore
 * @param relation is the relation to generate name for.
 */
function o2mName(relation: O2MRelation): string {
  const fk = relation.foreignKey;
  const sep = relation.sourceTable.separator;

  if (fk.correspondingForeignKeys.length === 0) {
    return relation.targetName;
  }

  return relation.targetName === relation.targetAlias
    ? (relation.sourceAdjective || relation.getSourceAliasWithout("target")) + sep + relation.targetName
    : relation.getTargetAliasWithout("source");
}

/**
 * M2O name generator function. (REF = TARGET)
 *
 * @ignore
 * @param relation is the relation to generate name for.
 */
function m2oName(relation: M2ORelation): string {
  return relation.foreignKey.correspondingForeignKeys.length > 0
    ? relation.getTargetAliasWithout("source")
    : relation.getTargetNameWithout("source");
}

/**
 * Relation name generator function.
 *
 * @ignore
 * @param relation is the relation to generate name for.
 */
export default function(relation: Relation): string {
  const inflectionMethod = relation.sourceTable.nameCaseType === CaseType.CamelCase ? "camelize" : "underscore";

  if (relation instanceof M2ORelation) {
    return transform(m2oName(relation), ["singularize", inflectionMethod]);
  }
  if (relation instanceof M2MRelation) {
    return transform(m2mName(relation), ["pluralize", inflectionMethod]);
  }
  /* istanbul ignore else */
  if (relation instanceof O2MRelation) {
    return transform(o2mName(relation), ["pluralize", inflectionMethod]);
  }
  /* istanbul ignore next */
  throw new Error("Unknown relation type.");
}
