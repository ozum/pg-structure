'use strict';

let CMap = require('./cmap');

class ConstraintMap extends CMap {

    afterSet(key, oldValue, newValue) {
        deleteFromReferencedTable(oldValue);
        addToReferencedTable(newValue);
    }

    afterDelete(key) {
        deleteFromReferencedTable(this.get(key));
    }

    afterClear() {
        for (let constraint of this.values()) {
            deleteFromReferencedTable(constraint);
        }
    }
}

function deleteFromReferencedTable(constraint) {
    if (constraint && constraint.referencedTable && constraint.referencedTable.foreignKeyConstraintsToThis.has(constraint.name)) {
        constraint.referencedTable.foreignKeyConstraintsToThis.delete(constraint.name);
    }
}

function addToReferencedTable(constraint) {
    if (constraint && constraint.referencedTable && !constraint.referencedTable.foreignKeyConstraintsToThis.has(constraint.name)) {
        constraint.referencedTable.foreignKeyConstraintsToThis.set(constraint.name, constraint);
    }
}

module.exports = ConstraintMap;
