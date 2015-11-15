'use strict';

var M2MRelation = require('./../m2m-relation');
var O2MRelation = require('./../o2m-relation');
var M2ORelation = require('./../m2o-relation');

/**
 * Creates and returns necessary relation type objects based on arguments.
 * @private
 */
class RelationFabricator {
    constructor(args) {
        args.attributes.o2mObject = new O2MRelation(args);
        args.attributes.m2oObject = new M2ORelation(args);
        if (args.attributes.rightTable) args.attributes.m2mObject = new M2MRelation(args);
    }
}

module.exports = RelationFabricator;
