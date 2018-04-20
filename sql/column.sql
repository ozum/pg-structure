-- Should return:
-- schemaName, tableName, name, default, allowNull, type, special, length, precision, scale, arrayType, arrayDimension, position, description
SELECT
  CONCAT(table_catalog, '.', table_schema, '.', table_name)          AS "parent",
  table_catalog                                                      AS "db",
  table_schema                                                       AS "schema",
  pg_catalog.obj_description(c.relnamespace, 'pg_namespace')         AS "schemaComment",
  CASE c.relkind
      WHEN 'r' THEN 'table'
      WHEN 'v' THEN 'view'
  END                                                                AS "kind",
  table_name                                                         AS "table",
  pg_catalog.obj_description(c.oid, 'pg_class')                      AS "tableDescription",
  column_name                                                        AS "name",
  CONCAT(table_schema, '.', table_name, '.', column_name)            AS "fullName",
  CONCAT(table_catalog, '.', table_schema, '.', table_name, '.', column_name) AS "fullCatalogName",
  column_default                                                     AS "defaultWithTypeCast",
  CASE WHEN column_default ILIKE 'nextval%' THEN TRUE ELSE FALSE END AS "isAutoIncrement",
  CAST(is_nullable AS BOOLEAN)                                       AS "allowNull",
  CASE WHEN udt_name IN ('hstore', 'citext') THEN udt_name
  ELSE LOWER(data_type) END                                          AS "type",
  t.typcategory                                                      AS "typeCategory", -- See http://www.postgresql.org/docs/current/static/catalog-pg-type.html
  CASE WHEN t.typcategory = 'E' THEN
      (SELECT Array_agg(e.enumlabel)
       FROM pg_catalog.pg_type t JOIN pg_catalog.pg_enum e ON t.oid = e.enumtypid
       WHERE t.typname = udt_name)
  ELSE NULL END                                                      AS "enumValues",
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
  a.attndims                                                         AS "arrayDimension",
  domain_catalog                                                     AS "domainCatalog",
  domain_schema                                                      AS "domainSchema",
  domain_name                                                        AS "domainName",
  CASE WHEN t.typcategory IN ('E', 'C') THEN format_type(a.atttypid, NULL)
  ELSE NULL END                                                      AS "userDefinedType",
  udt_name                                                           AS "udtName",      -- User Defined Types such as composite, enumerated etc.
  ordinal_position                                                   AS "position",
  pg_catalog.col_description(c.oid, columns.ordinal_position :: INT) AS "description"
FROM information_schema.columns
  INNER JOIN pg_catalog.pg_attribute a ON a.attname = column_name
  INNER JOIN pg_catalog.pg_class c ON c.oid = a.attrelid AND c.relname = table_name
  --LEFT JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace AND pg_catalog.pg_table_is_visible(c.oid)
  LEFT JOIN pg_catalog.pg_type arraytype ON arraytype.typname = RIGHT(udt_name, -1)
  INNER JOIN pg_type t ON a.atttypid = t.oid
WHERE table_schema = ANY($1)
--WHERE table_schema = 'public'
ORDER BY table_schema, table_name, ordinal_position


-- NOTE: I tried to avoid joins by using information_schema.columns views's content as CTE after adding below selections.
-- However performance of CTE seems much worse then view with joins. 550 ms vs 80 ms.

-- OID of array's elements' type. (NOT array type itself):
--COLAESCE(bt.typelem, t.typelem)

-- Array's elements' character length:
--information_schema._pg_char_max_length(COALESCE(bt.typelem, t.typelem), a.atttypmod) AS "array_character_maximum_length",

-- Array's elements' precision:
--COALESCE(
--    information_schema._pg_datetime_precision(COALESCE(bt.typelem, t.typelem), a.atttypmod),
--    information_schema._pg_numeric_precision(COALESCE(bt.typelem, t.typelem), a.atttypmod)
--) as "array_precision",

-- Array's elements' scale:
--information_schema._pg_numeric_scale(COALESCE(bt.typelem, t.typelem), a.atttypmod) AS "array_scale",

--Array's elements' type. LEFT(.., -2) removes [] from end of data type such as integer[].
--CASE WHEN RIGHT(format_type(a.atttypid, NULL), 2) = '[]' THEN LEFT(format_type(a.atttypid, NULL), -2) ELSE NULL END AS "array_data_type",

-- Array dimesnion:
--CASE WHEN a.attndims = 0 THEN NULL ELSE a.attndims END as "array_dimension",

-- Column description at position attnum:
--pg_catalog.col_description(c.oid, a.attnum::information_schema.cardinal_number) AS "description",

-- Enum values
--(SELECT Array_agg(e.enumlabel) FROM pg_catalog.pg_enum e WHERE t.oid = e.enumtypid) AS "enum_values",
