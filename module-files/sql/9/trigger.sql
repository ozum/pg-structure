SELECT
  t.oid                                                                                     AS "oid",
  c.relnamespace                                                                            AS "schemaOid",
  tgrelid                                                                                   AS "entityOid",
  tgname                                                                                    AS "name",
  tgfoid                                                                                    AS "functionOid",

  CASE t.tgtype::integer & 1 WHEN 1 THEN 'row' ELSE 'statement' END                         AS "orientation",

  CASE t.tgtype::integer & 66
    WHEN 2 THEN 'before'
    WHEN 64 THEN 'insteadOf'
    ELSE 'after'
  END                                                                                       AS "timing",

  regexp_split_to_array(LTRIM(
    (CASE WHEN (tgtype::int::bit(7) & b'0000100')::int = 0 THEN '' ELSE ' insert' END) ||
    (CASE WHEN (tgtype::int::bit(7) & b'0001000')::int = 0 THEN '' ELSE ' delete' END) ||
    (CASE WHEN (tgtype::int::bit(7) & b'0010000')::int = 0 THEN '' ELSE ' update' END) ||
    (CASE WHEN (tgtype::int::bit(7) & b'0100000')::int = 0 THEN '' ELSE ' truncate' END)
  ), ' ')                                                                                   AS "events", -- Array, Ex:  {insert,delete,update}

  (SELECT regexp_matches[1] FROM regexp_matches(pg_get_triggerdef(t.oid), '.{35,} WHEN \((.+)\) EXECUTE FUNCTION'))      AS "condition",

  CASE tgenabled
    WHEN 'O' THEN 'origin'
    WHEN 'D' THEN 'disabled'
    WHEN 'R' THEN 'replica'
    WHEN 'A' THEN 'always'
  END                                                                                       AS "isEnabled",

  tgdeferrable                                                                              AS "isDeferrable",
  tginitdeferred                                                                            AS "isInitiallyDeferred"

FROM pg_trigger t -- https://www.postgresql.org/docs/12/catalog-pg-trigger.html
INNER JOIN pg_class c ON c.oid = t.tgrelid
WHERE
  c.relnamespace = ANY ($1)
  AND NOT tgisinternal -- Exclude internally generated  triggers.
ORDER BY
  c.relnamespace,
  LOWER(tgname)
