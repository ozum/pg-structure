import shortNamingFunction from "./short";
import descriptiveNamingFunction from "./descriptive";
import { RelationNameFunction, BuiltinRelationNameFunction } from "../../types";

/** @ignore */
const relationNameFunctions = {
  short: shortNamingFunction,
  descriptive: descriptiveNamingFunction,
};

export default function getRelationNameFunction(
  relationNameFunction: RelationNameFunction | BuiltinRelationNameFunction
): RelationNameFunction {
  return typeof relationNameFunction === "string" ? relationNameFunctions[relationNameFunction] : relationNameFunction;
}
