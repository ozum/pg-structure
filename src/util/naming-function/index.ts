import shortNamingFunction from "./short";
import descriptiveNamingFunction from "./descriptive";
import { RelationNameFunctions, BuiltinRelationNameFunctions } from "../../types";

/** @ignore */
const builtinRelationNameFunctions = {
  short: shortNamingFunction,
  descriptive: descriptiveNamingFunction,
};

export default function getRelationNameFunctions(
  relationNameFunctions: RelationNameFunctions | BuiltinRelationNameFunctions
): RelationNameFunctions {
  return typeof relationNameFunctions === "string" ? builtinRelationNameFunctions[relationNameFunctions] : relationNameFunctions;
}
