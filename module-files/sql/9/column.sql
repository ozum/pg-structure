SELECT
  a.attrelid AS "parentOid",
  a.attnum AS "attributeNumber",
  c.relkind AS "parentKind", -- r: table, i: index, S: sequence, t: TOAST table, v: view, m: materialized view, c: composite type, f: foreign table, p: partitioned table, I: partitioned index
  a.attname AS "name",
  pg_get_expr(ad.adbin, ad.adrelid)::information_schema.character_data AS "defaultWithTypeCast",
  a.attnotnull AS "notNull",
  format_type(a.atttypid, atttypmod) AS "sqlType",
  a.attndims AS "arrayDimension",
  a.attnum AS position,
  d.description AS "comment"
FROM
  pg_attribute a
  INNER JOIN pg_class c ON a.attrelid = c.oid
  LEFT JOIN pg_attrdef ad ON (a.attrelid = ad.adrelid
      AND a.attnum = ad.adnum)
  LEFT JOIN pg_description d ON (a.attrelid = d.objoid
      AND a.attnum = d.objsubid)
WHERE
  c.relnamespace = ANY ($1)
  AND a.attnum > 0
  AND NOT a.attisdropped
  AND c.relkind IN ('m',
    'r',
    'v',
    'c')
ORDER BY
  c.relnamespace,
  LOWER(c.relname),
  a.attnum
