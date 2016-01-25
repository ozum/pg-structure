SELECT
    CONCAT("table_catalog", '.', "table_schema", '.', "table_name")                 AS "parent",
    CONCAT("constraint_catalog", '.', "constraint_schema", '.', "constraint_name")  AS "fullCatalogName",
    CONCAT("constraint_schema", '.', "constraint_name")                             AS "fullName",
    "constraint_catalog"                                                            AS "catalog",
    "constraint_schema"                                                             AS "schema",
    "constraint_name"                                                               AS "name",
    CONCAT("table_catalog", '.', "table_schema", '.', "table_name")                 AS "tableFullCatalogName",
    CONCAT("table_schema", '.', "table_name")                                       AS "tableFullName",
    "table_catalog"                                                                 AS "tableCatalog",
    "table_schema"                                                                  AS "tableSchema",
    "table_name"                                                                    AS "tableName",
    "constraint_type"                                                               AS "constraintType",
    "is_deferrable"                                                                 AS "isDeferrable",
    "initially_deferred"                                                            AS "initiallyDeferred"

FROM
    information_schema.table_constraints

WHERE
    "constraint_schema" = ANY($1)

ORDER BY
    "constraint_catalog",
    "constraint_schema",
    "constraint_name";