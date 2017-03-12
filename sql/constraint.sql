WITH base AS (
    SELECT
        r.oid                                                                                   AS r_oid,
        r.relname                                                                               AS r_relname,
        r.relowner                                                                              AS r_relowner,
        r.relkind                                                                               AS r_relkind,
        r.relnamespace                                                                          AS r_relnamespace,
        nr.nspname                                                                              AS nr_nspname,
        nr.oid                                                                                  AS nr_oid,
        c.oid                                                                                   AS c_oid,
        c.conname                                                                               AS c_conname,
        c.contype                                                                               AS c_contype,
        c.conindid                                                                              AS c_conindid,
        c.confkey                                                                               AS c_confkey,
        c.confrelid                                                                             AS c_confrelid,
        c.condeferrable                                                                         AS c_condeferrable,
        c.condeferred                                                                           AS c_condeferred,
        c.connamespace                                                                          AS c_connamespace,
        c.confmatchtype                                                                         AS c_confmatchtype,
        c.confupdtype                                                                           AS c_confupdtype,
        c.confdeltype                                                                           AS c_confdeltype,
        c.conkey                                                                                AS c_conkey

    FROM
        pg_namespace nr,
        pg_class r,
        pg_constraint c

    WHERE
        r.oid = c.conrelid
),

layer2 AS (
    SELECT
        base.*,
        nc.nspname                                                                              AS nc_nspname,
        nc.oid                                                                                  AS nc_oid
    FROM
        base,
        pg_namespace nc

    WHERE
        base.nr_oid = base.r_relnamespace AND
        nc.oid = base.c_connamespace AND
        base.r_relkind = 'r'::"char" AND
        NOT pg_is_other_temp_schema(base.nr_oid)
),

table_constraints AS (
    SELECT
        layer2.c_oid                                                                            AS constraint_oid,  -- Extra
        current_database()::information_schema.sql_identifier                                   AS constraint_catalog,
        layer2.nc_nspname::information_schema.sql_identifier 								    AS constraint_schema,
        layer2.c_conname::information_schema.sql_identifier 						            AS constraint_name,
        current_database()::information_schema.sql_identifier                                   AS table_catalog,
        layer2.nr_nspname::information_schema.sql_identifier                                    AS table_schema,
        layer2.r_relname::information_schema.sql_identifier                                     AS table_name,
        CASE c_contype
            WHEN 'c'::"char" THEN 'CHECK'::text
            WHEN 'f'::"char" THEN 'FOREIGN KEY'::text
            WHEN 'p'::"char" THEN 'PRIMARY KEY'::text
            WHEN 'u'::"char" THEN 'UNIQUE'::text
            ELSE NULL::text
        END::information_schema.character_data                                                  AS constraint_type,
        CASE
            WHEN c_condeferrable THEN 'YES'::text
            ELSE 'NO'::text
        END::information_schema.yes_or_no                                                       AS is_deferrable,
        CASE
            WHEN c_condeferred THEN 'YES'::text
            ELSE 'NO'::text
        END::information_schema.yes_or_no                                                       AS initially_deferred
    FROM
        layer2

    WHERE
        (c_contype <> ALL (ARRAY [ 't'::"char", 'x'::"char" ])) AND
        (pg_has_role(r_relowner, 'USAGE'::text) OR
        has_table_privilege(r_oid,
        'INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER'::text) OR
        has_any_column_privilege(r_oid, 'INSERT, UPDATE, REFERENCES'::text))


     UNION ALL
        SELECT
          	nr.oid                                                                              AS constraint_oid,  -- Extra
          	current_database()::information_schema.sql_identifier 								AS constraint_catalog,
        	nr.nspname::information_schema.sql_identifier 										AS constraint_schema,
        	(((((nr.oid::text || '_'::text) || r.oid::text) || '_'::text) || a.attnum::text)
        		|| '_not_null'::text)::information_schema.sql_identifier 						AS constraint_name,
            current_database()::information_schema.sql_identifier 								AS table_catalog,
            nr.nspname::information_schema.sql_identifier 										AS table_schema,
            r.relname::information_schema.sql_identifier 										AS table_name,
            'CHECK'::character varying::information_schema.character_data 						AS constraint_type,
            'NO'::character varying::information_schema.yes_or_no 							    AS is_deferrable,
            'NO'::character varying::information_schema.yes_or_no 							    AS initially_deferred
        FROM
            pg_namespace nr,
            pg_class r,
            pg_attribute a
        WHERE
            nr.oid = r.relnamespace AND
            r.oid = a.attrelid AND
            a.attnotnull AND
            a.attnum > 0 AND
            NOT a.attisdropped AND
            r.relkind = 'r'::"char" AND
            NOT pg_is_other_temp_schema(nr.oid) AND
            (pg_has_role(r.relowner, 'USAGE'::text) OR
            has_table_privilege(r.oid,
            'INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER'::text) OR
            has_any_column_privilege(r.oid, 'INSERT, UPDATE, REFERENCES'::text))

),

