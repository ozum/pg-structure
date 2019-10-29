SELECT
    nspname                              AS name,
    obj_description(oid, 'pg_namespace') AS comment
FROM
    pg_namespace
WHERE
    nspname = ANY ($1)
ORDER BY
    nspname
