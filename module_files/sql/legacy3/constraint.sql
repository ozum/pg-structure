SELECT
  c.contype AS "constraintType",
  ns.nspname AS "constraintSchema",
  table_class.relname AS "constraintTable",
  c.conname AS "constraintName",
  index_ns.nspname AS "indexSchema",
  index_class.relname AS "indexName", -- Is equal to "constraintName" for constraints other than FK. Equals to referenced unique Index for FK constraints.
  c.conkey AS "constrainedColumnPositions",
  c.confkey AS "referencedColumnPositions"
FROM
  pg_constraint c
  INNER JOIN pg_namespace ns ON (ns.oid = c.connamespace) -- Schema of this FK
  INNER JOIN pg_class table_class ON (table_class.oid = c.conrelid) -- Table of this FK
  INNER JOIN pg_class index_class ON (index_class.oid = c.conindid) -- Target unique index or PK this FK refers to.
  INNER JOIN pg_namespace index_ns ON (index_ns.oid = index_class.relnamespace)
WHERE
  ns.nspname = ANY ($1)
