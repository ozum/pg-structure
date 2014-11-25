-- Primary Key, Unique Constraint details

SELECT
  tc.constraint_schema  AS "constraintSchema",
  tc.constraint_name    AS "constraintName",
  tc.constraint_type    AS "constraintType",
  tc.table_schema       AS "tableSchema",
  tc.table_name         AS "tableName",
  kcu.column_name       AS "columnName",
  tc.is_deferrable      AS "isDeferrable",
  tc.initially_deferred AS "initiallyDeferred"


FROM information_schema.table_constraints tc
  INNER JOIN information_schema.key_column_usage kcu
    ON tc.constraint_catalog = kcu.constraint_catalog
       AND tc.constraint_schema = kcu.constraint_schema
       AND tc.constraint_name = kcu.constraint_name

WHERE Lower(tc.constraint_schema) = ANY ($1)
      AND Lower(tc.constraint_type) NOT IN ('check', 'foreign key')
ORDER BY tc.table_schema,
  tc.table_name,
  kcu.column_name