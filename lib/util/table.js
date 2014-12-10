/**
 * @author Özüm Eldoğan
 */
/*jslint node: true */
"use strict";

var joi             = require('joi');
var lodash          = require('lodash');
var column          = require('./column.js');
var constraint      = require('./constraint.js');
var util            = require('util');
var helper          = require('./helper.js');

/**
 * @callback columnCallback
 * @param {Column} column - Column object
 */

/**
 * @callback constraintCallback
 * @param {Constraint} constraint - Constraint object
 */

/**
 * Returns object to get/set internal properties of an object.
 * @function internal
 * @private
 * @returns {object}
 */
var internal        = helper.internal;

/**
 * Allowed table attributes and validations.
 * @private
 * @type {{name: *, schema: *, description: *}}
 */
var tableAttributes = {
    name                : joi.string().required(),
    description         : joi.string().allow(null),
    schema              : joi.object().required()
};


/**
 * @class
 * @param {Object} args - Table arguments.
 * @param {String} args.name - Name of the table.
 * @param {String} [args.description] - Description of the table.
 * @param {Schema} args.schema - {@link Schema} of the table.
 * @param {Object} [options] - Options
 * @param {boolean} [options.allowUnknown = true] - If true, unknown parameters passed to constructor does not throw error while creating object.
 */
var Table = function Table(args, options) {
    var attr, validation;
    if (!args) { throw new Error('Table arguments are required.'); }
    options = lodash.defaults(options || {}, { abortEarly: false, allowUnknown: false });
    validation = joi.validate(args, joi.object().keys(tableAttributes).required(), options);
    if (validation.error) {
        throw new Error('Error in function arguments while trying to create "' + args.name + '" table. ' + validation.error + '. Arguments: ' + util.inspect(args, { depth: null }));
    }

    attr                        = args;
    attr.columns                = [];
    attr.columnsByName          = {};
    attr.foreignKeyConstraints  = {};
    attr.hasMany                = {};
    attr.hasManyThrough         = {};
    internal(this).attributes   = attr;
};

/**
 * Retrieves name of the table.
 * @method
 * @param {string} [value] - New value
 * @returns {string}
 */
Table.prototype.name = helper.accessor('name');

/**
 * Gets full name of the object in database . notation.
 */
Table.prototype.fullName = helper.objectFullName();

/**
 * Retrieves description of the table.
 * @method
 * @param {string} [value] - New value
 * @returns {string}
 */
Table.prototype.description = helper.accessor('description');

/**
 * Retrieves {@link Schema} object of the table.
 * @method
 * @param {Schema} [value] - New value
 * @returns {Schema}
 */
Table.prototype.schema = helper.accessor('schema');

/**
 * Retrieves {@link Schema} object of the table.
 * @method
 * @param {Schema} [value] - New value
 * @returns {Schema}
 */
Table.prototype.parent = Table.prototype.schema;

/**
 * Adds column to the table and returns column created newly.
 * @method
 * @private
 * @param { Column | object } args - Column object or general object to create column object
 * @param {string} args.name - Name of the column
 * @param {string} [args.default] - Default value of the column
 * @param {boolean} args.allowNull - Is this column allowed to contain null values?
 * @param {string} args.type - Data type of the column.
 * @param {string} [args.enumValues] - Enum values of the column.
 * @param {number} [args.length] - Length of the column.
 * @param {number} [args.precision] - Precision of the column.
 * @param {number} [args.scale] - Scale of the column.
 * @param {string} [args.arrayType] - If column is array. Data type of the array.
 * @param {number} [args.arrayDimension] - array dimension of the column.
 * @param {String} [args.description] - Description of the table
 * @returns { Column }
 */
Table.prototype.addColumn = helper.addObject('columnsByName', 'columns', column, 'table');

/**
 * Given an array of {@link Column} or plain objects, this method adds them to table in given order.
 * @method
 * @private
 * @param {array.<Column|Object>} columns - See addColumn method for parameters of each element of the array.
 */