key_column_usage AS (
    SELECT
        ss.c_oid																				AS constraint_oid, -- Extra
        current_database()::information_schema.sql_identifier                                   AS constraint_catalog,
        ss.nc_nspname::information_schema.sql_identifier                                        AS constraint_schema,
        ss.c_conname::information_schema.sql_identifier                                         AS constraint_name,
        current_database()::information_schema.sql_identifier                                   AS table_catalog,
        ss.nr_nspname::information_schema.sql_identifier                                        AS table_schema,
        ss.r_relname::information_schema.sql_identifier                                         AS table_name,
        a.attname::information_schema.sql_identifier                                            AS column_name,
        (x) . n::information_schema.cardinal_number                                             AS ordinal_position,
        CASE
            WHEN ss.c_contype = 'f'::"char"
                THEN information_schema._pg_index_position(ss.c_conindid, ss.c_confkey [(ss.x) . n ])
            ELSE NULL::integer
            END::information_schema.cardinal_number                                             AS position_in_unique_constraint

    FROM
        pg_attribute a,
        (SELECT *, information_schema._pg_expandarray(c_conkey) AS x
            FROM layer2 WHERE (c_contype = ANY (ARRAY [ 'p'::"char", 'u'::"char", 'f'::"char" ]))) ss

    WHERE

        ss.r_oid = a.attrelid AND
        a.attnum = (ss.x) . x AND
        NOT a.attisdropped AND
        (pg_has_role(ss.r_relowner, 'USAGE'::text) OR
        has_column_privilege(ss.r_oid, a.attnum, 'SELECT, INSERT, UPDATE, REFERENCES'::text))




),

referential_constraints AS (
    SELECT
        base.c_oid                                                                              AS constraint_oid,
        current_database()::information_schema.sql_identifier                                   AS constraint_catalog,
        base.nr_nspname::information_schema.sql_identifier                                      AS constraint_schema,
        base.c_conname::information_schema.sql_identifier                                       AS constraint_name,
        CASE
           WHEN npkc.nspname IS NULL THEN NULL::name
           ELSE current_database()
        END::information_schema.sql_identifier                                                  AS unique_constraint_catalog,
        npkc.nspname::information_schema.sql_identifier                                         AS unique_constraint_schema,
        pkc.conname::information_schema.sql_identifier                                          AS unique_constraint_name,
        CASE base.c_confmatchtype
            WHEN 'f'::"char" THEN 'FULL'::text
            WHEN 'p'::"char" THEN 'PARTIAL'::text
            WHEN 's'::"char" THEN 'NONE'::text
            ELSE NULL::text
        END::information_schema.character_data                                                  AS match_option,
        CASE base.c_confupdtype
            WHEN 'c'::"char" THEN 'CASCADE'::text
            WHEN 'n'::"char" THEN 'SET NULL'::text
            WHEN 'd'::"char" THEN 'SET DEFAULT'::text
            WHEN 'r'::"char" THEN 'RESTRICT'::text
            WHEN 'a'::"char" THEN 'NO ACTION'::text
            ELSE NULL::text
        END::information_schema.character_data                                                  AS update_rule,
        CASE base.c_confdeltype
            WHEN 'c'::"char" THEN 'CASCADE'::text
            WHEN 'n'::"char" THEN 'SET NULL'::text
            WHEN 'd'::"char" THEN 'SET DEFAULT'::text
            WHEN 'r'::"char" THEN 'RESTRICT'::text
            WHEN 'a'::"char" THEN 'NO ACTION'::text
            ELSE NULL::text
        END::information_schema.character_data                                                  AS delete_rule

    FROM
        base
        LEFT JOIN pg_depend d1 ON d1.objid = base.c_oid AND d1.classid = 'pg_constraint'::regclass::oid AND
            d1.refclassid = 'pg_class'::regclass::oid AND d1.refobjsubid = 0
        LEFT JOIN pg_depend d2 ON d2.refclassid = 'pg_constraint'::regclass::oid AND
            d2.classid = 'pg_class'::regclass::oid AND d2.objid = d1.refobjid AND
            d2.objsubid = 0 AND d2.deptype = 'i'::"char"
        LEFT JOIN pg_constraint pkc ON pkc.oid = d2.refobjid AND
            (pkc.contype = ANY (ARRAY [ 'p'::"char", 'u'::"char" ]))AND pkc.conrelid = base.c_confrelid
        LEFT JOIN pg_namespace npkc ON pkc.connamespace = npkc.oid

    WHERE
        base.nr_oid = base.c_connamespace AND
        base.c_contype = 'f'::"char" AND
        (
            pg_has_role(base.r_relowner, 'USAGE'::text) OR
            has_table_privilege(base.r_oid, 'INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER'::text) OR
           has_any_column_privilege(base.r_oid, 'INSERT, UPDATE, REFERENCES'::text)
        )
)

