'use strict';

class ASet extends Set {
    get array() {
        return Array.from(this.values());
    }
}

module.exports = ASet;