Table.prototype.addColumns = function (columns) {
    var i;
    if (joi.validate(columns, joi.array().includes(joi.object())).error) { throw new Error('addColumns expects array of plain objects or column class objects.'); }
    for (i = 0; i < columns.length; i += 1) {
        this.addColumn(columns[i]);
    }
};

/**
 * Returns {@link Column} object with given name or order number.
 * @method
 * @param {string | integer} nameOrPos - Name or order number of the column
 * @throws Will throw error if column does not exists.
 * @returns {Column}
 */
Table.prototype.column = helper.getObject('columnsByName', 'columns');

/**
 * Retrieves all columns in the table in an ordered list. If callback is provided, it is executed for each column. Callback is passed {@link Column}
 * object as parameter. If no callback is provided, returns array of {@link Column} objects.
 * @method
 * @param {columnCallback} [callback] - Callback to be executed for each column.
 * @returns {Array.<Column> | undefined}
 */
Table.prototype.columns = helper.objectsByOrder('columns');

/**
 * Retrieves all columns in the table. If callback is provided, it is executed for each column. Callback is passed {@link Column}
 * object as parameter. If no callback is provided, returns a plain Object. Object keys are column names,
 * values are {@link Column} objects.
 * @method
 * @param {columnCallback} [callback] - Callback to be executed for each column.
 * @returns {Object.<string, Column> | undefined}
 */
Table.prototype.columnsByName = helper.objectsByName('columnsByName');

/**
 * Retrieves all primary key columns in the table. If callback is provided, it is executed for each primary key.
 * Callback is passed {@link Column} object as parameter.
 * If no callback is provided, returns an array of {@link Column} objects.
 * @method
 * @param {columnCallback} [callback] - Callback to be executed for each primary key column.
 * @returns {Array.<Column>}
 */
Table.prototype.primaryKeys = helper.objectsByOrder('columns', function (value) { return value.isPrimaryKey(); });

/**
 * Adds foreign key and arranges necessary relations between tables.
 * Adds foreign key constraint, has many constraint and required details in the column
 * @method
 * @private
 * @param { Object } args
 * @param { string } args.constraintName - Name of the constraint.
 * @param { string } args.columnName - Name of the foreign key column.
 * @param { string } args.foreignSchemaName - Schema which contains referenced table.
 * @param { string } args.foreignTableName - Referenced table.
 * @param { string } args.foreignColumnName - Referenced column.
 * @param { string } args.onUpdate - Action on update. One of: 'NO ACTION', 'CASCADE', 'SET NULL', 'RESTRICT'
 * @param { string } args.onDelete - Action on delete. One of: 'NO ACTION', 'CASCADE', 'SET NULL', 'RESTRICT'
 */
