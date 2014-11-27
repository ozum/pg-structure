SELECT
    table_schema                        AS "schemaName",
    table_name                          AS "tableName",
    pg_catalog.obj_description(c.oid)   AS "tableDescription"
FROM information_schema.tables
INNER JOIN pg_catalog.pg_class c ON c.relname = table_name
WHERE table_schema = ANY ($1);