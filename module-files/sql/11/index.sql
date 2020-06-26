SELECT
  indexrelid AS "oid",
  ix.indrelid AS "tableOid",
  index_class.relname AS "name",
  ix.indisunique AS "isUnique",
  ix.indisprimary AS "isPrimaryKey",
  ix.indisexclusion AS "isExclusion",
  indkey::int[] AS "columnPositions",
  COALESCE(regexp_split_to_array(pg_get_expr(indexprs, ix.indrelid), ', '), '{}'::text[]) AS "indexExpressions",
  pg_get_expr(indpred, ix.indrelid) AS "partialIndexExpression",
  pg_catalog.obj_description(indexrelid, 'pg_index') AS "comment"
FROM
  pg_index ix
  INNER JOIN pg_class index_class ON index_class.oid = ix.indexrelid --AND index_class.relkind = 'i') -- Indexes only from pg_class, i: indexes
WHERE
  index_class.relnamespace = ANY ($1)
ORDER BY
  ix.indrelid,
  LOWER(index_class.relname)
