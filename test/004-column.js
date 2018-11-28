"use strict";
var Lab = require("lab");
var Chai = require("chai");
var pgStructure = require("../index");

var lab = (exports.lab = Lab.script());
var describe = lab.describe;
var it = lab.it;
var testDB = require("./util/test-db.js");
var expect = Chai.expect;

var dbs = {};
var db;
var table;
var typeTable;

lab.before(() =>
    testDB
        .createDB("1")
        .then(() => pgStructure(testDB.credentials, ["public", "other_schema"]))
        .then(result => {
            dbs.fromDB = result;
            dbs.fromFile = pgStructure.deserialize(pgStructure.serialize(result));
        })
        .catch(err => {
            console.log(err.stack);
        })
);

lab.after(() => testDB.dropDB());

var tests = function(key) {
    return function() {
        lab.before(done => {
            db = dbs[key];
            table = db.get("public.account");
            typeTable = db.get("public.type_table");
        });

        it("should have allowNull.", function() {
            expect(table.columns.get("id").allowNull).to.equal(false);
            expect(table.columns.get("field5").allowNull).to.equal(true);
        });

        it("should have arrayDimension.", function() {
            expect(table.columns.get("field2").arrayDimension).to.equal(3);
            expect(table.columns.get("field3").arrayDimension).to.equal(2);
            expect(table.columns.get("id").arrayDimension).to.equal(0);
        });

        it("should have arrayDimension.", function() {
            expect(table.columns.get("field2").arrayType).to.equal("numeric");
            expect(table.columns.get("field3").arrayType).to.equal("character");
            expect(table.columns.get("id").arrayType).to.equal(null);
        });

        it("should have db.", function() {
            expect(table.columns.get("field2").db.name).to.equal("pg-test-util");
        });

        it("should have default.", function() {
            expect(table.columns.get("id").default).to.equal("nextval('account_id_seq'::regclass)");
            expect(table.columns.get("created_at").default).to.equal("now()");
            expect(table.columns.get("field_default_empty").default).to.equal("''");
            expect(typeTable.columns.get("name").default).to.equal("'oz'");
        });

        it("should have defaultWithTypeCast.", function() {
            expect(table.columns.get("id").defaultWithTypeCast).to.equal("nextval('account_id_seq'::regclass)");
            expect(table.columns.get("created_at").defaultWithTypeCast).to.equal("now()");
            expect(table.columns.get("field_default_empty").defaultWithTypeCast).to.equal("''::text");
            expect(typeTable.columns.get("name").defaultWithTypeCast).to.equal("'oz'::character varying");
        });

        it("should have comment.", function() {
            expect(table.columns.get("id").comment).to.equal("Kayıt no.");
            expect(table.columns.get("field1").comment).to.equal(null);
        });

        it("should have description.", function() {
            expect(table.columns.get("id").description).to.equal("Kayıt no.");
            expect(table.columns.get("field1").description).to.equal(null);
        });

        it("should have commentData.", function() {
            expect(table.columns.get("id").commentData).to.deep.equal({ columnExtra: 2 });
        });

        it("should have descriptionData.", function() {
            expect(table.columns.get("id").descriptionData).to.deep.equal({ columnExtra: 2 });
        });

        it("should have domainName.", function() {
            expect(typeTable.columns.get("id").domainName).to.equal(null);
            expect(typeTable.columns.get("person_tax").domainName).to.equal("tax_no");
        });

        it("should have domainSchema.", function() {
            expect(typeTable.columns.get("id").domainSchema).to.equal(null);
            expect(typeTable.columns.get("person_tax").domainSchema).to.equal("public");
        });

        it("should have domainFullName.", function() {
            expect(typeTable.columns.get("id").domainFullName).to.equal(null);
            expect(typeTable.columns.get("person_tax").domainFullName).to.equal("public.tax_no");
        });

        it("should have enumLabels.", function() {
            expect(table.columns.get("field1").enumLabels).to.equal(null);
            expect(typeTable.columns.get("options").enumLabels).to.deep.equal([
                "option_a",
                "option_b",
                '\\"quote\\"',
                'with,comma and \\"quote\\"'
            ]);
        });

        it("should have foreignKeyConstraints.", function() {
            expect([...table.columns.get("owner_id").foreignKeyConstraints.values()][0].name).to.equal(
                "contact_has_companies"
            );
        });

        it("should have foreignKeyConstraintsget().", function() {
            expect(table.columns.get("owner_id").foreignKeyConstraints.get("contact_has_companies").name).to.equal(
                "contact_has_companies"
            );
        });

        it("should have fullName.", function() {
            expect(table.columns.get("field1").fullName).to.equal("public.account.field1");
        });

        it("should have fullCatalogName.", function() {
            expect(table.columns.get("field1").fullCatalogName).to.equal("pg-test-util.public.account.field1");
        });

        it("should have isAutoIncrement.", function() {
            expect(table.columns.get("id").isAutoIncrement).to.equal(true);
            expect(table.columns.get("field1").isAutoIncrement).to.equal(false);
        });

        it("should have isSerial.", function() {
            expect(table.columns.get("id").isSerial).to.equal(true);
        });

        it("should have isAutoIncrement.", function() {
            expect(table.columns.get("id").isAutoIncrement).to.equal(true);
            expect(table.columns.get("field1").isAutoIncrement).to.equal(false);
        });

        it("should have isForeignKey.", function() {
            expect(table.columns.get("owner_id").isForeignKey).to.equal(true);
            expect(table.columns.get("field1").isForeignKey).to.equal(false);
            expect(db.get("public.cart_line_item.product_id").isForeignKey).to.equal(true);
        });

        it("should have isPrimaryKey.", function() {
            expect(table.columns.get("id").isPrimaryKey).to.equal(true);
            expect(table.columns.get("owner_id").isPrimaryKey).to.equal(false);
            expect(db.get("public.cart_line_item.product_id").isPrimaryKey).to.equal(true);
        });

        it("should have length.", function() {
            expect(table.columns.get("id").length).to.equal(null); // Serial / integer
            expect(table.columns.get("name").length).to.equal(50); // Varchar
            expect(table.columns.get("field3").length).to.equal(7); // Char
            expect(table.columns.get("field5").length).to.equal(4); // Bit
            expect(table.columns.get("field6").length).to.equal(10); // Varbit
        });

        it("should have matchOption.", function() {
            expect(
                db.get("public.cart_line_item_audit_log").foreignKeyConstraints.get("cart_line_item_has_audit_logs")
                    .matchOption
            ).to.equal("NONE");
        });

        it("should have name.", function() {
            expect(table.columns.get("field1").name).to.equal("field1");
        });

        it("should have notNull.", function() {
            expect(table.columns.get("id").notNull).to.equal(true);
            expect(table.columns.get("field5").notNull).to.equal(false);
        });

        it("should have notNull.", function() {
            expect(table.columns.get("id").notNull).to.equal(true);
            expect(table.columns.get("field5").notNull).to.equal(false);
        });

        it("should have parent.", function() {
            expect(table.columns.get("field12").parent.name).to.equal("account");
        });

        it("should have precision.", function() {
            expect(table.columns.get("id").precision).to.equal(32); // Serial / integer
            expect(table.columns.get("field2").precision).to.equal(3); // Numeric
            expect(table.columns.get("field4").precision).to.equal(0); // Timestamp
            expect(table.columns.get("field7").precision).to.equal(0); // Timestamp with timezone
            expect(table.columns.get("field8").precision).to.equal(6); // Time
            expect(table.columns.get("field9").precision).to.equal(4); // Time with timezone
            expect(table.columns.get("field10").precision).to.equal(16); // Int2
            expect(table.columns.get("field11").precision).to.equal(32); // Int4
            expect(table.columns.get("field12").precision).to.equal(64); // Int8
        });

        it("should have referencedColumns.", function() {
            expect([...table.columns.get("owner_id").referencedColumns.values()][0].name).to.equal("id");
        });

        it("should have scale.", function() {
            expect(table.columns.get("id").scale).to.equal(0); // Serial / integer
            expect(table.columns.get("field2").scale).to.equal(2); // Numeric
            expect(table.columns.get("field4").scale).to.equal(null); // Timestamp
        });

        it("should have schema.", function() {
            expect(table.columns.get("field2").schema.name).to.equal("public");
        });

        it("should have type.", function() {
            expect(table.columns.get("owner_id").type).to.equal("integer");
            expect(table.columns.get("id").type).to.equal("integer");
            expect(table.columns.get("field2").type).to.equal("array");
            expect(table.columns.get("created_at").type).to.equal("timestamp without time zone");
        });

        it("should have table.", function() {
            expect(table.columns.get("field12").table.name).to.equal("account");
        });

        it("should have uniqueIndexesNoPk.", function() {
            let collection = [...db.get("public.contact.email").uniqueIndexesNoPk.values()];

            expect(collection[0].name).to.equal("email");
            expect(collection[1].name).to.equal("IX_Unique_Mail_Surname");
            expect(collection[2].name).to.equal("nameandemail");

            expect([...collection[0].columns.values()][0].name).to.equal("email");

            expect([...table.columns.get("id").uniqueIndexesNoPk.values()]).to.deep.equal([]); // Primary keys should be excluded.

            expect([...table.columns.get("field12").uniqueIndexesNoPk.values()]).to.deep.equal([]);
        });

        it("should have uniqueIndexesNoPk.get().", function() {
            let collection = db.get("public.contact.email").uniqueIndexesNoPk;

            expect(collection.get("email").name).to.equal("email");
            expect(collection.get("IX_Unique_Mail_Surname").name).to.equal("IX_Unique_Mail_Surname");
            expect(collection.get("nameandemail").name).to.equal("nameandemail");
        });

        it("should have uniqueIndexes.", function() {
            let collection = [...db.get("public.contact.email").uniqueIndexes.values()];

            expect(collection[0].name).to.equal("email");
            expect(collection[1].name).to.equal("IX_Unique_Mail_Surname");
            expect(collection[2].name).to.equal("nameandemail");

            expect([...table.columns.get("id").uniqueIndexes.values()][0].name).to.equal("Key2"); // Primary keys should be excluded.

            expect([...table.columns.get("field12").uniqueIndexes.values()]).to.deep.equal([]);
        });

        it("should have uniqueIndexes.get().", function() {
            let collection = db.get("public.contact.email").uniqueIndexes;

            expect(collection.get("email").name).to.equal("email");
            expect(collection.get("IX_Unique_Mail_Surname").name).to.equal("IX_Unique_Mail_Surname");
            expect(collection.get("nameandemail").name).to.equal("nameandemail");
        });

        it("should have indexes.", function() {
            let collection = [...db.get("public.contact.email").indexes.values()];

            expect(collection[0].name).to.equal("email");
            expect(collection[1].name).to.equal("IX_Unique_Mail_Surname");
            expect(collection[2].name).to.equal("nameandemail");

            expect([...table.columns.get("id").indexes.values()][0].name).to.equal("Key2");
        });

        it("should have userDefinedType.", function() {
            expect(typeTable.columns.get("person_tax").userDefinedType).to.equal(null);
            expect(typeTable.columns.get("company").userDefinedType).to.equal("composite_udt");
            expect(typeTable.columns.get("options").userDefinedType).to.equal("enumerated_udt");
        });

        it("should have userType.", function() {
            expect(typeTable.columns.get("person_tax").userType).to.equal(null);
            expect(typeTable.columns.get("company").userType.columns).to.have.all.keys(['company_id', 'business_unit_id'])
            expect(typeTable.columns.get("options").userType).to.equal(null);
        });
    };
};

describe("Column from Database", tests("fromDB"));
describe("Column from File", tests("fromFile"));
