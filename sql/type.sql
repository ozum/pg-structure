SELECT
  CONCAT(udt_catalog, '.', udt_schema, '.', udt_name)                      AS "parent",
  udt_catalog                                                              AS "db",
  udt_schema                                                               AS "schema",
  'type'                                                                   AS "kind",
  udt_name                                                                 AS "typeName",
  pg_catalog.obj_description(t.oid, 'pg_type')                             AS "typeDescription",
  attribute_name                                                           AS "name",
  CONCAT(udt_schema, '.', udt_name, '.', attribute_name)                   AS "fullName",
  CONCAT(udt_catalog, '.', udt_schema, '.', udt_name, '.', attribute_name) AS "fullCatalogName",
  attribute_default                                                        AS "defaultWithTypeCast",
  CASE WHEN attribute_default ILIKE 'nextval%' THEN TRUE ELSE FALSE END    AS "isAutoIncrement",
  CAST(is_nullable AS BOOLEAN)                                             AS "allowNull",
  CASE WHEN udt_name IN ('hstore', 'citext') THEN udt_name
    ELSE LOWER(data_type) END                                              AS "type",

  t.typcategory                                                            AS "typeCategory", -- See http://www.postgresql.org/docs/current/static/catalog-pg-type.html
  CASE WHEN t.typcategory = 'E' THEN
      (SELECT Array_agg(e.enumlabel)
       FROM pg_catalog.pg_type t JOIN pg_catalog.pg_enum e ON t.oid = e.enumtypid
       WHERE t.typname = attribute_name)
  ELSE NULL END                                                            AS "enumValues",
  CASE WHEN LOWER(data_type) = 'array' THEN information_schema._pg_char_max_length(arraytype.oid, a.atttypmod)
  ELSE character_maximum_length END                                        AS "length",
  CASE WHEN LOWER(data_type) = 'array' THEN COALESCE(
      information_schema._pg_datetime_precision(arraytype.oid, a.atttypmod),
      information_schema._pg_numeric_precision(arraytype.oid, a.atttypmod))
  WHEN datetime_precision IS NULL THEN numeric_precision
  ELSE datetime_precision END                                              AS "precision",
  CASE WHEN LOWER(data_type) = 'array' THEN information_schema._pg_numeric_scale(arraytype.oid, a.atttypmod)
  ELSE numeric_scale END                                                   AS "scale",
  CASE WHEN LEFT(udt_name, 1) = '_' THEN LEFT(format_type(a.atttypid, NULL), -2)
  ELSE NULL END                                                            AS "arrayType",
  a.attndims                                                               AS "arrayDimension",
  CASE WHEN t.typcategory IN ('E', 'C') THEN format_type(a.atttypid, NULL)
  ELSE NULL END                                                            AS "userDefinedType",
  ordinal_position                                                         AS "position",
  pg_catalog.col_description(a.attrelid, ordinal_position :: INT)          AS "description"
FROM information_schema.attributes
  INNER JOIN pg_catalog.pg_type t ON t.typname = udt_name
  INNER JOIN pg_catalog.pg_attribute a ON a.attname = attribute_name
  LEFT JOIN pg_catalog.pg_type arraytype ON arraytype.typname = RIGHT(udt_name, -1)
WHERE udt_schema = ANY($1)
-- WHERE udt_schema = 'public'
ORDER BY udt_catalog, udt_name, ordinal_position;