/*jslint node: true */
/*global describe, it, before, beforeEach, after, afterEach */
"use strict";

var assert          = require('chai').assert;
var tableModule     = require('../lib/util/table.js');
var dbModule        = require('../lib/util/db.js');
var db, schema, table, industryTable;

beforeEach(function (done) {
    db = dbModule({ name: 'bank' });
    schema = db.addSchema({ name: 'public' });
    table = schema.addTable({ name: 'account', description: 'Account details' });
    table.addColumn({ name: 'id', type: 'integer' });
    table.addColumn({ name: 'name', type: 'character varying', length: 50 });
    table.addColumn({ name: 'birth_date', type: 'timestamp without time zone', precision: 0 });
    table.addColumn({ name: 'industry_id', type: 'integer' });
    table.addColumn({ name: 'industry_code', type: 'integer' });

    industryTable = schema.addTable({ name: 'industry'});
    industryTable.addColumn({ name: 'id', type: 'integer' }).isPrimaryKey(true);
    industryTable.addColumn({ name: 'code', type: 'integer' }).isPrimaryKey(true);

    table.addForeignKey({ constraintName: 'industry_has_companies', columnName: 'industry_id', foreignSchemaName: 'public', foreignTableName: 'industry', foreignColumnName: 'id', onUpdate: 'CASCADE', onDelete: 'SET NULL' });
    table.addForeignKey({ constraintName: 'industry_has_companies', columnName: 'industry_code', foreignSchemaName: 'public', foreignTableName: 'industry', foreignColumnName: 'code', onUpdate: 'CASCADE', onDelete: 'SET NULL' });

    done();
});

describe('Table function', function () {
    it('should throw error if no args provided', function () {
        assert.throw(function () { tableModule(); }, /Table arguments are required/);
    });
    it('should throw error if arguments are not validated', function () {
        assert.throw(function () { tableModule({ corruptParam: true }); }, /table\. ValidationError: name is required/);
    });
});

describe('description function', function () {
    it('should return description', function () {
        assert.equal(table.description(), 'Account details');
    });
});

describe('addColumn function', function () {
    it('should add column when provided plain object.', function () {
        table.addColumn({ name: 'surname', type: 'character varying', length: 50 });
        assert.equal(table.column('surname').name(), 'surname');
    });
    it('should throw error when no arguments passed.', function () {
        assert.throw(function () { table.addColumn(); }, /required/);
    });
    it('should add reference to its table', function () {
        var addedColumn     = table.addColumn({ name: 'test_column', type: 'integer' });

        assert.equal(addedColumn.table().name(), 'account');
        assert.equal(addedColumn.parent().name(), 'account');
    });
});

describe('addColumns function', function () {
    it('should add multiple columns.', function () {
        table.addColumns([
            { name: 'surname', type: 'character varying', length: 50 },
            { name: 'middlename', type: 'character varying', length: 50 },
            { name: 'priority', type: 'smallint' }
        ]);
        assert.equal(table.column('middlename').name(), 'middlename');
    });

    it('should throw error if arguments are not validated', function () {
        assert.throw(function () { table.addColumns({ corruptParam: true }); }, /addColumns expects array/);
    });
});

describe('Column which is a foreign key', function () {
    it('should be used to referenced table.', function () {
        assert.equal(table.column('industry_id').foreignKeyConstraint().referencesTable().name(), 'industry');
    });
});

describe('foreignKeyConstraints function', function () {
    it('should get foreign key constraints by order without callback.', function () {
        assert.equal(table.foreignKeyConstraints()[0].name(), 'industry_has_companies');
    });
    it('should get foreign key constraints by order with callback.', function () {
        table.foreignKeyConstraints(function (constraint) {
            assert.equal(constraint.constructor.name, 'Constraint');
        });
    });
});

describe('foreignKeyConstraintExist function', function () {
    it('should return true for existing foreign key constraint.', function () {
        assert.isTrue(table.foreignKeyConstraintExist('industry_has_companies'));
    });
    it('should return true for existing foreign key constraint.', function () {
        assert.isFalse(table.foreignKeyConstraintExist('ZZZZ'));
    });
    it('should throw error for non validated arguments', function () {
        assert.throw(function () { table.foreignKeyConstraintExist(); }, /Error in function arguments/)
    });
});

describe('foreignKeyConstraintsByName function', function () {
    it('should get foreign key constraints with constraint name without callback.', function () {
        assert.equal(table.foreignKeyConstraintsByName().industry_has_companies.name(), 'industry_has_companies');
    });
    it('should get foreign key constraints with constraint name with callback.', function () {
        table.foreignKeyConstraintsByName(function (constraint) {
            assert.equal(constraint.constructor.name, 'Constraint');
        });
    });
});

describe('hasManies function', function () {
    it('should get has many constraints by order without callback.', function () {
        assert.equal(industryTable.hasManies()[0].name(), 'industry_has_companies');
    });
    it('should get has many constraints by order with callback.', function () {
        industryTable.hasManies(function (constraint) {
            assert.equal(constraint.constructor.name, 'Constraint');
        });
    });
});

