SELECT
    catalog_name AS "name",
    catalog_name AS "fullName",
    catalog_name AS "fullCatalogName"
FROM
    information_schema.information_schema_catalog_name
ORDER BY
    catalog_name