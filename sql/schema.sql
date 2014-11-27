SELECT
    schema_name AS "schemaName"
FROM
    information_schema.schemata
WHERE
    schema_name = ANY ($1);