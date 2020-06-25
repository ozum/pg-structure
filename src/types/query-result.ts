/** @ignore */
export type EntityTypeLetter = "r" | "i" | "S" | "t" | "v" | "m" | "c" | "f" | "p" | "I"; // r = ordinary table, i = index, S = sequence, t = TOAST table, v = view, m = materialized view, c = composite type, f = foreign table, p = partitioned table, I = partitioned index
/** @ignore */
export type TypeKindLetter = "b" | "c" | "d" | "e" | "p" | "r"; // base, composite, domain, enum, pseudo-type, range;
/** @ignore */
export type ActionLetter = "a" | "r" | "c" | "n" | "d"; // a: no action, r: restrict, c: cascade, n: set null, d: set default
/** @ignore */
export type MatchTypeLetter = "f" | "p" | "s"; // * f: full, p: partial, s: simple
/** @ignore */
export type ConstrainTypeLetter = "c" | "f" | "p" | "u" | "t" | "x"; // c: check, f: foreign key, p: primary key, u: unique, t: constraint trigger, x: exclusion constraint
/** ignore */
export type RelationKindLetter = "r" | "i" | "s" | "t" | "v" | "m" | "c" | "f" | "p" | "I"; // See: relkind in https://www.postgresql.org/docs/current/catalog-pg-class.html

/** @ignore */
export interface SchemaQueryResult {
  oid: number;
  name: string;
  comment: string | null;
}

/** @ignore */
export interface TypeQueryResult {
  oid: number;
  schemaOid: number;
  classOid: number;
  kind: TypeKindLetter;
  notNull: boolean;
  default: string | number | null;
  sqlType: string | null; // character varying(20), numeric(3,2), extra_modules."extra-domain"[], timestamp(0) without time zone
  name: string;
  values: string[];
  comment: string | null;
  arrayDimension: number;
  relationKind?: RelationKindLetter;
}

/** @ignore */
export interface EntityQueryResult {
  oid: number;
  schemaOid: number;
  kind: EntityTypeLetter;
  name: string;
  comment: string | null;
}

/** @ignore */
export interface ColumnQueryResult {
  parentOid: number;
  attributeNumber: number; // The number of the column. Ordinary columns are numbered from 1 up. Dropped columns has attribute numbers too, so numbers may differ from actiual existing column array index.
  parentKind: EntityTypeLetter;
  database: string;
  name: string;
  defaultWithTypeCast: string;
  notNull: boolean;
  sqlType: string;
  arrayDimension: number;
  position: number;
  comment: string | null;
}

/** @ignore */
export interface IndexQueryResult {
  oid: number;
  tableOid: number;
  name: string;
  isUnique: boolean;
  isPrimaryKey: boolean;
  isExclusion: boolean;
  /** This is an array of indnatts values that indicate which table columns this index indexes. For example a value of 1 3 would mean that the first and the third table columns make up the index entries. Key columns come before non-key (included) columns. A zero in this array indicates that the corresponding index attribute is an expression over the table columns, rather than a simple column reference.  */
  columnPositions: number[];
  /** Expression trees (in nodeToString() representation) for index attributes that are not simple column references. This is a list with one element for each zero entry in indkey. Null if all index attributes are simple references. */
  indexExpressions: string[];
  /** Expression tree (in nodeToString() representation) for partial index predicate. Null if not a partial index. */
  partialIndexExpression: string | null;
  comment: string | null;
}

/** @ignore */
export interface ConstraintQueryResult {
  /** The table this constraint is on; 0 if not a table constraint */
  tableOid: number;
  /** The index supporting this constraint, if it's a unique, primary key, foreign key, or exclusion constraint; else 0 */
  indexOid: number;
  /** The domain this constraint is on; 0 if not a domain constraint */
  typeOid: number;
  kind: ConstrainTypeLetter;
  name: string;
  /** If a table constraint (including foreign keys, but not constraint triggers), list of the constrained columns */
  constrainedColumnPositions: number[];
  /** If a foreign key, list of the referenced columns */
  referencedColumnPositions: number[];
  onUpdate: ActionLetter;
  onDelete: ActionLetter;
  matchType: MatchTypeLetter;
  checkConstraintExpression: string;
  comment: string | null;
}

/** @ignore */
export type QueryResults = [
  SchemaQueryResult[],
  TypeQueryResult[],
  EntityQueryResult[],
  ColumnQueryResult[],
  IndexQueryResult[],
  ConstraintQueryResult[]
];
