'use strict';
var Lab         = require('lab');
var Chai        = require('chai');
var pgStructure = require('../lib/pg-structure');

var lab         = exports.lab = Lab.script();
var describe    = lab.describe;
var it          = lab.it;
var testDB      = require('./util/test-db.js');
var expect      = Chai.expect;

var db;
var table;
var typeTable;

lab.before((done) => {
    testDB.createDB('1')
        .then(() => {
            return pgStructure(testDB.credentials, ['public', 'other_schema']);
        })
        .then((result) => {
            db = result;
            table = db.get('public.account');
            typeTable = db.get('public.type_table');
            done();
        })
        .catch((err) => {
            console.log(err.stack);
        });
});

lab.after((done) => {
    testDB.dropDB().then(() => {
        done();
    });
});

describe('Column attributes', function() {
    it('should have allowNull.', function(done) {
        expect(table.getColumn('id').allowNull).to.equal(false);
        expect(table.getColumn('field5').allowNull).to.equal(true);
        done();
    });

    it('should have arrayDimension.', function(done) {
        expect(table.getColumn('field2').arrayDimension).to.equal(3);
        expect(table.getColumn('field3').arrayDimension).to.equal(2);
        expect(table.getColumn('id').arrayDimension).to.equal(0);
        done();
    });

    it('should have arrayDimension.', function(done) {
        expect(table.getColumn('field2').arrayType).to.equal('numeric');
        expect(table.getColumn('field3').arrayType).to.equal('character');
        expect(table.getColumn('id').arrayType).to.equal(null);
        done();
    });

    it('should have db.', function(done) {
        expect(table.getColumn('field2').db.name).to.equal('pg-test-util');
        done();
    });

    it('should have default.', function(done) {
        expect(table.getColumn('id').default).to.equal("nextval('account_id_seq'::regclass)");
        expect(table.getColumn('created_at').default).to.equal('now()');
        expect(typeTable.getColumn('name').default).to.equal("'oz'");
        done();
    });

    it('should have defaultWithTypeCast.', function(done) {
        expect(table.getColumn('id').defaultWithTypeCast).to.equal("nextval('account_id_seq'::regclass)");
        expect(table.getColumn('created_at').defaultWithTypeCast).to.equal('now()');
        expect(typeTable.getColumn('name').defaultWithTypeCast).to.equal("'oz'::character varying");
        done();
    });

    it('should have description.', function(done) {
        expect(table.getColumn('id').description).to.equal('Kayıt no.');
        expect(table.getColumn('field1').description).to.equal(null);
        done();
    });

    it('should have domainName.', function(done) {
        expect(typeTable.getColumn('id').domainName).to.equal(null);
        expect(typeTable.getColumn('person_tax').domainName).to.equal('tax_no');
        done();
    });

    it('should have domainFullName.', function(done) {
        expect(typeTable.getColumn('id').domainFullName).to.equal(null);
        expect(typeTable.getColumn('person_tax').domainFullName).to.equal('public.tax_no');
        done();
    });

    it('should have enumLabels.', function(done) {
        expect(table.getColumn('field1').enumLabels).to.equal(null);
        expect(typeTable.getColumn('options').enumLabels).to.deep.equal(['option_a', 'option_b', '\\"quote\\"', 'with,comma and \\"quote\\"']);
        done();
    });

    it('should have foreignKeyConstraint.', function(done) {
        expect(table.getColumn('owner_id').foreignKeyConstraint.name).to.equal('contact_has_companies');
        done();
    });

    it('should have fullName.', function(done) {
        expect(table.getColumn('field1').fullName).to.equal('public.account.field1');
        done();
    });

    it('should have fullCatalogName.', function(done) {
        expect(table.getColumn('field1').fullCatalogName).to.equal('pg-test-util.public.account.field1');
        done();
    });

    it('should have isAutoIncrement.', function(done) {
        expect(table.getColumn('id').isAutoIncrement).to.equal(true);
        expect(table.getColumn('field1').isAutoIncrement).to.equal(false);
        done();
    });

    it('should have isSerial.', function(done) {
        expect(table.getColumn('id').isSerial).to.equal(true);
        done();
    });

    it('should have isAutoIncrement.', function(done) {
        expect(table.getColumn('id').isAutoIncrement).to.equal(true);
        expect(table.getColumn('field1').isAutoIncrement).to.equal(false);
        done();
    });

    it('should have isForeignKey.', function(done) {
        expect(table.getColumn('owner_id').isForeignKey).to.equal(true);
        expect(table.getColumn('field1').isForeignKey).to.equal(false);
        expect(db.get('public.cart_line_item.product_id').isForeignKey).to.equal(true);
        done();
    });

    it('should have isPrimaryKey.', function(done) {
        expect(table.getColumn('id').isPrimaryKey).to.equal(true);
        expect(table.getColumn('owner_id').isPrimaryKey).to.equal(false);
        expect(db.get('public.cart_line_item.product_id').isPrimaryKey).to.equal(true);
        done();
    });

    it('should have length.', function(done) {
        expect(table.getColumn('id').length).to.equal(null);        // serial / integer
        expect(table.getColumn('name').length).to.equal(50);        // varchar
        expect(table.getColumn('field3').length).to.equal(7);       // char
        expect(table.getColumn('field5').length).to.equal(4);       // bit
        expect(table.getColumn('field6').length).to.equal(10);      // varbit
        done();
    });

    it('should have name.', function(done) {
        expect(table.getColumn('field1').name).to.equal('field1');
        done();
    });

    it('should have notNull.', function(done) {
        expect(table.getColumn('id').notNull).to.equal(true);
        expect(table.getColumn('field5').notNull).to.equal(false);
        done();
    });

    it('should have notNull.', function(done) {
        expect(table.getColumn('id').notNull).to.equal(true);
        expect(table.getColumn('field5').notNull).to.equal(false);
        done();
    });

    it('should have parent.', function(done) {
        expect(table.getColumn('field12').parent.name).to.equal('account');
        done();
    });

    it('should have precision.', function(done) {
        expect(table.getColumn('id').precision).to.equal(32);       // serial / integer
        expect(table.getColumn('field2').precision).to.equal(3);    // numeric
        expect(table.getColumn('field4').precision).to.equal(0);    // timestamp
        expect(table.getColumn('field7').precision).to.equal(0);    // timestamp with timezone
        expect(table.getColumn('field8').precision).to.equal(6);    // time
        expect(table.getColumn('field9').precision).to.equal(4);    // time with timezone
        expect(table.getColumn('field10').precision).to.equal(16);  // int2
        expect(table.getColumn('field11').precision).to.equal(32);  // int4
        expect(table.getColumn('field12').precision).to.equal(64);  // int8
        done();
    });

    it('should have referencedColumn.', function(done) {
        expect(db.get('public.contact.company_id').referencedColumn.fullName).to.equal('public.account.id');
        expect(db.get('public.message.sender_first_name').referencedColumn.fullName).to.equal('public.student.first_name');
        expect(db.get('other_schema.other_schema_table.account_id').referencedColumn.fullName).to.equal('public.account.id');
        done();
    });

    it('should have scale.', function(done) {
        expect(table.getColumn('id').scale).to.equal(0);            // serial / integer
        expect(table.getColumn('field2').scale).to.equal(2);        // numeric
        expect(table.getColumn('field4').scale).to.equal(null);     // timestamp
        done();
    });

    it('should have schema.', function(done) {
        expect(table.getColumn('field2').schema.name).to.equal('public');
        done();
    });

    it('should have type.', function(done) {
        expect(table.getColumn('owner_id').type).to.equal('integer');
        expect(table.getColumn('id').type).to.equal('integer');
        expect(table.getColumn('field2').type).to.equal('array');
        expect(table.getColumn('created_at').type).to.equal('timestamp without time zone');
        done();
    });

    it('should have table.', function(done) {
        expect(table.getColumn('field12').table.name).to.equal('account');
        done();
    });

    it('should have uniqueIndexesNoPK.', function(done) {
        let collection = db.get('public.contact.email').uniqueIndexesNoPK;

        expect(collection[0].name).to.equal('email');
        expect(collection[1].name).to.equal('IX_Unique_Mail_Surname');
        expect(collection[2].name).to.equal('nameandemail');

        expect(collection[0].columns[0].name).to.equal('email');

        expect(table.getColumn('id').uniqueIndexesNoPK).to.equal(null);    // Primary keys should be excluded.

        expect(table.getColumn('field12').uniqueIndexesNoPK).to.equal(null);
        done();
    });

    it('should have uniqueIndexes.', function(done) {
        let collection = db.get('public.contact.email').uniqueIndexes;

        expect(collection[0].name).to.equal('email');
        expect(collection[1].name).to.equal('IX_Unique_Mail_Surname');
        expect(collection[2].name).to.equal('nameandemail');

        expect(table.getColumn('id').uniqueIndexes[0].name).to.equal('Key2');    // Primary keys should be excluded.

        expect(table.getColumn('field12').uniqueIndexes).to.equal(null);
        done();
    });

    it('should have indexes.', function(done) {
        let collection = db.get('public.contact.email').indexes;

        expect(collection[0].name).to.equal('email');
        expect(collection[1].name).to.equal('IX_Unique_Mail_Surname');
        expect(collection[2].name).to.equal('nameandemail');

        expect(table.getColumn('id').indexes[0].name).to.equal('Key2');
        done();
    });

    it('should have userDefinedType.', function(done) {
        expect(typeTable.getColumn('person_tax').userDefinedType).to.equal(null);
        expect(typeTable.getColumn('company').userDefinedType).to.equal('composite_udt');
        expect(typeTable.getColumn('options').userDefinedType).to.equal('enumerated_udt');
        done();
    });
});

describe('Table methods', function() {
    it('should have getUniqueIndexesNoPK.', function(done) {
        let collection = [];
        db.get('public.contact.email').getUniqueIndexesNoPK((value) => {
            collection.push(value);
        });

        expect(collection[0].name).to.equal('email');
        expect(collection[1].name).to.equal('IX_Unique_Mail_Surname');
        expect(collection[2].name).to.equal('nameandemail');

        done();
    });

    it('should have getUniqueIndexes.', function(done) {
        let collection = [];
        db.get('public.contact.email').getUniqueIndexes((value) => {
            collection.push(value);
        });

        expect(collection[0].name).to.equal('email');
        expect(collection[1].name).to.equal('IX_Unique_Mail_Surname');
        expect(collection[2].name).to.equal('nameandemail');

        done();
    });

    it('should have getIndexes.', function(done) {
        let collection = [];
        db.get('public.contact.email').getIndexes((value) => {
            collection.push(value);
        });

        expect(collection[0].name).to.equal('email');
        expect(collection[1].name).to.equal('IX_Unique_Mail_Surname');
        expect(collection[2].name).to.equal('nameandemail');

        done();
    });
});