Table.prototype.addForeignKey = function (args) {
    var fkConstraint, validation, column, referencesSchema, referencesTable, referencesColumn, hasMany, isNewFK, table;
    table = this;
    validation = joi.validate(args, {
        constraintName      : joi.string().required(),
        columnName          : joi.string().required(),
        foreignSchemaName   : joi.string().required(),
        foreignTableName    : joi.string().required(),
        foreignColumnName   : joi.string().required(),
        onUpdate            : joi.string().valid('NO ACTION', 'CASCADE', 'SET NULL', 'RESTRICT'),
        onDelete            : joi.string().valid('NO ACTION', 'CASCADE', 'SET NULL', 'RESTRICT')
    }, { abortEarly: false, allowUnknown: true });
    if (validation.error) { throw new Error('Error in function arguments. ' + validation.error + '. Arguments: ' + util.inspect(arguments, { depth: null })); }

    referencesSchema = this.schema().db().schema(args.foreignSchemaName);
    referencesTable  = referencesSchema.table(args.foreignTableName);

    isNewFK = !this.foreignKeyConstraintExist(args.constraintName) || typeof this.foreignKeyConstraint(args.constraintName) !== 'object';       // Is fkContraint to be added is new one.
    //------------------------ Arrange this table's attributes ---------------------------
    fkConstraint = this.addForeignKeyConstraint({
        name                : args.constraintName,
        referencesSchema    : referencesSchema,
        referencesTable     : referencesTable,
        onUpdate            : args.onUpdate,
        onDelete            : args.onDelete
    });

    column = this.column(args.columnName);
    referencesColumn = fkConstraint.referencesTable().column(args.foreignColumnName);
    fkConstraint.addForeignKey(column);
    column.isForeignKey(true);
    column.referencesColumn(referencesColumn);
    column.foreignKeyConstraint(fkConstraint);

    //----------------- Arrange referenced tables attributes (hasMany) --------------------
    referencesTable = referencesColumn.table();
    hasMany = referencesTable.addHasMany({
        name                : args.constraintName,
        referencesSchema    : this.schema(),
        referencesTable     : this,
        table               : referencesTable,
        onUpdate            : args.onUpdate,
        onDelete            : args.onDelete
    });
    hasMany.addForeignKey(column);

    //----------------------- Arrange hasManyThrough connections ---------------------------
    if (isNewFK) {
        this.foreignKeyConstraints(function (otherFKC) {
            if (otherFKC === fkConstraint) { return; }                          // If other FKC is itself, then skip it. i.e. cart_has_products <-> cart_has_products
            otherFKC.referencesTable().addHasManyThrough({
                name                : otherFKC.name(),
                referencesSchema    : fkConstraint.referencesSchema(),
                referencesTable     : fkConstraint.referencesTable(),
                onUpdate            : fkConstraint.onUpdate(),
                onDelete            : fkConstraint.onDelete(),
                through             : table
            });

            fkConstraint.referencesTable().addHasManyThrough({
                name                : fkConstraint.name(),
                referencesSchema    : otherFKC.referencesSchema(),
                referencesTable     : otherFKC.referencesTable(),
                onUpdate            : otherFKC.onUpdate(),
                onDelete            : otherFKC.onDelete(),
                through             : table
            });
        });
    }
};

/**
 * Adds foreign key constraint to the table. Returns foreign key constraint.
 * @method
 * @private
 * @param { Object } args - Foreign key constraint arguments.
 * @param { string } args.name - Name of the foreign key constraint.
 * @param { string } args.referencesSchemaName - Schema which contains referenced table.
 * @param { string } args.referencesTableName - Referenced table.
 * @param { string } args.onUpdate - Action on update. One of: 'NO ACTION', 'CASCADE', 'SET NULL', 'RESTRICT'
 * @param { string } args.onDelete - Action on delete. One of: 'NO ACTION', 'CASCADE', 'SET NULL', 'RESTRICT'
 * @returns { Constraint }
 */
Table.prototype.addForeignKeyConstraint = helper.addObject('foreignKeyConstraints', undefined, constraint, 'table');

/**
 * Returns foreign key {@link Constraint} object with given name.
 * @method
 * @param {string} name - Name of the foreign key constraint
 * @throws Will throw error if foreign key constraint does not exists.
 * @returns {Constraint}
 */
Table.prototype.foreignKeyConstraint = helper.getObject('foreignKeyConstraints', null);

/**
 * Returns true if foreign key object with given name exists.
 * @method
 * @param {string} name - Name of the foreign key constraint
 * @returns {boolean}
 */
Table.prototype.foreignKeyConstraintExist = helper.objectExist('foreignKeyConstraints', null);


/**
 * Retrieves all foreign key constraints in the table. If callback is provided, it is executed for each one.
 * Callback is passed {@link Constraint} object as parameter.
 * If no callback is provided, returns a plain Object. Plain object keys are names of {@link Constraint} objects and values are {@link Constraint} objects.
 * @method
 * @param {constraintCallback} [callback] - Callback to be executed for each constraint.
 * @returns {Array.<Constraint>}
 */
Table.prototype.foreignKeyConstraints = helper.objectsByOrder('foreignKeyConstraints');

/**
 * Retrieves all foreign key constraints in the table. If callback is provided, it is executed for each one.
 * Callback is passed {@link Constraint} object as parameter.
 * If no callback is provided, returns an array of {@link Constraint} objects.
 * @method
 * @param {constraintCallback} [callback] - Callback to be executed for each constrained.
 * @returns {Object.<string, Constraint> | undefined}
 */
