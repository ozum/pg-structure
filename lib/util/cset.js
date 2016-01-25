'use strict';

let _data = new WeakMap();

class CSet extends Set {
    constructor(val, opts) {
        let result = super(val);
        opts = opts || {};

        _data.set(this, { version: opts.version || 0, cacheVersion: opts.cacheVersion || -1 });
        return result;
    }

    get version() {
        return _data.get(this).version;
    }

    get cacheVersion() {
        return _data.get(this).cacheVersion;
    }
}

module.exports = CSet;

