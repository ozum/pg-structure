import { pgStructure, deserialize } from "./main";
import Column from "./pg-structure/column";
import Db from "./pg-structure/db";
import Index from "./pg-structure/index";
import Schema from "./pg-structure/schema";
import Constraint from "./pg-structure/base/constraint";
import DbObject from "./pg-structure/base/db-object";
import Entity from "./pg-structure/base/entity";
import Relation from "./pg-structure/base/relation";
import Type from "./pg-structure/base/type";
import CheckConstraint from "./pg-structure/constraint/check-constraint";
import ExclusionConstraint from "./pg-structure/constraint/exclusion-constraint";
import ForeignKey from "./pg-structure/constraint/foreign-key";
import PrimaryKey from "./pg-structure/constraint/primary-key";
import UniqueConstraint from "./pg-structure/constraint/unique-constraint";
import MaterializedView from "./pg-structure/entity/materialized-view";
import Sequence from "./pg-structure/entity/sequence";
import Table from "./pg-structure/entity/table";
import View from "./pg-structure/entity/view";
import M2MRelation from "./pg-structure/relation/m2m-relation";
import M2ORelation from "./pg-structure/relation/m2o-relation";
import O2MRelation from "./pg-structure/relation/o2m-relation";
import BaseType from "./pg-structure/type/base-type";
import CompositeType from "./pg-structure/type/composite-type";
import Domain from "./pg-structure/type/domain";
import EnumType from "./pg-structure/type/enum-type";
import PseudoType from "./pg-structure/type/pseudo-type";
import RangeType from "./pg-structure/type/range-type";
import Func from "./pg-structure/base/func";
import NormalFunction from "./pg-structure/function/normal-function";
import Procedure from "./pg-structure/function/procedure";
import AggregateFunction from "./pg-structure/function/aggregate-function";
import FunctionArgument from "./pg-structure/function-argument";
import WindowFunction from "./pg-structure/function/window-function";
import Trigger from "./pg-structure/trigger";

export * from "./types/index";
export default pgStructure;

export {
  deserialize,
  Column,
  Db,
  Index,
  Schema,
  Constraint,
  DbObject,
  Entity,
  Relation,
  Type,
  CheckConstraint,
  ExclusionConstraint,
  ForeignKey,
  PrimaryKey,
  UniqueConstraint,
  MaterializedView,
  Sequence,
  Table,
  View,
  M2MRelation,
  M2ORelation,
  O2MRelation,
  BaseType,
  CompositeType,
  Domain,
  EnumType,
  PseudoType,
  RangeType,
  Func,
  NormalFunction,
  Procedure,
  AggregateFunction,
  FunctionArgument,
  WindowFunction,
  Trigger,
};
