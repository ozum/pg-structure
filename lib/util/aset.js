'use strict';

class ASet extends Set {
    get array() {
        return [...this.values()];
    }
}

module.exports = ASet;
