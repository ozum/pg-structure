WITH fk_constraint AS (
SELECT
    tc."constraint_catalog" AS parent_constraint_catalog,
    tc."constraint_schema" AS parent_constraint_schema,
	tc."constraint_name" AS parent_constraint,
	CONCAT(tc."constraint_schema", '.', tc."constraint_name") AS parent_constraint_full_name,
	CONCAT(tc."constraint_catalog", '.', tc."constraint_schema", '.', tc."constraint_name") AS parent_constraint_full_catalog_name,
	tc."table_catalog" AS parent_catalog,
	tc.table_schema AS parent_schema,
	tc."table_name" AS parent_table,
	CONCAT(tc.table_schema, '.', tc."table_name") AS parent_table_full_name,
	CONCAT(tc.table_catalog, '.', tc.table_schema, '.', tc."table_name") AS parent_table_full_catalog_name,
	tc.constraint_type AS parent_constraint_type,
	tc.is_deferrable AS parent_is_deferrable,
	tc.initially_deferred AS parent_initially_deferred,
	ftc."constraint_catalog" AS child_constraint_catalog,
	ftc."constraint_schema" AS child_constraint_schema,
	ftc."constraint_name" AS child_constraint,
	CONCAT(ftc."constraint_schema", '.', ftc."constraint_name") AS child_constraint_full_name,
	CONCAT(ftc."constraint_catalog", '.', ftc."constraint_schema", '.', ftc."constraint_name") AS child_constraint_full_catalog_name,
	rc.match_option AS child_constraint_match_option,
	rc.update_rule AS child_constraint_update_rule,
	rc.delete_rule AS child_constraint_delete_rule,
	ftc.table_catalog AS child_catalog,
	ftc.table_schema AS child_schema,
	ftc."table_name" AS child_table,
	CONCAT(ftc.table_schema, '.', ftc."table_name") AS child_table_full_name,
	CONCAT(ftc.table_catalog, '.', ftc.table_schema, '.', ftc."table_name") AS child_table_full_catalog_name,
	ftc.constraint_type AS child_constraint_type,
	ftc.is_deferrable AS child_is_deferrable,
	ftc.initially_deferred AS child_initially_deferred
FROM
    information_schema.referential_constraints rc
    INNER JOIN information_schema.table_constraints ftc ON ftc."constraint_schema" = rc."constraint_schema" AND ftc."constraint_name" = rc."constraint_name" AND ftc."constraint_catalog" = rc."constraint_catalog"
    INNER JOIN information_schema.table_constraints tc ON rc.unique_constraint_name = tc."constraint_name"
ORDER BY child_table ASC, parent_table ASC
)

SELECT
l."child_constraint_full_catalog_name" 	AS "fullCatalogName",   -- leftJoinConstraintFullCatalogName is unique

l."parent_constraint_catalog"	        AS "leftConstraintCatalog",
l."parent_constraint_schema"	        AS "leftConstraintSchema",
l."parent_constraint"			        AS "leftConstraint",
l."parent_constraint_full_name"	        AS "leftConstraintFullName",
l."parent_constraint_full_catalog_name"	AS "leftConstraintFullCatalogName",
l."parent_constraint_type"		        AS "leftConstraintType",
l."parent_is_deferrable"		        AS "leftIsDeferrable",
l."parent_initially_deferred"	        AS "leftInitiallyDeferred",
l."parent_catalog"	 			        AS "leftCatalog",
l."parent_schema"	 			        AS "leftSchema",
l."parent_table"	 			        AS "leftTable",
l."parent_table_full_name"	 	        AS "leftTableFullName",
l."parent_table_full_catalog_name"	 	AS "leftTableFullCatalogName",

l."child_constraint_catalog"	        AS "leftJoinConstraintCatalog",
l."child_constraint_schema"		        AS "leftJoinConstraintSchema",
l."child_constraint" 			        AS "leftJoinConstraint",
l."child_constraint_full_name" 	        AS "leftJoinConstraintFullName",
l."child_constraint_full_catalog_name" 	AS "leftJoinConstraintFullCatalogName",
l."child_constraint_type"		        AS "leftJoinConstraintType",
l."child_constraint_match_option"       AS "leftJoinConstraintMatchOption",
l."child_constraint_update_rule"        AS "leftJoinConstraintOnUpdate",
l."child_constraint_delete_rule"        AS "leftJoinConstraintOnDelete",
l."child_is_deferrable"			        AS "leftJoinIsDeferrable",
l."child_initially_deferred"	        AS "leftJoinInitiallyDeferred",

l."child_catalog"				        AS "joinCatalog",
l."child_schema"				        AS "joinSchema",
l."child_table"					        AS "joinTable",
l."child_table_full_name"		        AS "joinTableFullName",
l."child_table_full_catalog_name"		AS "joinTableFullCatalogName",

r."child_constraint_catalog"		    AS "rightJoinConstraintCatalog",
r."child_constraint_schema" 		    AS "rightJoinConstraintSchema",
r."child_constraint" 			        AS "rightJoinConstraint",
r."child_constraint_full_name"	        AS "rightJoinConstraintFullName",
r."child_constraint_full_catalog_name"	AS "rightJoinConstraintFullCatalogName",
r."child_constraint_type"		        AS "rightJoinConstraintType",
r."child_constraint_match_option"       AS "rightJoinConstraintMatchOption",
r."child_constraint_update_rule"        AS "rightJoinConstraintOnUpdate",
r."child_constraint_delete_rule"        AS "rightJoinConstraintOnDelete",
r."child_is_deferrable"			        AS "rightJoinIsDeferrable",
r."child_initially_deferred"	        AS "rightJoinInitiallyDeferred",

r."parent_constraint_catalog"	        AS "rightConstraintCatalog",
r."parent_constraint_schema"	        AS "rightConstraintSchema",
r."parent_constraint"			        AS "rightConstraint",
r."parent_constraint_full_name"	        AS "rightConstraintFullName",
r."parent_constraint_full_catalog_name"	AS "rightConstraintFullCatalogName",
r."parent_constraint_type"		        AS "rightConstraintType",
r."parent_is_deferrable"		        AS "rightIsDeferrable",
r."parent_initially_deferred"	        AS "rightInitiallyDeferred",
r."parent_catalog"	 			        AS "rightCatalog",
r."parent_schema"	 			        AS "rightSchema",
r."parent_table"	 			        AS "rightTable",
r."parent_table_full_name"	 	        AS "rightTableFullName",
r."parent_table_full_catalog_name"	 	AS "rightTableFullCatalogName"

FROM fk_constraint l

LEFT JOIN fk_constraint r ON l."child_schema" = r."child_schema" AND l."child_table" = r."child_table"
	AND NOT (l."child_constraint_schema" = r."child_constraint_schema" AND l."child_constraint" = r."child_constraint")

WHERE
	l."parent_schema" = ANY($1)
	AND l."child_schema" = ANY($1)
	AND (r."parent_schema" = ANY($1) OR r."parent_schema" IS NULL)