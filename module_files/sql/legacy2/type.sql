SELECT n.nspname AS schema, -- pg_catalog.format_type (t.oid, NULL) AS name,
 t.typname AS name,
 CASE
     WHEN t.typrelid != 0 THEN CAST ('tuple' AS pg_catalog.text)
     WHEN t.typlen < 0 THEN CAST ('var' AS pg_catalog.text)
     ELSE CAST (t.typlen AS pg_catalog.text)
 END AS size,
 pg_catalog.array_to_string (ARRAY
                               (SELECT e.enumlabel
                                FROM pg_catalog.pg_enum e
                                WHERE e.enumtypid = t.oid
                                ORDER BY e.oid), E'\n') AS elements,
 pg_catalog.obj_description (t.oid, 'pg_type') AS comment
FROM pg_catalog.pg_type t
LEFT JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname = ANY($1)
  AND (t.typrelid = 0
       OR
         (SELECT c.relkind = 'c'
          FROM pg_catalog.pg_class c
          WHERE c.oid = t.typrelid ))
  AND NOT EXISTS
    (SELECT 1
     FROM pg_catalog.pg_type el
     WHERE el.oid = t.typelem
       AND el.typarray = t.oid )
  AND n.nspname <> 'pg_catalog'
  AND n.nspname <> 'information_schema'
  AND pg_catalog.pg_type_is_visible (t.oid)
ORDER BY lower(t.typname); --ORDER BY 1, 2;
