/*
WARNING!!! EXECUTE THIS QUERY INDIVIDUALY FOR EACH SCHEMA. OTHERWISE `information_schema.columns` JOIN SLOWS DOWN QUERY.

SQL Query to fetch information about columns. This query joins `information_schema.columns` and `information_schema.columns`
as described in https://www.postgresql.org/docs/current/infoschema-element-types.html

However views are copy-patsed, because small modifications are needed as below:

information_schema.columns:
 SELECT:
 - Add: c.relkind, c.oid, t.typcategory, a.attndims, a.atttypid, a.atttypmod, a.attndims AS "array_dimension"
 - Maybe useful: format_type(atttypid, atttypmod) AS "sql_type", regexp_match(format_type(atttypid, atttypmod), '\((\d+),?(\d*)\)' ) AS "atttypmods"
 WHERE:
 - Add composite types to result by modifying c.relkind: c.relkind = ANY (ARRAY[... 'c'::"char"]))


information_schema.element_types: This view contains info about elements of arrays. `at` is type of array itself, `bt` is type of arrays's elements.
 SELECT:
 - Add: bt.oid AS "bt_oid"
 */
--
-- ────────────────────────────────────────────────────── I ──────────
--   :::::: C O L U M N S : :  :   :    :     :        :          :
-- ────────────────────────────────────────────────────────────────
--

