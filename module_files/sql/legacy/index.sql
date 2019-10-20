SELECT
	current_database()                                                          AS "catalog",
	ns.nspname                                                                  AS "schema",
	CONCAT(ns.nspname, '.', i.relname) 				                            AS "fullName",
	CONCAT(current_database(), '.', ns.nspname, '.', i.relname) 				AS "fullCatalogName",
	CONCAT(current_database(), '.', ns.nspname, '.', t.relname) 				AS "tableFullCatalogName",
	current_database() 															AS "tableCatalog",
    ns.nspname 																	AS "tableSchema",
	t.relname 																	AS "tableName",
    i.relname 																	AS "name",
	ix.indisunique 																AS "isUnique",
	ix.indisprimary																AS "isPrimaryKey"

FROM pg_index ix
INNER JOIN pg_class t ON (t.oid = ix.indrelid AND t.relkind = 'r')	-- Tables only from pg_class, r: ordinary table
INNER JOIN pg_class i ON (i.oid = ix.indexrelid AND i.relkind = 'i')	-- Indexes only from pg_class, i: indexes
INNER JOIN pg_namespace ns ON (ns.oid = t.relnamespace)

WHERE
   ns.nspname = ANY ($1)

ORDER BY
    t.relname,
    i.relname;