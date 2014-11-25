# WeakMap Shim
This is a standalone shim for WeakMap, separated out from the full Harmony Collections shim at https://github.com/Benvie/harmony-collections. WeakMap is by far the most useful new addition. If you only need to use objects as keys then uou can use this much more compact library that doesn't have to implement three other classes.

## Compatability

Works with IE9+, Chrome, Firefox, Safari, untested in Opera.

## Install/Use

If using node, install via:

    npm install weakmap

In the browser, include __weakmap.js__ or __weakmap.min.js__ and WeakMap will be exposed on the window.

## Overview

WeakMaps provide a new core weapon to your JS arsenal: objects as keys. This allows you to do the following awesome things: store private data "on" public objects, private properties, secretly "tag" objects, namespace properties, access controlled properties, check object uniqueness in `O(1)` time complexity.

### WeakMap Garbage Collection Semantics

A benefit of using WeakMaps is enhanced garbage collection. In a WeakMap, the only reference created is key -> value, so it's possible for a key/value in a WeakMap to be garbage collected while the WeakMap they're in still exists! Compare this to an Array, where all items in the Array will not be garbage collected as long as the Array isn't. This forces either explicit management of  object lifespans or, more commonly, simply results in memory leaks.

For example, data stored using jQuery.data can never be garbage collected unless explicitly nulled out, because it is stored in a container that strongly references the items held inside. Using a WeakMap, it's possible to associate data with an element and have the data destroyed when the element is -- without memory leaking the element; i.e. `weakmap.set(element, { myData: 'gc safe!' })`. jQuery.data (every library has similar functionality) prevents the *element* from memory leaking by using a numeric id, but this does nothing for the __data__ that is stored.

## Example

```javascript
// reusable storage creator
function createStorage(){
  var store = new WeakMap;
  return function(o){
    var v = store.get(o);
    if (!v) store.set(o, v = {});
    return v;
  };
}

// allows private/namespaced properties for the objects
var _ = createStorage();

functioon Wrapper(element){
  var _element = _(element);
  if (_element.wrapper)
    return _element.wrapper;

  _element.wrapper = this;
  _(this).element = element;
}

Wrapper.prototype = {
  get classes(){
    return [].slice.call(_(this).element.classList);
  },
  set classes(v){
    _(this).element.className = [].concat(v).join(' ');
  }
};
```


## API Reference

* WeakMaps may be inherited from. Initialize objects via `WeakMap.call(obj)`.

### WeakMap

__Non-primitives__ are valid keys. Objects, functions, DOM nodes, etc.

WeakMaps require the use of objects as keys; primitives are not valid keys. WeakMaps have no way to enumerate their keys or values. Because of this, the only way to retrieve a value from a WeakMap is to have access to both the WeakMap itself as well as an object used as a key.

* `new WeakMap(iterable)` Create a new WeakMap populated with the iterable. Accepts *[[Key, Value]...]*, *Array*, *Iterable*.
* `WeakMap#set(key, value)` Key must be non-primitive. Returns undefined.
* `WeakMap#get(key)` Returns the value that key corresponds to the key or undefined.
* `WeakMap#has(key)` Returns boolean.
* `WeakMap#delete(key)` Removes the value from the collection and returns boolean indicating if there was a value to delete.


## License

(The MIT License)
Copyright (c) 2012 Brandon Benvie <http://bbenvie.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files
(the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included with all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
FOR ANY  CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH
THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
