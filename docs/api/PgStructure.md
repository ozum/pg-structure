<a name="module_pgStructure"></a>
## pgStructure
<a name="module_pgStructure..getDB"></a>
### pgStructure~getDB(pgOptions, [schemas]) ⇒ <code>Promise.&lt;T&gt;</code>
**Kind**: inner method of <code>[pgStructure](#module_pgStructure)</code>  
**Returns**: <code>Promise.&lt;T&gt;</code> - - Promise with signature ([DB](DB)).  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| pgOptions | <code>Object</code> &#124; <code>pg.client</code> |  | node-postgres client or connection parameters. Parameters passed directly to node-postgres. See it for details. |
| pgOptions.database | <code>string</code> |  | Database name |
| [pgOptions.host] | <code>string</code> | <code>&quot;localhost&quot;</code> | Hostname of the database. |
| [pgOptions.port] | <code>number</code> | <code>5432</code> | Port of the database. |
| [pgOptions.user] | <code>string</code> |  | Username for connecting to db. |
| [pgOptions.password] | <code>string</code> |  | Password to connecting to db. |
| [pgOptions.ssl] | <code>boolean</code> &#124; <code>Object</code> | <code>false</code> | Pass the same options as tls.connect(). |
| [schemas] | <code>Array.&lt;string&gt;</code> | <code>[public]</code> | PostgreSQL schemas to be parsed. |

