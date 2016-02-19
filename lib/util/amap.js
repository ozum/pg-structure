'use strict';

class AMap extends Map {
    get array() {
        return Array.from(this.values());
    }
}

module.exports = AMap;

