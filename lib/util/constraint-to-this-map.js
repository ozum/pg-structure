'use strict';

let CMap = require('./cmap');

class ConstraintToThisMap extends CMap {

    afterSet(key, oldValue, newValue) {
        deleteFromReferencingTable(oldValue);
        addToReferencingTable(newValue);
    }

    afterDelete(key) {
        deleteFromReferencingTable(this.get(key));
    }

    afterClear() {
        for (let constraint of this.values()) {
            deleteFromReferencingTable(constraint);
        }
    }
}

function deleteFromReferencingTable(constraint) {
    if (constraint && constraint.table && constraint.table.constraints.has(constraint.name)) {
        constraint.table.constraints.delete(constraint.name);
    }
}

function addToReferencingTable(constraint) {
    if (constraint && constraint.table && !constraint.table.constraints.has(constraint.name)) {
        constraint.table.constraints.set(constraint.name, constraint);
    }
}

module.exports = ConstraintToThisMap;
