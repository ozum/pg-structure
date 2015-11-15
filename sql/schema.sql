SELECT
    catalog_name                            AS "parent",
    catalog_name                            AS "catalog",
    schema_name                             AS "name",
    schema_name                             AS "fullName",
    CONCAT(catalog_name, '.', schema_name)  AS "fullCatalogName"
FROM
    information_schema.schemata
WHERE
    schema_name = ANY ($1)
ORDER BY
    catalog_name, schema_name