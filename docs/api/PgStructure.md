<a name="module_pgStructure"></a>
## pgStructure

* [pgStructure](#module_pgStructure)
    * [module.exports(pgOptions, [schemas], options)](#exp_module_pgStructure--module.exports) ⇒ <code>Promise.&lt;DB&gt;</code> ⏏
        * _static_
            * [.save(file, db)](#module_pgStructure--module.exports.save) ⇒ <code>Promise.&lt;string&gt;</code>
            * [.load(file)](#module_pgStructure--module.exports.load) ⇒ <code>Promise.&lt;(DB\|undefined)&gt;</code>
            * [.serialize(db)](#module_pgStructure--module.exports.serialize) ⇒ <code>string</code>
            * [.toString(db)](#module_pgStructure--module.exports.toString) ⇒ <code>string</code>
            * [.deserialize(serializedDBJSON)](#module_pgStructure--module.exports.deserialize) ⇒ <code>DB</code> &#124; <code>undefined</code>
            * [.parse(serializedDB)](#module_pgStructure--module.exports.parse) ⇒ <code>DB</code> &#124; <code>undefined</code>
        * _inner_
            * [~pgOptions](#module_pgStructure--module.exports..pgOptions) : <code>Object</code>

<a name="exp_module_pgStructure--module.exports"></a>
### module.exports(pgOptions, [schemas], options) ⇒ <code>Promise.&lt;DB&gt;</code> ⏏
Creates and returns [DB](DB) instance by reverse engineering PostgreSQL database.

**Kind**: Exported function  
**Returns**: <code>Promise.&lt;DB&gt;</code> - - [DB](DB).  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| pgOptions | <code>pgOptions</code> &#124; <code>pg#client</code> |  | node-postgres client or connection parameters. Parameters passed directly to node-postgres. See it for details. |
| [schemas] | <code>string</code> &#124; <code>Array.&lt;string&gt;</code> | <code>&quot;[&#x27;public&#x27;]&quot;</code> | PostgreSQL schemas to be parsed. |
| options | <code>Object</code> |  | pg-structure options. |
| [options.cache] | <code>boolean</code> | <code>true</code> | Use cache to memoize calculated results. |

**Example**  
```js
var pgStructure = require('pg-structure');

pgStructure({database: 'db', user: 'user', password: 'password'}, ['public', 'other_schema'])
    .then((db) => { console.log( db.get('public.account').columns[0].name ); })
    .catch(err => console.log(err.stack));
```
<a name="module_pgStructure--module.exports.save"></a>
#### module.exports.save(file, db) ⇒ <code>Promise.&lt;string&gt;</code>
Saves given database structure to a disk file. If given file name ends with `.zip` extension, file will be saved as
compressed zip file.

**Kind**: static method of <code>[module.exports](#exp_module_pgStructure--module.exports)</code>  
**Returns**: <code>Promise.&lt;string&gt;</code> - - Serialized string.  

| Param | Type | Description |
| --- | --- | --- |
| file | <code>string</code> &#124; <code>undefined</code> | File path to save database structure. |
| db | <code>DB</code> | [DB](DB) object to save. |

**Example**  
```js
var pgStructure = require('pg-structure');

pgStructure({database: 'db', user: 'user', password: 'password', host: 'localhost', port: 5432}, ['public', 'other_schema'])
    .then(db => pgStructure.save('./db.json', db))
    .catch(err => console.log(err.stack));
```
<a name="module_pgStructure--module.exports.load"></a>
#### module.exports.load(file) ⇒ <code>Promise.&lt;(DB\|undefined)&gt;</code>
Loads database structure from previously saved file. Much faster than getting structure from database.
If file is a zip file which contains a json file with same name as zip file, this function decompresses the file
automatically.<br/>
<img src="../../images/warning-24.png" style="margin-left: -26px;"> pgStructure cannot
load files saved by incompatible pg-structure module versions and returns `undefined`. In this case you should
fetch structure from database and create a new save file.

**Kind**: static method of <code>[module.exports](#exp_module_pgStructure--module.exports)</code>  
**Returns**: <code>Promise.&lt;(DB\|undefined)&gt;</code> - - [DB](DB) instance or `undefined` if saved file is generated with incompatible module version.  

| Param | Type | Description |
| --- | --- | --- |
| file | <code>string</code> | File path to load db structure from. |

**Example**  
```js
var pgStructure = require('pg-structure');

pgStructure.load('./db.json')
    .then(db => console.log(db.schemas[0].name))
    .catch(err => console.log(err.stack));
```
<a name="module_pgStructure--module.exports.serialize"></a>
#### module.exports.serialize(db) ⇒ <code>string</code>
Serializes database structure to make it possible to store or transfer.

**Kind**: static method of <code>[module.exports](#exp_module_pgStructure--module.exports)</code>  
**Returns**: <code>string</code> - - Serialized database structure.  

| Param | Type | Description |
| --- | --- | --- |
| db | <code>DB</code> | [DB](DB) instance to serialize. |

**Example**  
```js
pgStructure({database: 'db', user: 'user', password: 'password', host: 'localhost', port: 5432}, ['public', 'other_schema'])
    .then(db => pgStructure.serialize(db))
    .then(data => console.log(data))
    .catch(err => console.log(err.stack));
```
<a name="module_pgStructure--module.exports.toString"></a>
#### module.exports.toString(db) ⇒ <code>string</code>
Alias of {@link module:pgStructure.serialize). Serializes database structure to make it possible to store or transfer.

**Kind**: static method of <code>[module.exports](#exp_module_pgStructure--module.exports)</code>  
**Returns**: <code>string</code> - - Serialized database structure.  
**See**: {@link module:pgStructure.serialize)  

| Param | Type | Description |
| --- | --- | --- |
| db | <code>DB</code> | [DB](DB) instance to serialize. |

<a name="module_pgStructure--module.exports.deserialize"></a>
#### module.exports.deserialize(serializedDBJSON) ⇒ <code>DB</code> &#124; <code>undefined</code>
Creates and returns [DB](DB) instance using previously serialized string. <br/>
<img src="../../images/warning-24.png" style="margin-left: -26px;"> pgStructure cannot
deserialize incompatible pg-structure module versions and returns `undefined`. In this case you should fetch structure from database.

**Kind**: static method of <code>[module.exports](#exp_module_pgStructure--module.exports)</code>  
**Returns**: <code>DB</code> &#124; <code>undefined</code> - - [DB](DB) instance. If serialized string is from incompatible module version, this is `undefined`
var pgStructure = require('pg-structure');

pgStructure.deserialize('./db.json')
    .then(db => console.log(db.schemas[0].name)
    .catch(err => console.log(err.stack));  

| Param | Type | Description |
| --- | --- | --- |
| serializedDBJSON | <code>string</code> | Serialized database structure to create [DB](DB) instance from. |

<a name="module_pgStructure--module.exports.parse"></a>
#### module.exports.parse(serializedDB) ⇒ <code>DB</code> &#124; <code>undefined</code>
Alias of [deserialize](#module_pgStructure--module.exports.deserialize). Creates and returns [DB](DB) instance using previously serialized string. <br/>
<img src="../../images/warning-24.png" style="margin-left: -26px;"> pgStructure cannot
deserialize incompatible pg-structure module versions and returns `undefined`. In this case you should fetch structure from database.

**Kind**: static method of <code>[module.exports](#exp_module_pgStructure--module.exports)</code>  
**Returns**: <code>DB</code> &#124; <code>undefined</code> - - [DB](DB) instance. If serialized string is from incompatible module version, this is `undefined`  
**See**: [deserialize](#module_pgStructure--module.exports.deserialize)  

| Param | Type | Description |
| --- | --- | --- |
| serializedDB | <code>string</code> | Serialized database structure to create [DB](DB) instance from. |

<a name="module_pgStructure--module.exports..pgOptions"></a>
#### module.exports~pgOptions : <code>Object</code>
PostgreSQL connection options which are passed directly to node-postgres.

**Kind**: inner typedef of <code>[module.exports](#exp_module_pgStructure--module.exports)</code>  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| database | <code>string</code> |  | Database name |
| host | <code>string</code> | <code>&quot;localhost&quot;</code> | Hostname of the database. |
| port | <code>number</code> | <code>5432</code> | Port of the database. |
| user | <code>string</code> |  | Username for connecting to db. |
| password | <code>string</code> |  | Password to connecting to db. |
| ssl | <code>boolean</code> &#124; <code>Object</code> | <code>false</code> | Pass the same options as tls.connect(). |

