<a name="Map"></a>
## Map
The Map object is a simple key/value map. Any value (both objects and primitive values) may be used as either a key
or a value.

**Kind**: global class  
**See**: [Mozilla Map Documentation](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Map)  

* [Map](#Map)
    * [.size](#Map+size) : <code>number</code>
    * [.entries()](#Map+entries) ⇒ <code>Iterator</code>
    * [.forEach(callbackFn, this)](#Map+forEach)
    * [.get(name)](#Map+get) ⇒ <code>\*</code>
    * [.has(name)](#Map+has) ⇒ <code>boolean</code>
    * [.keys()](#Map+keys) ⇒ <code>Iterator</code>
    * [.values()](#Map+values) ⇒ <code>Iterator</code>

<a name="Map+size"></a>
### map.size : <code>number</code>
The number of key/value pairs in the Map object.

**Kind**: instance property of <code>[Map](#Map)</code>  
**Example**  
```js
let size = db.get('public.account').columns.size;
```
<a name="Map+entries"></a>
### map.entries() ⇒ <code>Iterator</code>
Returns a new Iterator object that contains an array of [key, value] for each element in the Map object in insertion order.

**Kind**: instance method of <code>[Map](#Map)</code>  
**Example**  
```js
let column = db.get('public.account').columns.get('name');
```
<a name="Map+forEach"></a>
### map.forEach(callbackFn, this)
Calls callbackFn once for each key-value pair present in the Map object, in insertion order.
If a thisArg parameter is provided to forEach, it will be used as the this value for each callback.

**Kind**: instance method of <code>[Map](#Map)</code>  

| Param | Type | Description |
| --- | --- | --- |
| callbackFn | <code>function</code> | Function to call for each pair. |
| this | <code>Object</code> | Context. |

<a name="Map+get"></a>
### map.get(name) ⇒ <code>\*</code>
Returns the value associated to the key, or undefined if there is none.

**Kind**: instance method of <code>[Map](#Map)</code>  
**Returns**: <code>\*</code> - - Value associated to key.  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Name of the item to get. |

**Example**  
```js
let column = db.get('public.account').columns.get('name');
```
<a name="Map+has"></a>
### map.has(name) ⇒ <code>boolean</code>
Returns a boolean asserting whether a value has been associated to the key in the Map object or not.

**Kind**: instance method of <code>[Map](#Map)</code>  
**Returns**: <code>boolean</code> - - `true` if key exists.  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Name of the item to test. |

**Example**  
```js
let exists = db.schemas.has('public'); // true
```
<a name="Map+keys"></a>
### map.keys() ⇒ <code>Iterator</code>
Returns a new Iterator object that contains the keys for each element in the Map object in insertion order.

**Kind**: instance method of <code>[Map](#Map)</code>  
**Example**  
```js
for (let tableName of db.schemas.get('public').tables.keys()) {
    console.log(tableName);
}

let tableNames = [...db.schemas.get('public').tables.keys()]; // Table names as an array.
```
<a name="Map+values"></a>
### map.values() ⇒ <code>Iterator</code>
Returns a new Iterator object that contains the values for each element in the Map object in insertion order.

**Kind**: instance method of <code>[Map](#Map)</code>  
**Example**  
```js
for (let table of db.schemas.get('public').tables.values()) {
    console.log(table.name);
}

let tables = [...db.schemas.get('public').tables.values()]; // Table objects as an array.
```
