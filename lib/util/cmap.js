'use strict';

let AMap = require('./amap');

let _data = new WeakMap();

class CMap extends AMap {
    constructor(val, opts) {
        let result = super(val);
        opts = opts || {};

        _data.set(this, { version: opts.version || 0, cacheVersion: opts.cacheVersion || -1 });
        return result;
    }

    set(key, newValue) {
        let oldValue = this.get(key);
        let result   = super.set(key, newValue);
        let _        = _data.get(this);

        if (oldValue !== newValue) {
            if (_) { _.version++; } // Reason: new Map([['s', 2]]) with inital values calls set before constructor. This is undefined yet.
            if (this.afterSet) { this.afterSet(key, oldValue, newValue); }
        }
        return result;
    }

    'delete'(key) {
        let oldValue = this.get(key);
        let result   = super.delete(key);

        if (this.has(key)) {
            _data.get(this).version++;
            if (this.afterDelete) { this.afterDelete(key, oldValue); }
        }
        return result;
    }

    clear() {
        let result  = super.clear();

        if (this.size !== 0) {
            _data.get(this).version++;
            if (this.afterClear) { this.afterClear(); }
        }
        return result;
    }

    get version() {
        let version = _data.get(this).version;
        return version === undefined ? 0 : version;
    }

    get cacheVersion() {
        let cacheVersion = _data.get(this).cacheVersion;
        return (cacheVersion === undefined) ? -1 : cacheVersion;
    }
}

module.exports = CMap;

