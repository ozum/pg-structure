'use strict';

class AMap extends Map {
    get array() {
        return [...this.values()];
    }
}

module.exports = AMap;

