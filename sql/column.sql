SELECT
  table_schema                                                       AS "schemaName",
  table_name                                                         AS "tableName",
  column_name                                                        AS "name",
  column_default                                                     AS "default",
  CAST(is_nullable AS BOOLEAN)                                       AS "allowNull",
  CASE WHEN udt_name = 'hstore' THEN udt_name
  ELSE LOWER(data_type) END                                          AS "type",
  (SELECT Array_agg(e.enumlabel)
   FROM pg_catalog.pg_type t JOIN pg_catalog.pg_enum e ON t.oid = e.enumtypid
   WHERE t.typname = udt_name)                                       AS "special",
  CASE WHEN LOWER(data_type) = 'array' THEN information_schema._pg_char_max_length(arraytype.oid, a.atttypmod)
  ELSE character_maximum_length END                                  AS "length",
  CASE WHEN LOWER(data_type) = 'array' THEN COALESCE(
      information_schema._pg_datetime_precision(arraytype.oid, a.atttypmod),
      information_schema._pg_numeric_precision(arraytype.oid, a.atttypmod))
  WHEN datetime_precision IS NULL THEN numeric_precision
  ELSE datetime_precision END                                        AS "precision",
  CASE WHEN LOWER(data_type) = 'array' THEN information_schema._pg_numeric_scale(arraytype.oid, a.atttypmod)
  ELSE numeric_scale END                                             AS "scale",
  CASE WHEN LEFT(udt_name, 1) = '_' THEN LEFT(format_type(a.atttypid, NULL), -2)
  ELSE NULL END                                                      AS "arrayType",
  CASE WHEN LOWER(data_type) = 'array' THEN a.attndims
  ELSE NULL END                                                      AS "arrayDimension",
  ordinal_position                                                   AS "position",
  pg_catalog.col_description(c.oid, columns.ordinal_position :: INT) AS "description",
  pg_catalog.obj_description(c.oid)                                  AS "tableDescription"
FROM information_schema.columns
  INNER JOIN pg_catalog.pg_attribute a ON a.attname = column_name
  INNER JOIN pg_catalog.pg_class c ON c.oid = a.attrelid AND c.relname = table_name
  LEFT JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace AND pg_catalog.pg_table_is_visible(c.oid)
  LEFT JOIN pg_catalog.pg_type arraytype ON arraytype.typname = RIGHT(udt_name, -1)
  INNER JOIN pg_type t ON a.atttypid = t.oid
WHERE table_schema = ANY ($1)
ORDER BY table_schema, table_name, ordinal_position