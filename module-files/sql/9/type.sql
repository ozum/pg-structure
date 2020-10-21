/*
 Query to get custom user defined types (base such as hstore, composite, domain and enum).
 Created by using `psql -d database -U user -E`, combined `\dT+` and `\dD+`.

 See:
 https://www.postgresql.org/docs/current/app-psql.html
 https://www.postgresql.org/docs/current/catalog-pg-type.html

 Modificaitions on top of `dT+`. (Taken from `dD+`)
 SELECT
 - Add: t.oid, t.typrelid, t.typnamespace, t.typtype, t.typndims, t.typnotnull, t.typdefault, pg_catalog.format_type(t.typbasetype, t.typtypmod) as "sql_type",
 - Modify:  Remove pg_catalog.array_to_string() around enum values to return it as an array.
 WHERE
 - Remove: n.nspname <> 'pg_catalog' AND n.nspname <> 'information_schema
 - Remove to see types in other schemas: pg_catalog.pg_type_is_visible(t.oid)
 */
WITH types AS (
  SELECT
    t.oid,
    t.typarray,
    t.typrelid,
    t.typnamespace,
    t.typtype,
    t.typcategory,
    t.typndims,
    t.typnotnull,
    t.typdefault,
    pg_catalog.format_type(t.typbasetype, t.typtypmod) AS "sql_type",
    pg_catalog.format_type(t.oid, NULL) AS "Name",
    t.typname AS "Internal name",
    CASE WHEN t.typrelid != 0 THEN
      CAST('tuple' AS pg_catalog.text)
    WHEN t.typlen < 0 THEN
      CAST('var' AS pg_catalog.text)
    ELSE
      CAST(t.typlen AS pg_catalog.text)
    END AS "Size",
    ARRAY (
      SELECT
        e.enumlabel
      FROM
        pg_catalog.pg_enum e
      WHERE
        e.enumtypid = t.oid
      ORDER BY
        e.enumsortorder) AS "Elements",
      pg_catalog.pg_get_userbyid(t.typowner) AS "Owner",
      pg_catalog.array_to_string(t.typacl, E'\n') AS "Access privileges",
      pg_catalog.obj_description(t.oid, 'pg_type') AS "Description",
      (
        SELECT
          c.relkind
        FROM
          pg_catalog.pg_class c
        WHERE
          c.oid = t.typrelid) AS "Relation Kind"
    FROM
      pg_catalog.pg_type t
    WHERE (t.typrelid = 0
      OR (
        SELECT
          c.relkind IN ('c', 'r', 'v', 'm', 'p') -- https://www.postgresql.org/docs/current/catalog-pg-class.html
        FROM
          pg_catalog.pg_class c
        WHERE
          c.oid = t.typrelid))
      AND NOT EXISTS (
        SELECT
          1
        FROM
          pg_catalog.pg_type el
        WHERE
          el.oid = t.typelem
          AND el.typarray = t.oid)
      ORDER BY
        1,
        2
)
  SELECT
    oid,
    typarray AS "arrayOid",
    typnamespace AS "schemaOid",
    typrelid AS "classOid", -- If this is a composite type (see typtype), then this column points to the pg_class entry that defines the corresponding table
    typtype AS "kind",
    typcategory AS "category",
    typnotnull AS "notNull",
    typdefault AS "default",
    CASE WHEN sql_type = '-' THEN
      NULL
    ELSE
      sql_type
    END AS "sqlType",
    "typndims" AS "arrayDimension",
    "Internal name" AS "name",
    "Elements" AS "values",
    "Description" AS "comment",
	  "Relation Kind" AS "relationKind"
  FROM
    types
  WHERE
    typnamespace = ANY ($1)
  ORDER BY
    typnamespace,
    LOWER("Internal name")