SELECT
    tc.constraint_schema                                            AS "constraintSchema",
    tc.constraint_name                                              AS "constraintName",
    tc.constraint_type                                              AS "constraintType",
    pg_catalog.obj_description(tc.constraint_oid, 'pg_constraint')  AS "constraintDescription",
    kcu.column_name                                                 AS "columnName",
    tc.table_schema                                                 AS "tableSchema",
    tc.table_name                                                   AS "tableName",
    kcu.ordinal_position                                            AS "position",
    kcu.position_in_unique_constraint                               AS "uniqueConstraintPosition",
    tc.is_deferrable                                                AS "isDeferrable",
    tc.initially_deferred                                           AS "initiallyDeferred",
	rc.match_option                                                 AS "matchOption",
	rc.update_rule                                                  AS "updateRule",
	rc.delete_rule                                                  AS "deleteRule",

    -- REFERENCED COLUMN DETAILS
    kcu2.table_schema                                               AS "referencedTableSchema",
    kcu2.table_name                                                 AS "referencedTableName",
    kcu2.column_name                                                AS "referencedColumnName"

FROM
    table_constraints tc
    LEFT JOIN key_column_usage kcu
        ON tc.constraint_oid = kcu.constraint_oid
            AND tc.constraint_catalog = kcu.constraint_catalog
            AND tc.constraint_schema = kcu.constraint_schema
            AND tc.constraint_name = kcu.constraint_name
    LEFT JOIN referential_constraints rc
        ON tc.constraint_oid = rc.constraint_oid
            AND kcu.constraint_name = rc.constraint_name
            AND kcu.constraint_catalog = rc.constraint_catalog
            AND kcu.constraint_schema = rc.constraint_schema
    LEFT JOIN key_column_usage kcu2
        ON kcu2.ordinal_position = kcu.position_in_unique_constraint
            AND kcu2.constraint_name = rc.unique_constraint_name
            AND kcu.constraint_catalog = rc.constraint_catalog
            AND kcu.constraint_schema = rc.constraint_schema


WHERE
    tc.constraint_schema = ANY($1)
    AND (kcu.table_schema = ANY($1) OR kcu.table_schema IS NULL)
    AND (kcu2.table_schema = ANY($1) OR kcu2.table_schema IS NULL)    -- IF NO REFERNCED COLUMN EXISTS. ie. Unique Index etc.

ORDER BY
    tc.table_schema,
    tc.table_name,
    tc.constraint_name,
    kcu.ordinal_position,
    kcu.position_in_unique_constraint

--SELECT * FROM referential_constraints     -- SELECT * FROM information_schema.referential_constraints
--SELECT * FROM key_column_usage            -- SELECT * FROM information_schema.key_column_usage
--SELECT * FROM table_constraints           -- SELECT * FROM information_schema.table_constraints