WITH information_schema_columns AS (
  SELECT
    c.relkind,
    c.oid,
    t.typcategory,
    a.attndims,
    a.atttypid,
    a.atttypmod,
    a.attndims AS "array_dimension",
    -- 				format_type(atttypid, atttypmod) as "sql_type",
    -- 				regexp_match(format_type(atttypid, atttypmod), '\((\d+),?(\d*)\)' ) as "atttypmods",
    current_database()::information_schema.sql_identifier AS table_catalog,
    nc.nspname::information_schema.sql_identifier AS table_schema,
    c.relname::information_schema.sql_identifier AS table_name,
    a.attname::information_schema.sql_identifier AS column_name,
    a.attnum::information_schema.cardinal_number AS ordinal_position,
    pg_get_expr(ad.adbin, ad.adrelid)::information_schema.character_data AS column_default,
    CASE WHEN a.attnotnull
      OR t.typtype = 'd'::"char"
      AND t.typnotnull THEN
      'NO'::text
    ELSE
      'YES'::text END::information_schema.yes_or_no AS is_nullable,
      CASE WHEN t.typtype = 'd'::"char" THEN
        CASE WHEN bt.typelem <> 0::oid
          AND bt.typlen = '-1'::integer THEN
          'ARRAY'::text
        WHEN nbt.nspname = 'pg_catalog'::name THEN
          format_type(t.typbasetype, NULL::integer)
        ELSE
          'USER-DEFINED'::text
        END
      ELSE
        CASE WHEN t.typelem <> 0::oid
          AND t.typlen = '-1'::integer THEN
          'ARRAY'::text
        WHEN nt.nspname = 'pg_catalog'::name THEN
          format_type(a.atttypid, NULL::integer)
        ELSE
          'USER-DEFINED'::text
        END END::information_schema.character_data AS data_type,
        information_schema._pg_char_max_length (information_schema._pg_truetypid (a.*, t.*), information_schema._pg_truetypmod (a.*, t.*))::information_schema.cardinal_number AS character_maximum_length,
        information_schema._pg_char_octet_length (information_schema._pg_truetypid (a.*, t.*), information_schema._pg_truetypmod (a.*, t.*))::information_schema.cardinal_number AS character_octet_length,
        information_schema._pg_numeric_precision (information_schema._pg_truetypid (a.*, t.*), information_schema._pg_truetypmod (a.*, t.*))::information_schema.cardinal_number AS numeric_precision,
        information_schema._pg_numeric_precision_radix (information_schema._pg_truetypid (a.*, t.*), information_schema._pg_truetypmod (a.*, t.*))::information_schema.cardinal_number AS numeric_precision_radix,
        information_schema._pg_numeric_scale (information_schema._pg_truetypid (a.*, t.*), information_schema._pg_truetypmod (a.*, t.*))::information_schema.cardinal_number AS numeric_scale,
        information_schema._pg_datetime_precision (information_schema._pg_truetypid (a.*, t.*), information_schema._pg_truetypmod (a.*, t.*))::information_schema.cardinal_number AS datetime_precision,
        information_schema._pg_interval_type (information_schema._pg_truetypid (a.*, t.*), information_schema._pg_truetypmod (a.*, t.*))::information_schema.character_data AS interval_type,
        NULL::integer::information_schema.cardinal_number AS interval_precision,
        NULL::character varying::information_schema.sql_identifier AS character_set_catalog,
        NULL::character varying::information_schema.sql_identifier AS character_set_schema,
        NULL::character varying::information_schema.sql_identifier AS character_set_name,
        CASE WHEN nco.nspname IS NOT NULL THEN
          current_database()
        ELSE
          NULL::name END::information_schema.sql_identifier AS collation_catalog,
          nco.nspname::information_schema.sql_identifier AS collation_schema,
          co.collname::information_schema.sql_identifier AS collation_name,
          CASE WHEN t.typtype = 'd'::"char" THEN
            current_database()
          ELSE
            NULL::name END::information_schema.sql_identifier AS domain_catalog,
            CASE WHEN t.typtype = 'd'::"char" THEN
              nt.nspname
            ELSE
              NULL::name END::information_schema.sql_identifier AS domain_schema,
              CASE WHEN t.typtype = 'd'::"char" THEN
                t.typname
              ELSE
                NULL::name END::information_schema.sql_identifier AS domain_name,
                current_database()::information_schema.sql_identifier AS udt_catalog,
                COALESCE(nbt.nspname, nt.nspname)::information_schema.sql_identifier AS udt_schema,
                COALESCE(bt.typname, t.typname)::information_schema.sql_identifier AS udt_name,
                NULL::character varying::information_schema.sql_identifier AS scope_catalog,
                NULL::character varying::information_schema.sql_identifier AS scope_schema,
                NULL::character varying::information_schema.sql_identifier AS scope_name,
                NULL::integer::information_schema.cardinal_number AS maximum_cardinality,
                a.attnum::information_schema.sql_identifier AS dtd_identifier,
                'NO'::character varying::information_schema.yes_or_no AS is_self_referencing,
                CASE WHEN a.attidentity = ANY (ARRAY['a'::"char",
                  'd'::"char"]) THEN
                  'YES'::text
                ELSE
                  'NO'::text END::information_schema.yes_or_no AS is_identity,
                  CASE a.attidentity
                  WHEN 'a'::"char" THEN
                    'ALWAYS'::text
                  WHEN 'd'::"char" THEN
                    'BY DEFAULT'::text
                  ELSE
                    NULL::text END::information_schema.character_data AS identity_generation,
                    seq.seqstart::information_schema.character_data AS identity_start,
                    seq.seqincrement::information_schema.character_data AS identity_increment,
                    seq.seqmax::information_schema.character_data AS identity_maximum,
                    seq.seqmin::information_schema.character_data AS identity_minimum,
                    CASE WHEN seq.seqcycle THEN
                      'YES'::text
                    ELSE
                      'NO'::text END::information_schema.yes_or_no AS identity_cycle,
                      'NEVER'::character varying::information_schema.character_data AS is_generated,
                      NULL::character varying::information_schema.character_data AS generation_expression,
                      CASE WHEN (c.relkind = ANY (ARRAY['r'::"char",
                          'p'::"char"]))
                        OR (c.relkind = ANY (ARRAY['v'::"char",
                            'f'::"char"]))
                        AND pg_column_is_updatable (c.oid::regclass,
                          a.attnum,
                          FALSE) THEN
                        'YES'::text
                      ELSE
                        'NO'::text END::information_schema.yes_or_no AS is_updatable
                      FROM
                        pg_attribute a
                      LEFT JOIN pg_attrdef ad ON a.attrelid = ad.adrelid
                        AND a.attnum = ad.adnum
                      JOIN (pg_class c
                        JOIN pg_namespace nc ON c.relnamespace = nc.oid) ON a.attrelid = c.oid
                      JOIN (pg_type t
                        JOIN pg_namespace nt ON t.typnamespace = nt.oid) ON a.atttypid = t.oid
                      LEFT JOIN (pg_type bt
                        JOIN pg_namespace nbt ON bt.typnamespace = nbt.oid) ON t.typtype = 'd'::"char"
                        AND t.typbasetype = bt.oid
                    LEFT JOIN (pg_collation co
                      JOIN pg_namespace nco ON co.collnamespace = nco.oid) ON a.attcollation = co.oid
                        AND (nco.nspname <> 'pg_catalog'::name
                          OR co.collname <> 'default'::name)
                      LEFT JOIN (pg_depend dep
                        JOIN pg_sequence seq ON dep.classid = 'pg_class'::regclass::oid
                          AND dep.objid = seq.seqrelid
                          AND dep.deptype = 'i'::"char") ON dep.refclassid = 'pg_class'::regclass::oid
                        AND dep.refobjid = c.oid
                        AND dep.refobjsubid = a.attnum
                    WHERE
                      NOT pg_is_other_temp_schema(nc.oid)
                        AND a.attnum > 0
                        AND NOT a.attisdropped
                        AND (c.relkind = ANY (ARRAY['r'::"char",
                            'v'::"char",
                            'f'::"char",
                            'p'::"char",
                            'c'::"char"]))
                        AND (pg_has_role(c.relowner, 'USAGE'::text)
                          OR has_column_privilege(c.oid, a.attnum, 'SELECT, INSERT, UPDATE, REFERENCES'::text))
),
--
-- ────────────────────────────────────────────────────────────────── I ──────────
--   :::::: E L E M E N T   T Y P E S : :  :   :    :     :        :          :
-- ────────────────────────────────────────────────────────────────────────────
--
information_schema_element_types AS (
  SELECT
    bt.oid AS "bt_oid",
    current_database()::information_schema.sql_identifier AS object_catalog,
    n.nspname::information_schema.sql_identifier AS object_schema,
    x.objname AS object_name,
    x.objtype::information_schema.character_data AS object_type,
    x.objdtdid::information_schema.sql_identifier AS collection_type_identifier,
    CASE WHEN nbt.nspname = 'pg_catalog'::name THEN
      format_type(bt.oid, NULL:: integer)
    ELSE
      'USER-DEFINED'::text END::information_schema.character_data AS data_type,
      NULL::integer::information_schema.cardinal_number AS character_maximum_length,
      NULL::integer::information_schema.cardinal_number AS character_octet_length,
      NULL::character varying::information_schema.sql_identifier AS character_set_catalog,
      NULL::character varying::information_schema.sql_identifier AS character_set_schema,
      NULL::character varying::information_schema.sql_identifier AS character_set_name,
      CASE WHEN nco.nspname IS NOT NULL THEN
        current_database()
      ELSE
        NULL::name END::information_schema.sql_identifier AS collation_catalog,
        nco.nspname::information_schema.sql_identifier AS collation_schema,
        co.collname::information_schema.sql_identifier AS collation_name,
        NULL::integer::information_schema.cardinal_number AS numeric_precision,
        NULL::integer::information_schema.cardinal_number AS numeric_precision_radix,
        NULL::integer::information_schema.cardinal_number AS numeric_scale,
        NULL::integer::information_schema.cardinal_number AS datetime_precision,
        NULL::character varying::information_schema.character_data AS interval_type,
        NULL::integer::information_schema.cardinal_number AS interval_precision,
        NULL::character varying::information_schema.character_data AS domain_default,
        current_database()::information_schema.sql_identifier AS udt_catalog,
        nbt.nspname::information_schema.sql_identifier AS udt_schema,
        bt.typname::information_schema.sql_identifier AS udt_name,
        NULL::character varying::information_schema.sql_identifier AS scope_catalog,
        NULL::character varying::information_schema.sql_identifier AS scope_schema,
        NULL::character varying::information_schema.sql_identifier AS scope_name,
        NULL::integer::information_schema.cardinal_number AS maximum_cardinality,
        ('a'::text || x.objdtdid::text)::information_schema.sql_identifier AS dtd_identifier
      FROM
        pg_namespace n,
        pg_type at,
        pg_namespace nbt,
        pg_type bt,
        (
          SELECT
            c.relnamespace,
            c.relname::information_schema.sql_identifier AS relname,
            CASE WHEN c.relkind = 'c'::"char" THEN
              'USER-DEFINED TYPE'::text
            ELSE
              'TABLE'::text
            END AS "case",
            a.attnum,
            a.atttypid,
            a.attcollation
          FROM
            pg_class c,
            pg_attribute a
          WHERE
            c.oid = a.attrelid
            AND (c.relkind = ANY (ARRAY['r'::"char",
                'v'::"char",
                'f'::"char",
                'c'::"char",
                'p'::"char"]))
            AND a.attnum > 0
            AND NOT a.attisdropped
          UNION ALL
          SELECT
            t.typnamespace,
            t.typname::information_schema.sql_identifier AS typname,
            'DOMAIN'::text AS text,
            1,
            t.typbasetype,
            t.typcollation
          FROM
            pg_type t
          WHERE
            t.typtype = 'd'::"char"
          UNION ALL
          SELECT
            ss.pronamespace,
            ((ss.proname::text || '_'::text) || ss.oid::text)::information_schema.sql_identifier AS sql_identifier,
            'ROUTINE'::text AS text,
            (ss.x).n AS n,
            (ss.x).x AS x,
            0
          FROM (
            SELECT
              p.pronamespace,
              p.proname,
              p.oid,
              information_schema._pg_expandarray (COALESCE(p.proallargtypes, p.proargtypes::oid[])) AS x
            FROM
              pg_proc p) ss
          UNION ALL
          SELECT
            p.pronamespace,
            ((p.proname::text || '_'::text) || p.oid::text)::information_schema.sql_identifier AS sql_identifier,
            'ROUTINE'::text AS text,
            0,
            p.prorettype,
            0
          FROM
            pg_proc p) x (objschema,
            objname,
            objtype,
            objdtdid,
            objtypeid,
            objcollation)
          LEFT JOIN (pg_collation co
            JOIN pg_namespace nco ON co.collnamespace = nco.oid) ON x.objcollation = co.oid
            AND (nco.nspname <> 'pg_catalog'::name
              OR co.collname <> 'default'::name)
        WHERE
          n.oid = x.objschema
          AND at.oid = x.objtypeid
          AND at.typelem <> 0::oid
          AND at.typlen = '-1'::integer
          AND at.typelem = bt.oid
          AND nbt.oid = bt.typnamespace
          AND ((n.nspname,
              x.objname::text,
              x.objtype,
              x.objdtdid::information_schema.sql_identifier::text)
            IN (
              SELECT
                data_type_privileges.object_schema,
                data_type_privileges.object_name,
                data_type_privileges.object_type,
                data_type_privileges.dtd_identifier
              FROM
                information_schema.data_type_privileges))
),
--
-- ──────────────────────────────────────────────────────────── I ──────────
--   :::::: M A I N   Q U E R Y : :  :   :    :     :        :          :
-- ──────────────────────────────────────────────────────────────────────
--
main_query AS (
  SELECT
    CASE col.relkind
    WHEN 'r' THEN
      'table'
    WHEN 'v' THEN
      'view'
    WHEN 'c' THEN
      'composite'
    END AS "kind",
    col.table_catalog AS "database",
    col.table_schema AS "schema",
    col.table_name AS "table",
    col.column_name AS "name",
    col.column_default AS "defaultWithTypeCast",
    CAST(col.is_nullable AS BOOLEAN) AS "allowNull",
    col.data_type AS "type",
    col.typcategory AS "typeCategory",
    -- See http://www.postgresql.org/docs/current/static/catalog-pg-type.html
    CASE WHEN array_dimension > 0 THEN
      information_schema._pg_char_max_length (el.bt_oid,
        col.atttypmod)
    ELSE
      col.character_maximum_length
    END AS "length",
    CASE WHEN array_dimension > 0 THEN
      COALESCE(information_schema._pg_datetime_precision (el.bt_oid, col.atttypmod), information_schema._pg_numeric_precision (el.bt_oid, col.atttypmod))
    ELSE
      COALESCE(col.numeric_precision, col.datetime_precision)
    END AS "precision",
    CASE WHEN array_dimension > 0 THEN
      information_schema._pg_numeric_scale (el.bt_oid,
        col.atttypmod)
    ELSE
      col.numeric_scale
    END AS "scale",
    el.data_type AS "arrayType",
    -- MANUAL WAY: CASE WHEN col.data_type = 'ARRAY' THEN LEFT(format_type(col.atttypid, NULL), -2) ELSE NULL END AS "arrayType",
    col.attndims AS "arrayDimension",
    col.domain_catalog AS "domainCatalog",
    col.domain_schema AS "domainSchema",
    col.domain_name AS "domainName",
    col.udt_catalog AS "udtCatalog",
    col.udt_schema AS "udtSchema",
    regexp_replace(col.udt_name, '^_', '') AS "udtName",
    -- User Defined Types such   AS composite, enumerated etc.
    ordinal_position AS "position",
    pg_catalog.col_description(col.oid, col.ordinal_position::INT) AS "comment"
  FROM
    information_schema_columns col
  LEFT JOIN information_schema_element_types el ON ((col.table_catalog,
      col.table_schema,
      col.table_name,
      'TABLE',
      col.dtd_identifier) = (el.object_catalog,
      el.object_schema,
      el.object_name,
      el.object_type,
      el.collection_type_identifier))
WHERE
  col.table_schema = ANY ($1)
ORDER BY
  col.table_schema,
  col.table_name,
  col.ordinal_position) --
-- ──────────────────────────────────────────────────────────────────────────── I ──────────
--   :::::: E X E C U T E   M A I N   Q U E R Y : :  :   :    :     :        :          :
-- ──────────────────────────────────────────────────────────────────────────────────────
--
SELECT
  *
FROM
  main_query
