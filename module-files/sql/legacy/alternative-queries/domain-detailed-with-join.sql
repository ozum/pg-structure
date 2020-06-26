/*
 See `column-detailed-with-join.sql` file. Same principles.
 */
WITH information_schema_domains AS (
  SELECT
    t.oid AS t_oid,
    t.typcategory,
    t.typndims AS array_dimension,
    t.typtypmod,
    t.typnotnull,
    bt.oid AS bt_oid,
    current_database()::information_schema.sql_identifier AS domain_catalog,
    nt.nspname::information_schema.sql_identifier AS domain_schema,
    t.typname::information_schema.sql_identifier AS domain_name,
    CASE WHEN t.typelem <> 0::oid
      AND t.typlen = '-1'::integer THEN
      'ARRAY'::text
    WHEN nbt.nspname = 'pg_catalog'::name THEN
      format_type(t.typbasetype, NULL::integer)
    ELSE
      'USER-DEFINED'::text END::information_schema.character_data AS data_type,
      information_schema._pg_char_max_length (t.typbasetype, t.typtypmod)::information_schema.cardinal_number AS character_maximum_length,
      information_schema._pg_char_octet_length (t.typbasetype, t.typtypmod)::information_schema.cardinal_number AS character_octet_length,
      NULL::character varying::information_schema.sql_identifier AS character_set_catalog,
      NULL::character varying::information_schema.sql_identifier AS character_set_schema,
      NULL::character varying::information_schema.sql_identifier AS character_set_name,
      CASE WHEN nco.nspname IS NOT NULL THEN
        current_database()
      ELSE
        NULL::name END::information_schema.sql_identifier AS collation_catalog,
        nco.nspname::information_schema.sql_identifier AS collation_schema,
        co.collname::information_schema.sql_identifier AS collation_name,
        information_schema._pg_numeric_precision (t.typbasetype, t.typtypmod)::information_schema.cardinal_number AS numeric_precision,
        information_schema._pg_numeric_precision_radix (t.typbasetype, t.typtypmod)::information_schema.cardinal_number AS numeric_precision_radix,
        information_schema._pg_numeric_scale (t.typbasetype, t.typtypmod)::information_schema.cardinal_number AS numeric_scale,
        information_schema._pg_datetime_precision (t.typbasetype, t.typtypmod)::information_schema.cardinal_number AS datetime_precision,
        information_schema._pg_interval_type (t.typbasetype, t.typtypmod)::information_schema.character_data AS interval_type,
        NULL::integer::information_schema.cardinal_number AS interval_precision,
        t.typdefault::information_schema.character_data AS domain_default,
        current_database()::information_schema.sql_identifier AS udt_catalog,
        nbt.nspname::information_schema.sql_identifier AS udt_schema,
        bt.typname::information_schema.sql_identifier AS udt_name,
        NULL::character varying::information_schema.sql_identifier AS scope_catalog,
        NULL::character varying::information_schema.sql_identifier AS scope_schema,
        NULL::character varying::information_schema.sql_identifier AS scope_name,
        NULL::integer::information_schema.cardinal_number AS maximum_cardinality,
        1::information_schema.sql_identifier AS dtd_identifier
      FROM
        pg_type t
        JOIN pg_namespace nt ON t.typnamespace = nt.oid
        JOIN (pg_type bt
          JOIN pg_namespace nbt ON bt.typnamespace = nbt.oid) ON t.typbasetype = bt.oid
          AND t.typtype = 'd'::"char"
      LEFT JOIN (pg_collation co
        JOIN pg_namespace nco ON co.collnamespace = nco.oid) ON t.typcollation = co.oid
        AND (nco.nspname <> 'pg_catalog'::name
          OR co.collname <> 'default'::name)
    WHERE
      pg_has_role(t.typowner, 'USAGE'::text)
        OR has_type_privilege(t.oid, 'USAGE'::text)
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
            AND n.nspname = 'public'
)
      SELECT
        d.domain_catalog AS "database",
        d.domain_schema AS "schema",
        d.domain_name AS "name",
        NOT d.typnotnull AS "allowNull",
        CASE WHEN d.data_type LIKE '%[]' THEN
          'ARRAY'
        ELSE
          d.data_type
        END AS "type",
        d.typcategory AS "typeCategory",
        CASE WHEN array_dimension > 0 THEN
          information_schema._pg_char_max_length (el.bt_oid,
            d.typtypmod)
      ELSE
        d.character_maximum_length
        END AS "length",
        CASE WHEN array_dimension > 0 THEN
          COALESCE(information_schema._pg_datetime_precision (el.bt_oid, d.typtypmod), information_schema._pg_numeric_precision (el.bt_oid, d.typtypmod))
        ELSE
          COALESCE(d.numeric_precision, d.datetime_precision)
        END AS "precision",
        CASE WHEN array_dimension > 0 THEN
          information_schema._pg_numeric_scale (el.bt_oid,
            d.typtypmod)
        ELSE
          d.numeric_scale
        END AS "scale",
        el.data_type AS "arrayType",
        array_dimension AS "arrayDimension",
        format_type(d.bt_oid, NULL),
        d.udt_catalog AS "udtCatalog",
        d.udt_schema AS "udtSchema",
        regexp_replace(d.udt_name, '^_', '') AS "udtName",
          pg_catalog.obj_description(d.t_oid, 'pg_class') AS "comment",
          *
        FROM
          information_schema_domains d
        LEFT JOIN information_schema_element_types el ON ((d.domain_catalog,
            d.domain_schema,
            d.domain_name,
            'DOMAIN',
            d.dtd_identifier) = (el.object_catalog,
            el.object_schema,
            el.object_name,
            el.object_type,
            el.collection_type_identifier))
      WHERE
        d.domain_schema = 'public' -- SELECT
        -- 				--  t.*,
        -- --  bt.*,
        -- --
        --
        --  domain_schema as "schema",
        --  domain_name as "name",
        --  data_type as "dataType",
        --  bt_oid, typtypmod,
        --  array_dimension as "arrayDimension",
        --      CASE WHEN array_dimension > 0 THEN
        --       information_schema._pg_char_max_length (bt_oid, typtypmod)
        --     ELSE
        --       character_maximum_length
        --     END AS "length",
        --
        -- *
        --
        -- FROM domains
