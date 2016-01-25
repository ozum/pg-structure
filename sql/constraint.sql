-- Primary Key, Unique Constraint details

SELECT
    tc.constraint_schema                        AS "constraintSchema",
    tc.constraint_name                          AS "constraintName",
    tc.constraint_type                          AS "constraintType",
    kcu.column_name                             AS "columnName",
    tc.table_schema                             AS "tableSchema",
    tc.table_name                               AS "tableName",
    kcu.ordinal_position                        AS "position",
    kcu.position_in_unique_constraint           AS "uniqueConstraintPosition",
    tc.is_deferrable                            AS "isDeferrable",
    tc.initially_deferred                       AS "initiallyDeferred",
	rc.match_option                             AS "matchOption",
	rc.update_rule                              AS "updateRule",
	rc.delete_rule                              AS "deleteRule",

    -- REFERENCED COLUMN DETAILS
    kcu2.table_schema                           AS "referencedTableSchema",
    kcu2.table_name                             AS "referencedTableName",
    kcu2.column_name                            AS "referencedColumnName"


FROM information_schema.table_constraints tc
  LEFT JOIN information_schema.key_column_usage kcu
    ON tc.constraint_catalog = kcu.constraint_catalog
       AND tc.constraint_schema = kcu.constraint_schema
       AND tc.constraint_name = kcu.constraint_name
  LEFT JOIN information_schema.referential_constraints rc
    ON kcu.constraint_name = rc.constraint_name
       AND kcu.constraint_catalog = rc.constraint_catalog
       AND kcu.constraint_schema = rc.constraint_schema
  LEFT JOIN information_schema.key_column_usage kcu2
    ON kcu2.ordinal_position = kcu.position_in_unique_constraint
       AND kcu2.constraint_name = rc.unique_constraint_name
       AND kcu.constraint_catalog = rc.constraint_catalog
       AND kcu.constraint_schema = rc.constraint_schema

WHERE tc.constraint_schema = ANY($1)
	  AND (kcu.table_schema = ANY($1) OR kcu.table_schema IS NULL)
      AND (kcu2.table_schema = ANY($1) OR kcu2.table_schema IS NULL)    -- IF NO REFERNCED COLUMN EXISTS. ie. Unique Index etc.

ORDER BY
    tc.table_schema,
    tc.table_name,
    tc.constraint_name,
    kcu.ordinal_position,
    kcu.position_in_unique_constraint;
