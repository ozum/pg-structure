SELECT ns.nspname           AS "schema",
       t.relname            AS "tableName",
       i.relname            AS "name",
       ix.indisprimary      AS "primary",
       ix.indisunique       AS "unique",
       ix.indkey            AS "indkey",
       Array_agg(a.attnum)  AS "columnIndexes",
       Array_agg(a.attname) AS "columnNames"
FROM   pg_class t,
       pg_class i,
       pg_index ix,
       pg_attribute a,
       pg_namespace AS ns
WHERE  t.oid = ix.indrelid
       AND i.oid = ix.indexrelid
       AND a.attrelid = t.oid
       AND a.attnum = ANY ( ix.indkey )
       AND t.relkind = 'r'
       AND ns.oid = i.relnamespace
       AND ns.nspname = ANY ($1)
GROUP  BY ns.nspname,
          t.relname,
          i.relname,
          ix.indexrelid,
          ix.indisprimary,
          ix.indisunique,
          ix.indkey
ORDER  BY ns.nspname,
          t.relname