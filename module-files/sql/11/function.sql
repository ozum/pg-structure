SELECT
    pg_proc.oid                                                 AS "oid",
    pg_proc.pronamespace                                        AS "schemaOid",
    pg_proc.proname                                             AS "name",
    pg_proc.prokind                                             AS "kind", -- VERSION 11
    CASE pg_proc.prokind
      WHEN 'a' THEN NULL
      ELSE pg_catalog.pg_get_functiondef(pg_proc.oid)
    END                                                         AS "source",
    pg_language.lanname                                         AS "language",
    pg_proc.procost                                             AS "estimatedCost",
    pg_proc.prorows                                             AS "estimatedRows",
    pg_proc.proleakproof                                        AS "isLeakproof",
    pg_proc.proisstrict                                         AS "isStrict",
    CASE pg_proc.proparallel
      WHEN 's' THEN 'safe'
      WHEN 'u' THEN 'unsafe'
      WHEN 'r' THEN 'restricted'
    END                                                         AS "parallelSafety",
    CASE pg_proc.provolatile
      WHEN 'i' THEN 'immutable'
      WHEN 's' THEN 'stable'
      WHEN 'v' THEN 'volatile'
    END                                                         AS "volatility",
    pg_proc.prorettype                                          AS "returnType",
    pg_proc.proretset                                           AS "returnsSet",
    COALESCE(pg_proc.proallargtypes, proargtypes)               AS "argumentTypes",
    pg_proc.proargnames                                         AS "argumentNames",
    pg_proc.proargmodes                                         AS "argumentModes",
    format('%s(%s)',
      pg_proc.proname,
      replace(pg_proc.proargtypes::text, ' ', ',')
    )                                                           AS "signature",
    pg_catalog.obj_description(pg_proc.oid, 'pg_proc')          AS "comment"
FROM
    pg_catalog.pg_proc
    JOIN pg_catalog.pg_language on pg_language.oid = pg_proc.prolang
WHERE
    pg_proc.pronamespace = ANY ($1)
    -- AND pg_proc.prokind in ('f', 'p', 'w', 'a') -- this is for versions 11 and above
    -- AND pg_proc.probin is null;
