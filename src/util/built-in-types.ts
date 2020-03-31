import BuiltInType from "../pg-structure/type/built-in-type";
import Schema from "../pg-structure/schema";

/**
 * Returns builtin types to be use in pg-structure module.
 *
 * @ignore
 * @param schema is schema name to be built-in type defined.
 * @returns builtin types
 *
 * Types are from `pg_catalog.pg_type` system table.
 */
export default function getBuiltinTypes(schema: Schema): BuiltInType[] {
  return [
    //
    // ────────────────────────────────────────────────────── I ──────────
    //   :::::: N U M E R I C : :  :   :    :     :        :          :
    // ────────────────────────────────────────────────────────────────
    //

    new BuiltInType({ category: "N", schema, oid: 0, classOid: 0, name: "smallint", internalName: "int2" }),
    new BuiltInType({ category: "N", schema, oid: 0, classOid: 0, name: "integer", shortName: "int", internalName: "int4" }),
    new BuiltInType({ category: "N", schema, oid: 0, classOid: 0, name: "bigint", internalName: "int8" }),
    new BuiltInType({
      category: "N",
      schema,
      oid: 0,
      classOid: 0,
      name: "decimal",
      internalName: "numeric",
      hasPrecision: true,
      hasScale: true,
    }),
    new BuiltInType({ category: "N", schema, oid: 0, classOid: 0, name: "numeric", hasPrecision: true, hasScale: true }),
    new BuiltInType({ category: "N", schema, oid: 0, classOid: 0, name: "real", internalName: "float4" }),
    new BuiltInType({ category: "N", schema, oid: 0, classOid: 0, name: "double precision", internalName: "float8" }),
    new BuiltInType({ category: "N", schema, oid: 0, classOid: 0, name: "smallserial", internalName: "int2" }),
    new BuiltInType({ category: "N", schema, oid: 0, classOid: 0, name: "serial", internalName: "int4" }),
    new BuiltInType({ category: "N", schema, oid: 0, classOid: 0, name: "bigserial", internalName: "int8" }),

    //
    // ──────────────────────────────────────────────────────── I ──────────
    //   :::::: M O N E T A R Y : :  :   :    :     :        :          :
    // ──────────────────────────────────────────────────────────────────
    //

    new BuiltInType({ category: "N", schema, oid: 0, classOid: 0, name: "money" }),

    //
    // ────────────────────────────────────────────────────────── I ──────────
    //   :::::: C H A R A C T E R : :  :   :    :     :        :          :
    // ────────────────────────────────────────────────────────────────────
    //

    new BuiltInType({ category: "S", schema, oid: 0, classOid: 0, name: "character varying", shortName: "varchar", hasLength: true }),
    new BuiltInType({ category: "S", schema, oid: 0, classOid: 0, name: "character", shortName: "char", hasLength: true }),
    new BuiltInType({ category: "S", schema, oid: 0, classOid: 0, name: "text" }),

    //
    // ──────────────────────────────────────────────────── I ──────────
    //   :::::: B I N A R Y : :  :   :    :     :        :          :
    // ──────────────────────────────────────────────────────────────
    //

    new BuiltInType({ category: "U", schema, oid: 0, classOid: 0, name: "bytea" }),

    //
    // ────────────────────────────────────────────────────────── I ──────────
    //   :::::: D A T E   T I M E : :  :   :    :     :        :          :
    // ────────────────────────────────────────────────────────────────────
    //

    new BuiltInType({ category: "D", schema, oid: 0, classOid: 0, name: "timestamp" }),
    new BuiltInType({
      category: "D",
      schema,
      oid: 0,
      classOid: 0,
      name: "timestamp without time zone",
      shortName: "timestamp",
      hasPrecision: true,
    }),
    new BuiltInType({
      category: "D",
      schema,
      oid: 0,
      classOid: 0,
      name: "timestamp with time zone",
      shortName: "timestamptz",
      hasPrecision: true,
    }),
    new BuiltInType({ category: "D", schema, oid: 0, classOid: 0, name: "date" }),
    new BuiltInType({ category: "D", schema, oid: 0, classOid: 0, name: "time" }),
    new BuiltInType({ category: "D", schema, oid: 0, classOid: 0, name: "time without time zone", shortName: "time", hasPrecision: true }),
    new BuiltInType({ category: "D", schema, oid: 0, classOid: 0, name: "time with time zone", shortName: "timetz", hasPrecision: true }),
    new BuiltInType({ category: "T", schema, oid: 0, classOid: 0, name: "interval", hasPrecision: true }),

    //
    // ────────────────────────────────────────────────────── I ──────────
    //   :::::: B O O L E A N : :  :   :    :     :        :          :
    // ────────────────────────────────────────────────────────────────
    //
    new BuiltInType({ category: "B", schema, oid: 0, classOid: 0, name: "boolean", shortName: "bool" }),

    //
    // ────────────────────────────────────────────────────────── I ──────────
    //   :::::: G E O M E T R I C : :  :   :    :     :        :          :
    // ────────────────────────────────────────────────────────────────────
    //

    new BuiltInType({ category: "G", schema, oid: 0, classOid: 0, name: "point" }),
    new BuiltInType({ category: "G", schema, oid: 0, classOid: 0, name: "line" }),
    new BuiltInType({ category: "G", schema, oid: 0, classOid: 0, name: "lseg" }),
    new BuiltInType({ category: "G", schema, oid: 0, classOid: 0, name: "box" }),
    new BuiltInType({ category: "G", schema, oid: 0, classOid: 0, name: "path" }),
    new BuiltInType({ category: "G", schema, oid: 0, classOid: 0, name: "polygon" }),
    new BuiltInType({ category: "G", schema, oid: 0, classOid: 0, name: "circle" }),

    //
    // ────────────────────────────────────────────────────────────────────── I ──────────
    //   :::::: N E T W O R K   A D D R E S S : :  :   :    :     :        :          :
    // ────────────────────────────────────────────────────────────────────────────────
    //

    new BuiltInType({ category: "I", schema, oid: 0, classOid: 0, name: "cidr" }),
    new BuiltInType({ category: "I", schema, oid: 0, classOid: 0, name: "inet" }),
    new BuiltInType({ category: "U", schema, oid: 0, classOid: 0, name: "macaddr" }),
    new BuiltInType({ category: "U", schema, oid: 0, classOid: 0, name: "macaddr8" }),

    //
    // ──────────────────────────────────────────────────────────── I ──────────
    //   :::::: B I T   S T R I N G : :  :   :    :     :        :          :
    // ──────────────────────────────────────────────────────────────────────
    //
    new BuiltInType({ category: "V", schema, oid: 0, classOid: 0, name: "bit", hasLength: true }),
    new BuiltInType({ category: "V", schema, oid: 0, classOid: 0, name: "bit varying", shortName: "varbit", hasLength: true }),

    //
    // ────────────────────────────────────────────────────────────── I ──────────
    //   :::::: T E X T   S E A R C H : :  :   :    :     :        :          :
    // ────────────────────────────────────────────────────────────────────────
    //
    new BuiltInType({ category: "U", schema, oid: 0, classOid: 0, name: "tsvector" }),
    new BuiltInType({ category: "U", schema, oid: 0, classOid: 0, name: "tsquery" }),

    //
    // ──────────────────────────────────────────────── I ──────────
    //   :::::: U U I D : :  :   :    :     :        :          :
    // ──────────────────────────────────────────────────────────
    //
    new BuiltInType({ category: "U", schema, oid: 0, classOid: 0, name: "uuid" }),

    //
    // ────────────────────────────────────────────── I ──────────
    //   :::::: X M L : :  :   :    :     :        :          :
    // ────────────────────────────────────────────────────────
    //
    new BuiltInType({ category: "U", schema, oid: 0, classOid: 0, name: "xml" }),

    //
    // ──────────────────────────────────────────────── I ──────────
    //   :::::: J S O N : :  :   :    :     :        :          :
    // ──────────────────────────────────────────────────────────
    //

    new BuiltInType({ category: "U", schema, oid: 0, classOid: 0, name: "json" }),
    new BuiltInType({ category: "U", schema, oid: 0, classOid: 0, name: "jsonb" }),
    new BuiltInType({ category: "U", schema, oid: 0, classOid: 0, name: "jsonpath" }),

    //
    // ────────────────────────────────────────────────── I ──────────
    //   :::::: R A N G E : :  :   :    :     :        :          :
    // ────────────────────────────────────────────────────────────
    //

    new BuiltInType({ category: "R", schema, oid: 0, classOid: 0, name: "int4range" }),
    new BuiltInType({ category: "R", schema, oid: 0, classOid: 0, name: "int8range" }),
    new BuiltInType({ category: "R", schema, oid: 0, classOid: 0, name: "numrange" }),
    new BuiltInType({ category: "R", schema, oid: 0, classOid: 0, name: "tsrange" }),
    new BuiltInType({ category: "R", schema, oid: 0, classOid: 0, name: "tstzrange" }),
    new BuiltInType({ category: "R", schema, oid: 0, classOid: 0, name: "daterange" }),

    //
    // ────────────────────────────────────────────────────────────────────────── I ──────────
    //   :::::: O B J E C T   I D E N T I F I E R : :  :   :    :     :        :          :
    // ────────────────────────────────────────────────────────────────────────────────────
    //

    new BuiltInType({ category: "N", schema, oid: 0, classOid: 0, name: "oid" }),
    new BuiltInType({ category: "N", schema, oid: 0, classOid: 0, name: "regproc" }),
    new BuiltInType({ category: "N", schema, oid: 0, classOid: 0, name: "regprocedure" }),
    new BuiltInType({ category: "N", schema, oid: 0, classOid: 0, name: "regoper" }),
    new BuiltInType({ category: "N", schema, oid: 0, classOid: 0, name: "regoperator" }),
    new BuiltInType({ category: "N", schema, oid: 0, classOid: 0, name: "regclass" }),
    new BuiltInType({ category: "N", schema, oid: 0, classOid: 0, name: "regtype" }),
    new BuiltInType({ category: "N", schema, oid: 0, classOid: 0, name: "regrole" }),
    new BuiltInType({ category: "N", schema, oid: 0, classOid: 0, name: "regnamespace" }),
    new BuiltInType({ category: "N", schema, oid: 0, classOid: 0, name: "regconfig" }),
    new BuiltInType({ category: "N", schema, oid: 0, classOid: 0, name: "regdictionary" }),

    //
    // ────────────────────────────────────────────────── I ──────────
    //   :::::: O T H E R : :  :   :    :     :        :          :
    // ────────────────────────────────────────────────────────────
    //

    new BuiltInType({ category: "U", schema, oid: 0, classOid: 0, name: "pg_lsn" }),

    //
    // ──────────────────────────────────────────────────── I ──────────
    //   :::::: P S E U D O : :  :   :    :     :        :          :
    // ──────────────────────────────────────────────────────────────
    //

    new BuiltInType({ category: "P", schema, oid: 0, classOid: 0, name: "any" }),
    new BuiltInType({ category: "P", schema, oid: 0, classOid: 0, name: "anyelement" }),
    new BuiltInType({ category: "P", schema, oid: 0, classOid: 0, name: "anyarray" }),
    new BuiltInType({ category: "P", schema, oid: 0, classOid: 0, name: "anynonarray" }),
    new BuiltInType({ category: "P", schema, oid: 0, classOid: 0, name: "anyenum" }),
    new BuiltInType({ category: "P", schema, oid: 0, classOid: 0, name: "anyrange" }),
    new BuiltInType({ category: "P", schema, oid: 0, classOid: 0, name: "cstring" }),
    new BuiltInType({ category: "P", schema, oid: 0, classOid: 0, name: "internal" }),
    new BuiltInType({ category: "P", schema, oid: 0, classOid: 0, name: "language_handler" }),
    new BuiltInType({ category: "P", schema, oid: 0, classOid: 0, name: "fdw_handler" }),
    new BuiltInType({ category: "P", schema, oid: 0, classOid: 0, name: "index_am_handler" }),
    new BuiltInType({ category: "P", schema, oid: 0, classOid: 0, name: "tsm_handler" }),
    new BuiltInType({ category: "P", schema, oid: 0, classOid: 0, name: "record" }),
    new BuiltInType({ category: "P", schema, oid: 0, classOid: 0, name: "trigger" }),
    new BuiltInType({ category: "P", schema, oid: 0, classOid: 0, name: "event_trigger" }),
    new BuiltInType({ category: "P", schema, oid: 0, classOid: 0, name: "pg_ddl_command" }),
    new BuiltInType({ category: "P", schema, oid: 0, classOid: 0, name: "void" }),
    new BuiltInType({ category: "X", schema, oid: 0, classOid: 0, name: "unknown" }),
    new BuiltInType({ category: "P", schema, oid: 0, classOid: 0, name: "opaque" }),

    //
    // ──────────────────────────────────────────────────── I ──────────
    //   :::::: O T H E R   S Y S T E M : :  :   :    :     :        :          :
    // ──────────────────────────────────────────────────────────────
    //
    new BuiltInType({ category: "S", schema, oid: 0, classOid: 0, name: "name", internalName: "name" }),
    new BuiltInType({ category: "S", schema, oid: 0, classOid: 0, name: "pg_node_tree", internalName: "pg_node_tree" }),
    new BuiltInType({ category: "U", schema, oid: 0, classOid: 0, name: "aclitem", shortName: "aclitem", internalName: "aclitem" }),
    new BuiltInType({ category: "U", schema, oid: 0, classOid: 0, name: "xid", shortName: "xid", internalName: "xid" }),
    new BuiltInType({
      category: "A",
      schema,
      oid: 0,
      classOid: 0,
      name: "int2vector",
      shortName: "int2vector",
      internalName: "int2vector",
    }),
    new BuiltInType({ category: "A", schema, oid: 0, classOid: 0, name: "oidvector", shortName: "oidvector", internalName: "oidvector" }),
    new BuiltInType({
      category: "A",
      schema,
      oid: 0,
      classOid: 0,
      name: "int2vector",
      shortName: "int2vector",
      internalName: "int2vector",
    }),
    new BuiltInType({
      category: "X",
      schema,
      oid: 0,
      classOid: 0,
      name: "int2vector",
      shortName: "int2vector",
      internalName: "int2vector",
    }),
    new BuiltInType({ category: "D", schema, oid: 0, classOid: 0, name: "abstime", shortName: "abstime", internalName: "abstime" }),
    new BuiltInType({
      category: "S",
      schema,
      oid: 0,
      classOid: 0,
      name: "pg_ndistinct",
      // shortName: "pg_ndistinct",
      // internalName: "pg_ndistinct",
    }),
    new BuiltInType({
      category: "S",
      schema,
      oid: 0,
      classOid: 0,
      name: "pg_dependencies",
      // shortName: "pg_dependencies",
      // internalName: "pg_dependencies",
    }),
    new BuiltInType({
      category: "S",
      schema,
      oid: 0,
      classOid: 0,
      name: "pg_mcv_list",
    }),
  ];
}
