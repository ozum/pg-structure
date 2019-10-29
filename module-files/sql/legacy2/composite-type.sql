-- Should return:
-- schemaName, udtName, name, default, allowNull, type, special, length, precision, scale, arrayType, arrayDimension, position, description
SELECT
  udt_catalog                                                             AS "db",
  udt_schema                                                              AS "schema",
  CASE c.relkind
    WHEN 'r' THEN 'udt'
    WHEN 'v' THEN 'view'
  END                                                                     AS "kind",
  udt_name                                                                AS "udt",
  pg_catalog.obj_description(c.oid, 'pg_class')                           AS "udtComment",
  attribute_name                                                          AS "attributeName",
  attribute_default                                                       AS "defaultWithTypeCast",
  CAST(is_nullable      ASBOOLEAN)                                        AS "allowNull",
  CASE WHEN udt_name IN ('hstore', 'citext')
    THEN udt_name
    ELSE LOWER(data_type) END                                             AS "type",
  t.typcategory                                                           AS "typeCategory", -- See http://www.postgresql.org/docs/current/static/catalog-pg-type.html
  CASE WHEN LOWER(data_type) = 'array'
    THEN information_schema._pg_char_max_length(arraytype.oid, a.atttypmod)
    ELSE character_maximum_length END                                     AS "length",
  CASE WHEN LOWER(data_type) = 'array' THEN COALESCE(
    information_schema._pg_datetime_precision(arraytype.oid, a.atttypmod),
    information_schema._pg_numeric_precision(arraytype.oid, a.atttypmod))
  WHEN datetime_precision IS NULL
    THEN numeric_precision
    ELSE datetime_precision END                                           AS "precision",
  CASE WHEN LOWER(data_type) = 'array'
    THEN information_schema._pg_numeric_scale(arraytype.oid, a.atttypmod)
    ELSE numeric_scale END                                                AS "scale",
  CASE WHEN LEFT(attribute_udt_name, 1) = '_'
    THEN LEFT(format_type(a.atttypid, NULL), -2)
    ELSE NULL END                                                         AS "arrayType",
  a.attndims                                                              AS "arrayDimension",
  CASE WHEN t.typcategory IN ('E', 'C')
    THEN format_type(a.atttypid, NULL)
    ELSE NULL END                                                         AS "userDefinedType",
  attribute_udt_catalog                                                   AS "attributeUdtCatalog",
  attribute_udt_schema                                                    AS "attributeUdtSchema",
  CASE WHEN LEFT(attribute_udt_name, 1) = '_'
    THEN LEFT(format_type(a.atttypid, NULL), -2)
    ELSE attribute_udt_name END                                           AS "attributeUdtName", -- User Defined Types such       AScomposite, enumerated etc.

  ordinal_position                                                        AS "position",
  pg_catalog.col_description(c.oid, attributes.ordinal_position :: INT)   AS "comment"
FROM information_schema.attributes
  INNER JOIN pg_catalog.pg_attribute a ON a.attname = attribute_name
  INNER JOIN pg_catalog.pg_class c ON c.oid = a.attrelid AND c.relname = udt_name
  LEFT JOIN pg_catalog.pg_type arraytype ON arraytype.typname = RIGHT(udt_name, -1)
  INNER JOIN pg_type t ON a.atttypid = t.oid
WHERE udt_schema = ANY($1)
-- WHERE udt_schema = 'public'
ORDER BY udt_schema, udt_name, ordinal_position
