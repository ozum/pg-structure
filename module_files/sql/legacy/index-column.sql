SELECT
	CONCAT(current_database(), '.', ns.nspname, '.', t.relname, '.', a.attname) AS "columnFullCatalogName",
	CONCAT(current_database(), '.', ns.nspname, '.', i.relname) 				AS "indexFullCatalogName",
    CONCAT(current_database(), '.', ns.nspname, '.', t.relname) 				AS "tableFullCatalogName",
	current_database() 															AS "tableCatalog",
    ns.nspname 																	AS "tableSchema",
	t.relname 																	AS "tableName",
	a.attname 																	AS "columnName",
    i.relname 																	AS "indexName",
	ix.indisunique 																AS "isUnique",
	ix.indisprimary																AS "isPrimaryKey",
	(SELECT MIN(CASE WHEN ix.indkey[i] = a.attnum THEN i ELSE NULL END)::int
	    FROM generate_series(ARRAY_LOWER(ix.indkey, 1), ARRAY_UPPER(ix.indkey, 1)) i) AS "position"

FROM pg_index ix
INNER JOIN pg_class t ON (t.oid = ix.indrelid AND t.relkind = 'r')	-- Tables only from pg_class, r: ordinary table
INNER JOIN pg_class i ON (i.oid = ix.indexrelid AND i.relkind = 'i')	-- Indexes only from pg_class, i: indexes
INNER JOIN pg_attribute a ON (a.attrelid = t.oid AND a.attnum = ANY(ix.indkey))
INNER JOIN pg_namespace ns ON (ns.oid = t.relnamespace)

WHERE
   ns.nspname = ANY ($1)

ORDER BY
    t.relname,
    i.relname;