Table.prototype.foreignKeyConstraintsByName = helper.objectsByName('foreignKeyConstraints');

/**
 * Adds has many constraint to the table and returns it.
 * @method
 * @private
 * @param { Object } args - Has many constraint arguments.
 * @param { string } args.name - Name of the has many constraint
 * @param { string } args.referencesSchemaName - Schema which contains referencing table.
 * @param { string } args.referencesTableName - Referencing table.
 * @returns { Constraint }
 */
Table.prototype.addHasMany = helper.addObject('hasMany', undefined, constraint, 'table');

/**
 * Returns has many {@link Constraint} object with given name.
 * @method
 * @param {string} name - Name of the has many constraint
 * @throws Will throw error if has many constraint does not exists.
 * @returns {Constraint}
 */
Table.prototype.hasMany = helper.getObject('hasMany', null);

/**
 * Retrieves all has many constraints in the table. If callback is provided, it is executed for each one.
 * Callback is passed {@link Constraint} object as parameter.
 * If no callback is provided, returns a plain Object. Plain object keys are names of {@link Constraint} objects and values are {@link Constraint} objects.
 * @method
 * @param {constraintCallback} [callback] - Callback to be executed for each constraint.
 * @returns {Array.<Constraint>}
 */
Table.prototype.hasManies = helper.objectsByOrder('hasMany');

/**
 * Retrieves all has many constraints in the table. If callback is provided, it is executed for one.
 * Callback is passed {@link Constraint} object as parameter.
 * If no callback is provided, returns an array of {@link Constraint} objects.
 * @method
 * @param {constraintCallback} [callback] - Callback to be executed for each constraint.
 * @returns {Object.<string, Constraint> | undefined}
 */
Table.prototype.hasManiesByName = helper.objectsByName('hasMany');

/**
 * Adds has many through constraint to the table and returns it.
 * @method
 * @private
 * @param { Object } args - Has many through constraint arguments.
 * @param { string } args.name - Name of the has many through constraint
 * @param { string } args.referencesSchemaName - Schema which contains referencing table.
 * @param { string } args.referencesTableName - Referencing table.
 * @returns { Constraint }
 */
Table.prototype.addHasManyThrough = helper.addObject('hasManyThrough', undefined, constraint, 'table');

/**
 * Returns has many through {@link Constraint} object with given name.
 * @method
 * @param {string} name - Name of the has many through constraint
 * @throws Will throw error if has many through constraint does not exists.
 * @returns {Constraint}
 */
Table.prototype.hasManyThrough = helper.getObject('hasManyThrough', null);

/**
 * Retrieves all has many through constraints in the table. If callback is provided, it is executed for each one.
 * Callback is passed {@link Constraint} object as parameter.
 * If no callback is provided, returns a plain Object. Plain object keys are names of {@link Constraint} objects and values are {@link Constraint} objects.
 * @method
 * @param {constraintCallback} [callback] - Callback to be executed for each constraint.
 * @returns {Array.<Constraint>}
 */
Table.prototype.hasManyThroughs = helper.objectsByOrder('hasManyThrough');

/**
 * Retrieves all has many through constraints in the table. If callback is provided, it is executed for one.
 * Callback is passed {@link Constraint} object as parameter.
 * If no callback is provided, returns an array of {@link Constraint} objects.
 * @method
 * @param {constraintCallback} [callback] - Callback to be executed for each constraint.
 * @returns {Object.<string, Constraint> | undefined}
 */
Table.prototype.hasManyThroughsByName = helper.objectsByName('hasManyThrough');

/**
 * Shortcut function which returns object based on path.
 * @method
 * @param {string} path - Database path of the requested item.
 * @returns {Column}
 * @example
 * var column = db.get('name');      // Returns name column of the contact table in public schema.
 */
Table.prototype.get = Table.prototype.column;

module.exports = function (args, options) {
    return new Table(args, options);
};
