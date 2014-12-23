SELECT
  rc.constraint_schema  AS "constraintSchema",
  rc.constraint_name    AS "constraintName",
  kcu.table_schema      AS "tableSchema",
  kcu.table_name        AS "tableName",
  kcu.column_name       AS "columnName",
  kcu2.table_schema     AS "foreignSchemaName",
  kcu2.table_name       AS "foreignTableName",
  kcu2.column_name      AS "foreignColumnName",
  tc.is_deferrable      AS "isDeferrable",
  tc.initially_deferred AS "initiallyDeferred",
  rc.match_option       AS "matchOption",
  rc.update_rule        AS "onUpdate",
  rc.delete_rule        AS "onDelete"

FROM information_schema.referential_constraints rc
  INNER JOIN information_schema.key_column_usage kcu
    ON kcu.constraint_name = rc.constraint_name
       AND kcu.constraint_catalog = rc.constraint_catalog
       AND kcu.constraint_schema = rc.constraint_schema
  INNER JOIN information_schema.key_column_usage kcu2
    ON kcu2.ordinal_position = kcu.position_in_unique_constraint
       AND kcu2.constraint_name = rc.unique_constraint_name
       AND kcu.constraint_catalog = rc.constraint_catalog
       AND kcu.constraint_schema = rc.constraint_schema
  INNER JOIN information_schema.table_constraints tc
    ON tc.constraint_catalog = kcu.constraint_catalog
       AND tc.constraint_schema = kcu.constraint_schema
       AND tc.constraint_name = kcu.constraint_name

WHERE kcu.table_schema = ANY ($1)
      AND kcu2.table_schema = ANY ($1)

ORDER BY kcu.table_schema,
  kcu.table_name,
  kcu.constraint_name,
  kcu.position_in_unique_constraint,
  kcu2.table_schema,
  kcu2.table_name,
  kcu2.column_name