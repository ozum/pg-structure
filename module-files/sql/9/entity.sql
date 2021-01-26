/*
 Query to retrieve table and views.
 */
SELECT
  c.oid AS "oid",
  c.relnamespace AS "schemaOid",
  c.relkind AS "kind",
  c.relname AS "name",
  pg_catalog.obj_description(c.oid, 'pg_class') AS "comment"
FROM
  pg_class c
WHERE
  c.relkind IN ('r', 'v', 'm', 'p', 'S') -- only tables (r), views (v), materialized views (m), partitioned table (p), sequences (S)
  AND c.relnamespace = ANY ($1)
ORDER BY
  c.relnamespace,
  LOWER(relname)
