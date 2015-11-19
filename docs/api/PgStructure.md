<a name="module_pgStructrue"></a>
## pgStructrue
<a name="module_pgStructrue..getDB"></a>
### pgStructrue~getDB(pgOptions, [schemas]) ⇒ <code>Promise.&lt;T&gt;</code>
**Kind**: inner method of <code>[pgStructrue](#module_pgStructrue)</code>  
**Returns**: <code>Promise.&lt;T&gt;</code> - - Promise with signature ([DB](DB)).  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| pgOptions | <code>Object</code> &#124; <code>pg.client</code> |  | Pg client or Connection parameters to connect to database. |
| pgOptions.database | <code>string</code> |  | Database name |
| [pgOptions.host] | <code>string</code> | <code>&quot;localhost&quot;</code> | Hostname of the database. |
| [pgOptions.port] | <code>number</code> | <code>5432</code> | Port of the database. |
| [pgOptions.user] | <code>string</code> |  | Username for connecting to db. |
| [pgOptions.password] | <code>string</code> |  | Password to connecting to db. |
| [schemas] | <code>Array.&lt;string&gt;</code> | <code>[public]</code> | PostgreSQL schemas to be parsed. |

