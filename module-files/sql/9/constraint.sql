SELECT
  c.conrelid AS "tableOid",
  c.conindid AS "indexOid",
  c.contypid AS "typeOid",
  c.contype AS "kind", -- c: check, f: foreign key, p: primary key, u: unique, t: constraint trigger, x: exclusion constraint
  c.conname AS "name",
  c.conkey::int[] AS "constrainedColumnPositions",
  c.confkey::int[] AS "referencedColumnPositions",
  c.confupdtype AS "onUpdate",
  c.confdeltype AS "onDelete",
  c.confmatchtype AS "matchType",
  c.condeferrable AS "isDeferrable",
  c.condeferred AS "isDeferred",
  pg_get_constraintdef(c.oid) AS "checkConstraintExpression",
  pg_catalog.obj_description(c.oid, 'pg_constraint') AS "comment"
FROM
  pg_constraint c
WHERE
  c.connamespace = ANY ($1)
ORDER BY
  c.connamespace,
  LOWER(c.conname)