describe('hasManiesByName function', function () {
    it('should get foreign key constraints with constraint name without callback.', function () {
        assert.equal(industryTable.hasManiesByName().industry_has_companies.name(), 'industry_has_companies');
    });
    it('should get foreign key constraints with constraint name with callback.', function () {
        industryTable.hasManiesByName(function (constraint) {
            assert.equal(constraint.constructor.name, 'Constraint');
        });
    });
});

describe('hasManies', function () {
    it('should allow access to foreign key.', function () {
        assert.equal(industryTable.hasMany('industry_has_companies').foreignKey('industry_id').name(), 'industry_id');
    });
    it('should allow access to foreign key to referencing column.', function () {
        assert.equal(industryTable.hasMany('industry_has_companies').foreignKey('industry_id').referencesColumn().name(), 'id');
    });
});

describe('column function', function () {
    it('should get column by name.', function () {
        assert.equal(table.column('birth_date').name(), 'birth_date');
    });
    it('should get column by order.', function () {
        assert.equal(table.column(0).name(), 'id');
    });
});

describe('columns function', function () {
    it('should return all columns without callback.', function () {
        var columns = table.columns();
        assert.equal(columns[0].name(), 'id');
    });
    it('should execute callback if callback provided.', function () {
        table.columnsByName(function (column) {
            assert.deepEqual(column, table.column(column.name()));
        });
    });
});

describe('columnsByName function', function () {
    it('should return all columns without callback.', function () {
        var columns = table.columnsByName();
        assert.equal(columns.birth_date.name(), 'birth_date');
    });
    it('should execute callback if callback provided.', function () {
        table.columnsByName(function (column) {
            assert.deepEqual(column, table.column(column.name()));
        });
    });
});


describe('Accessing from columns back to table', function () {
    it('should return table.', function () {
        assert.equal(table.column('id').table().name(), 'account');
    });
    it('should access other columns thrugh table.', function () {
        assert.equal(table.column('id').table().column('birth_date').name(), 'birth_date');
    });
});

describe('primaryKeys function', function () {
    it('should return primary keys.', function () {
        assert.deepEqual(industryTable.primaryKeys()[1], industryTable.column('code'));
        assert.equal(industryTable.primaryKeys().length, 2);
    });
    it('should execute callback for each primary key.', function () {
        var count = 0;
        industryTable.primaryKeys(function (pk) {
            assert.deepEqual(pk, industryTable.column(pk.name()));
            count += 1;
        });
        assert.equal(count, 2);
    });
});


describe('addForeignKey function', function () {
    it('should add foreignKeyConstraint.', function () {
        assert.equal(table.foreignKeyConstraint('industry_has_companies').name(), 'industry_has_companies');
    });
    it('should mark column as foreign key.', function () {
        assert.isTrue(table.column('industry_id').isForeignKey());
    });
    it('should add reference to foreign key.', function () {
        assert.equal(table.column('industry_id').referencesColumn().table().name(), 'industry');
        assert.equal(table.column('industry_id').referencesColumn().name(), 'id');
    });
    it('should add foreign key to constraint', function () {
        assert.equal(table.foreignKeyConstraint('industry_has_companies').foreignKey('industry_id').name(), 'industry_id');
    });
    it('should throw error for false schema name.', function () {
        assert.throw(function () {
            table.addForeignKey({ constraintName: 'fake', columnName: 'industry_id', foreignSchemaName: 'ZZZ', foreignTableName: 'industry', foreignColumnName: 'id', onUpdate: 'CASCADE', onDelete: 'SET NULL' });
        }, /This schema is also not in the options/);
    });
    it('should throw error for false table name.', function () {
        assert.throw(function () {
            table.addForeignKey({ constraintName: 'fake', columnName: 'industry_id', foreignSchemaName: 'public', foreignTableName: 'ZZZ', foreignColumnName: 'id', onUpdate: 'CASCADE', onDelete: 'SET NULL' });
        }, /cannot be found/);
    });
    it('should throw error for false column name.', function () {
        assert.throw(function () {
            table.addForeignKey({ constraintName: 'fake', columnName: 'ZZZ', foreignSchemaName: 'public', foreignTableName: 'industry', foreignColumnName: 'id', onUpdate: 'CASCADE', onDelete: 'SET NULL' });
        }, /cannot be found/);
    });
    it('should throw error for false foreign column name.', function () {
        assert.throw(function () {
            table.addForeignKey({ constraintName: 'fake', columnName: 'industry_id', foreignSchemaName: 'public', foreignTableName: 'industry', foreignColumnName: 'ZZZ', onUpdate: 'CASCADE', onDelete: 'SET NULL' });
        }, /cannot be found/);
    });
    it('should throw error for non validated parameters.', function () {
        assert.throw(function () {
            table.addForeignKey({ corruptParameter: true });
        }, /constraintName is required/);
    });

});