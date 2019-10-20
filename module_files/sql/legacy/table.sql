SELECT
    CONCAT(table_catalog, '.', table_schema)                    AS "parent",
    table_catalog                                               AS "catalog",
    table_schema                                                AS "schema",
    table_name                                                  AS "name",
    CONCAT(table_schema, '.', table_name)                       AS "fullName",
    CONCAT(table_catalog, '.', table_schema, '.', table_name)   AS "fullCatalogName",
    pg_catalog.obj_description(c.oid, 'pg_class')               AS "description"

FROM
    information_schema.tables
INNER JOIN
    pg_catalog.pg_class c ON c.relname = table_name
WHERE
    table_schema = ANY ($1)
ORDER BY
    table_catalog, table_schema, table_name