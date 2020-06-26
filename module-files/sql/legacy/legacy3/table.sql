/*
 Query to retrieve table and views.
 */
SELECT
  CASE c.relkind
  WHEN 'r' THEN
    'table'
  WHEN 'v' THEN
    'view'
  END AS "kind",
  nspname AS "schema",
  relname AS "name",
  pg_catalog.obj_description(c.oid, 'pg_class') AS "comment"
FROM
  pg_namespace nc
  JOIN pg_class c ON nc.oid = c.relnamespace
WHERE
  c.relkind IN ('r', 'v') -- only tables (r) and views (v)
  AND nc.nspname = ANY ($1)
ORDER BY
  nspname
