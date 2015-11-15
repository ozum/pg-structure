'use strict';

var internal    = require('./util/internal');

/**
 * Base class for relations. Not used directly. See child classes.
 * @see {@link O2MRelation} for one to many relationships.
 * @see {@link M2MRelation} for many to many relationships.
 * @see {@link M2ORelation} for many to one relationships.
 */
class Relation {
    /**
     * @param {Object}          args                - Referential constraint arguments.
     * @param {Loki}            args.registry       - Loki.js database object.
     * @param {Object}          args.attributes     - Attributes of the {@link Relation} instance.
     * @returns {Relation}                         - Relation object.
     */
    constructor(args) {
        if (!args) throw new Error('Arguments are required.');
        internal.set(this, {
            registry: args.registry,
            attributes: args.attributes
        });
    }
}

module.exports = Relation;
