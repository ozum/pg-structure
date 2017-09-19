-- Should return:
-- schemaName, tableName, name, default, allowNull, type, special, length, precision, scale, arrayType, arrayDimension, position, description
SELECT
  CONCAT(cols.table_catalog, '.', cols.table_schema, '.', cols.table_name)                          AS "parent",
  cols.table_schema                                                                                 AS "schema",
  cols.table_catalog                                                                                AS "db",
  pg_catalog.obj_description(c.relnamespace, 'pg_namespace')                                        AS "schemaComment",
  CASE c.relkind
      WHEN 'r' THEN 'table'
      WHEN 'v' THEN 'view'
  END                                                                                               AS "kind",
  cols.table_name                                                                                   AS "table",
  pg_catalog.obj_description(c.oid, 'pg_class')                                                     AS "tableDescription",
  cols.column_name                                                                                  AS "name",
  CONCAT(cols.table_schema, '.', cols.table_name, '.', cols.column_name)                            AS "fullName",
  CONCAT(cols.table_catalog, '.', cols.table_schema, '.', cols.table_name, '.', cols.column_name)   AS "fullCatalogName",
  cols.column_default                                                                               AS "defaultWithTypeCast",
  CASE WHEN cols.column_default ILIKE 'nextval%' THEN TRUE ELSE FALSE END                           AS "isAutoIncrement",
  CAST(cols.is_nullable AS BOOLEAN)                                                                 AS "allowNull",
  CASE WHEN cols.udt_name = 'hstore' THEN cols.udt_name
  ELSE LOWER(cols.data_type) END                                                                    AS "type",
  t.typcategory                                                                                     AS "typeCategory", -- See http://www.postgresql.org/docs/current/static/catalog-pg-type.html
  CASE WHEN t.typcategory = 'E' THEN
      (SELECT Array_agg(e.enumlabel)
       FROM pg_catalog.pg_type t JOIN pg_catalog.pg_enum e ON t.oid = e.enumtypid
       WHERE t.typname = udt_name)
  ELSE NULL END                                                                                     AS "enumValues",
  CASE WHEN LOWER(cols.data_type) = 'array' THEN information_schema._pg_char_max_length(arraytype.oid, a.atttypmod)
  ELSE cols.character_maximum_length END                                                            AS "length",
  CASE WHEN LOWER(cols.data_type) = 'array' THEN COALESCE(
      information_schema._pg_datetime_precision(arraytype.oid, a.atttypmod),
      information_schema._pg_numeric_precision(arraytype.oid, a.atttypmod))
  WHEN cols.datetime_precision IS NULL THEN numeric_precision
  ELSE cols.datetime_precision END                                                                  AS "precision",
  CASE WHEN LOWER(cols.data_type) = 'array' THEN information_schema._pg_numeric_scale(arraytype.oid, a.atttypmod)
  ELSE cols.numeric_scale END                                                                       AS "scale",
  CASE WHEN LEFT(cols.udt_name, 1) = '_' THEN LEFT(format_type(a.atttypid, NULL), -2)
  ELSE NULL END                                                                                     AS "arrayType",
  a.attndims                                                                                        AS "arrayDimension",
  cols.domain_catalog                                                                               AS "domainCatalog",
  cols.domain_schema                                                                                AS "domainSchema",
  cols.domain_name                                                                                  AS "domainName",
  CASE WHEN t.typcategory IN ('E', 'C') THEN format_type(a.atttypid, NULL)
  ELSE NULL END                                                                                     AS "userDefinedType",
  cols.udt_name                                                                                     AS "udtName",      -- User Defined Types such as composite, enumerated etc.
  cols.ordinal_position                                                                             AS "position",
  pg_catalog.col_description(c.oid, cols.ordinal_position :: INT)                                   AS "description"
FROM information_schema.columns cols
  INNER JOIN pg_catalog.pg_class c ON c.oid = (SELECT ('"' || cols.table_schema || '"."' || cols.table_name || '"')::regclass::oid) AND c.relname = cols.table_name
  INNER JOIN pg_catalog.pg_attribute a ON c.oid = a.attrelid and a.attname = cols.column_name
  --LEFT JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace AND pg_catalog.pg_table_is_visible(c.oid)
  LEFT JOIN pg_catalog.pg_type arraytype ON arraytype.typname = RIGHT(cols.udt_name, -1)
  INNER JOIN pg_type t ON a.atttypid = t.oid
WHERE table_schema = ANY($1)
--WHERE table_schema = 'public'
ORDER BY cols.table_schema, cols.table_name, cols.ordinal_position


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
