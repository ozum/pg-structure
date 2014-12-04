/*
Created: 02/10/2014
Modified: 28/11/2014
Project: Node Test
Model: Node Test
Company: Fortibase
Author: Özüm Eldoğan
Version: 1.0
Database: PostgreSQL 9.2
*/

-- Geçici fonksiyon: Schema mevcut değilse oluşturan fonksiyon.
    CREATE OR REPLACE FUNCTION temp_create_schema_if_not_exists (schema_array text[]) RETURNS TEXT AS $body$ DECLARE v_schema TEXT; BEGIN FOREACH v_schema IN ARRAY schema_array LOOP IF NOT EXISTS( SELECT 1 FROM pg_namespace WHERE nspname = v_schema ) THEN EXECUTE 'CREATE SCHEMA ' || quote_ident(v_schema); END IF; END LOOP; RETURN 'Press Execute button to continue...'; END; $body$ LANGUAGE 'plpgsql';
    SELECT temp_create_schema_if_not_exists(ARRAY['extra_modules']);
    DROP FUNCTION temp_create_schema_if_not_exists (schema_array text[]);

CREATE EXTENSION IF NOT EXISTS hstore SCHEMA extra_modules;           -- HStore



-- Create schemas section -------------------------------------------------

CREATE SCHEMA "other_schema"
;

-- Create domain types section -------------------------------------------------

CREATE DOMAIN "tax_no" AS Character varying(20) DEFAULT 1234 NOT NULL
;

-- Create functions section -------------------------------------------------

CREATE FUNCTION "t_updated_at"()
RETURNS TRIGGER
 LANGUAGE plpgsql
 VOLATILE
AS
$$
BEGIN
     NEW.updated_at := now();
     RETURN NEW;
END;
$$
;

-- Create user data types section -------------------------------------------------

CREATE TYPE "composite_udt" AS
 ( company_id                          INTEGER,
business_unit_id            INTEGER )
;

CREATE TYPE "enumerated_udt" AS ENUM
 ( 'option_a', 'option_b' )
;

-- Create tables section -------------------------------------------------

-- Table contact

CREATE TABLE "contact"(
 "id" Serial NOT NULL,
 "created_at" Timestamp(0) DEFAULT now() NOT NULL,
 "updated_at" Timestamp(0) DEFAULT now() NOT NULL,
 "name" Character varying(20) NOT NULL DEFAULT 'oz',
 "surname" Character varying(20) NOT NULL DEFAULT 'O''Reilly',
 "email" Character varying(20) NOT NULL DEFAULT 'x@x.com',
 "birth_date" Date NOT NULL DEFAULT '2010-01-01',
 "is_active" Boolean DEFAULT TRUE NOT NULL,
 "company_id" Integer NOT NULL,
 "second_company_id" Integer,
 "custom" Json,
 "custom_hstore" "extra_modules"."hstore"
)
WITH (OIDS=FALSE)
;

COMMENT ON TABLE "contact" IS 'Kişi bilgilerini tutan tablo.'
;
COMMENT ON COLUMN "contact"."id" IS 'Kayıt no.'
;
COMMENT ON COLUMN "contact"."created_at" IS 'Kaydın oluşturulduğu zaman.'
;
COMMENT ON COLUMN "contact"."updated_at" IS 'Kaydın son güncellendiği zaman.'
;
COMMENT ON COLUMN "contact"."name" IS 'Kullanıcının adı.'
;
COMMENT ON COLUMN "contact"."surname" IS 'Kullanıcının soyadı.'
;
COMMENT ON COLUMN "contact"."email" IS 'Kullanıcının e-posta adresi.'
;
COMMENT ON COLUMN "contact"."birth_date" IS 'Doğum tarihi.'
;
COMMENT ON COLUMN "contact"."is_active" IS 'Kayıt sistemde aktif olarak kullanılıyor mu. Silme işlemi olmadığından kalabalık yaratması istenmeyen kayıtlar pasif konuma getirilir.'
;
COMMENT ON COLUMN "contact"."company_id" IS 'İrtibatın dahil olduğu firma.'
;
COMMENT ON COLUMN "contact"."second_company_id" IS 'İrtibatın ikinci şirketi. (Aynı tablodan aynı tabloya birden fazla relation varsa test etmek için)'
;
COMMENT ON COLUMN "contact"."custom" IS 'JSON formatında custom değerleri tutan alan.'
;
COMMENT ON COLUMN "contact"."custom_hstore" IS 'HSTORE formatında custom değerleri tutan alan'
;

INSERT INTO contact ("name", "surname", "email", "birth_date", "company_id", "custom", "custom_hstore")
VALUES (E'Özüm', E'Eldoğan', E'ozum@ozum.net ', E'1980-01-02', 1, E'{\"team\":\"BJK\", \"city\":\"Istanbul\"}', E'\"city\"=>\"''Istanbul''\", \"team\"=>\"''BJK''\"');

INSERT INTO contact ("name", "surname", "email", "birth_date", "company_id", "custom", "custom_hstore")
VALUES (E'Alihan', E'Karagül', E'a@fpsproduction.com', E'2978-01-01', 2, E'{\"team\":\"FB\", \"city\":\"Istanbul\"}', E'\"city\"=>\"''Istanbul''\", \"team\"=>\"''FB''\"');

INSERT INTO contact ("name", "surname", "email", "birth_date", "company_id", "custom", "custom_hstore")
VALUES (E'Atalay', E'Saraç', E'atalay@fortibase.com', E'1978-03-04', 2, E'{\"team\":\"FB\", \"city\":\"Istanbul\"}', E'\"city\"=>\"''Istanbul''\", \"team\"=>\"''BJK''\"');

INSERT INTO contact ("name", "surname", "email", "birth_date", "company_id", "custom", "custom_hstore")
VALUES (E'Ufuk', E'Yurtsever', E'ufuk@fortibase.com', E'0150-01-01', 2, E'{\"team\":\"FB\", \"city\":\"Istanbul\"}', E'\"city\"=>\"''Istanbul''\", \"team\"=>\"''FB''\"');

-- Create indexes for table contact

CREATE INDEX "IX_Relationship1" ON "contact" ("company_id")
;

CREATE INDEX "IX_Relationship6" ON "contact" ("second_company_id")
;

CREATE UNIQUE INDEX "IX_Unique_Full_Name" ON "contact" ("name","surname")
;

-- Add keys for table contact

ALTER TABLE "contact" ADD CONSTRAINT "Key1" PRIMARY KEY ("id")
;

ALTER TABLE "contact" ADD CONSTRAINT "email" UNIQUE ("email")
;

-- Create triggers for table contact

CREATE TRIGGER "updated_at"
  BEFORE UPDATE
  ON "contact" FOR EACH ROW
 EXECUTE PROCEDURE "t_updated_at"()
;

-- Table account

CREATE TABLE "account"(
 "id" Serial NOT NULL,
 "created_at" Timestamp(0) DEFAULT now() NOT NULL,
 "updated_at" Timestamp(0) DEFAULT now() NOT NULL,
 "owner_id" Integer,
 "is_active" Boolean DEFAULT TRUE NOT NULL,
 "name" Character varying(50) NOT NULL,
 "field1" Character varying(2)[],
 "field2" Numeric(3,2)[][][],
 "field3" Character(7)[][],
 "field4" Timestamp(0)[][],
 "field5" Bit(4)[],
 "field6" Bit varying(10)[][][][],
 "field7" Timestamp(0) with time zone[],
 "field8" Time(6)[],
 "field9" Time(4) with time zone[],
 "field10" Smallint[],
 "field11" Integer[][],
 "field12" Bigint[][][][]
)
WITH (OIDS=FALSE)
;

COMMENT ON TABLE "account" IS 'Firma bilgilerinin tutulduğu tablo.'
;
COMMENT ON COLUMN "account"."id" IS 'Kayıt no.'
;
COMMENT ON COLUMN "account"."created_at" IS 'Kaydın oluşturulduğu zaman.'
;
COMMENT ON COLUMN "account"."updated_at" IS 'Kaydın son güncellendiği zaman.'
;
COMMENT ON COLUMN "account"."owner_id" IS 'Şirket sahibi.'
;
COMMENT ON COLUMN "account"."is_active" IS 'Kayıt sistemde aktif olarak kullanılıyor mu. Silme işlemi olmadığından kalabalık yaratması istenmeyen kayıtlar pasif konuma getirilir.'
;
COMMENT ON COLUMN "account"."name" IS 'Firma adı.'
;

INSERT INTO account (name) VALUES ('Fortibase');
INSERT INTO account (name) VALUES ('FPS Production');
INSERT INTO account (name) VALUES ('Microsoft');
INSERT INTO account (name) VALUES ('Acme');

-- Create indexes for table account

CREATE INDEX "IX_Relationship7" ON "account" ("owner_id")
;

-- Add keys for table account

ALTER TABLE "account" ADD CONSTRAINT "Key2" PRIMARY KEY ("id")
;

-- Create triggers for table account

CREATE TRIGGER "updated_at"
  BEFORE UPDATE
  ON "account" FOR EACH ROW
 EXECUTE PROCEDURE "t_updated_at"()
;

-- Table cart

CREATE TABLE "cart"(
 "id" Serial NOT NULL,
 "created_at" Timestamp(0) DEFAULT now() NOT NULL,
 "updated_at" Timestamp(0) DEFAULT now() NOT NULL,
 "contact_id" Integer NOT NULL
)
WITH (OIDS=FALSE)
;

COMMENT ON TABLE "cart" IS 'Alışveriş sepetlerini tutan tablo.'
;
COMMENT ON COLUMN "cart"."id" IS 'Kayıt no.'
;
COMMENT ON COLUMN "cart"."created_at" IS 'Kaydın oluşturulduğu zaman.'
;
COMMENT ON COLUMN "cart"."updated_at" IS 'Kaydın son güncellendiği zaman.'
;
COMMENT ON COLUMN "cart"."contact_id" IS 'Alışveriş sepetinin sahibi.'
;

INSERT INTO cart ("contact_id")
VALUES (1);

INSERT INTO cart ("contact_id")
VALUES (4);

INSERT INTO cart ("contact_id")
VALUES (3);

INSERT INTO cart ("contact_id")
VALUES (2);

INSERT INTO cart ("contact_id")
VALUES (1);

-- Create indexes for table cart

CREATE INDEX "IX_Relationship2" ON "cart" ("contact_id")
;

-- Add keys for table cart

ALTER TABLE "cart" ADD CONSTRAINT "Key3" PRIMARY KEY ("id")
;

-- Create triggers for table cart

CREATE TRIGGER "updated_at"
  BEFORE UPDATE
  ON "cart" FOR EACH ROW
 EXECUTE PROCEDURE "t_updated_at"()
;

-- Table product

CREATE TABLE "product"(
 "id" Serial NOT NULL,
 "created_at" Timestamp(0) DEFAULT now() NOT NULL,
 "updated_at" Timestamp(0) DEFAULT now() NOT NULL,
 "name" Character varying(20) NOT NULL,
 "product_category_id" Integer NOT NULL
)
WITH (OIDS=FALSE)
;

COMMENT ON TABLE "product" IS 'Ürünleri tutan tablo.'
;
COMMENT ON COLUMN "product"."id" IS 'Kayıt no.'
;
COMMENT ON COLUMN "product"."created_at" IS 'Kaydın oluşturulduğu zaman.'
;
COMMENT ON COLUMN "product"."updated_at" IS 'Kaydın son güncellendiği zaman.'
;
COMMENT ON COLUMN "product"."name" IS 'Ürünün ismi'
;
COMMENT ON COLUMN "product"."product_category_id" IS 'Ürün kategorisi'
;

INSERT INTO product ("name", "product_category_id")
VALUES (E'Sony Z2', 3);

INSERT INTO product ("name", "product_category_id")
VALUES (E'Logitech T-14', 5 );

INSERT INTO product ("name", "product_category_id")
VALUES (E'Çikolata', 6);

INSERT INTO product ("name", "product_category_id")
VALUES (E'Pergel', 7);

INSERT INTO product ("name", "product_category_id")
VALUES (E'Kalem', 7);

-- Create indexes for table product

CREATE INDEX "IX_Relationship4" ON "product" ("product_category_id")
;

-- Add keys for table product

ALTER TABLE "product" ADD CONSTRAINT "Key4" PRIMARY KEY ("id")
;

-- Create triggers for table product

CREATE TRIGGER "updated_at"
  BEFORE UPDATE
  ON "product" FOR EACH ROW
 EXECUTE PROCEDURE "t_updated_at"()
;

-- Table cart_line_item

CREATE TABLE "cart_line_item"(
 "cart_id" Integer NOT NULL,
 "product_id" Integer NOT NULL,
 "created_at" Timestamp(0) DEFAULT now() NOT NULL,
 "updated_at" Timestamp(0) DEFAULT now() NOT NULL,
 "quantity" Smallint DEFAULT 1 NOT NULL
)
WITH (OIDS=FALSE)
;

COMMENT ON TABLE "cart_line_item" IS 'Sepetteki ürünleri tutan tablo.'
;
COMMENT ON COLUMN "cart_line_item"."created_at" IS 'Kaydın oluşturulduğu zaman.'
;
COMMENT ON COLUMN "cart_line_item"."updated_at" IS 'Kaydın son güncellendiği zaman.'
;
COMMENT ON COLUMN "cart_line_item"."quantity" IS 'Sepete eklenen ürün adedi.'
;

INSERT INTO cart_line_item ("cart_id", "product_id", "quantity")
VALUES (4, 3, 3);

INSERT INTO cart_line_item ("cart_id", "product_id", "quantity")
VALUES (4, 1, 1);

INSERT INTO cart_line_item ("cart_id", "product_id", "quantity")
VALUES (3, 3, 1);

INSERT INTO cart_line_item ("cart_id", "product_id", "quantity")
VALUES (3, 5, 2);

INSERT INTO cart_line_item ("cart_id", "product_id", "quantity")
VALUES (2, 4, 1);

INSERT INTO cart_line_item ("cart_id", "product_id", "quantity")
VALUES (2, 1, 1);

INSERT INTO cart_line_item ("cart_id", "product_id", "quantity")
VALUES (1, 3, 1);

INSERT INTO cart_line_item ("cart_id", "product_id", "quantity")
VALUES (1, 2, 3);

INSERT INTO cart_line_item ("cart_id", "product_id", "quantity")
VALUES (1, 1, 2);

-- Add keys for table cart_line_item

ALTER TABLE "cart_line_item" ADD CONSTRAINT "Key5" PRIMARY KEY ("cart_id","product_id")
;

-- Create triggers for table cart_line_item

CREATE TRIGGER "updated_at"
  BEFORE UPDATE
  ON "cart_line_item" FOR EACH ROW
 EXECUTE PROCEDURE "t_updated_at"()
;

-- Table product_category

CREATE TABLE "product_category"(
 "id" Serial NOT NULL,
 "parent_category_id" Integer,
 "name" Character varying(20) NOT NULL
)
WITH (OIDS=FALSE)
;

COMMENT ON TABLE "product_category" IS 'Ürün kategorilerini tutan tablo.'
;
COMMENT ON COLUMN "product_category"."id" IS 'Kayıt no.'
;
COMMENT ON COLUMN "product_category"."name" IS 'Ürün kategori ismi.'
;

INSERT INTO product_category ("name", "parent_category_id")
VALUES ('Elektronik', NULL);

INSERT INTO product_category ("name", "parent_category_id")
VALUES ('Telekom', 1);

INSERT INTO product_category ("name", "parent_category_id")
VALUES ('Telefon', 2);

INSERT INTO product_category ("name", "parent_category_id")
VALUES ('Bilgisayar', 1);

INSERT INTO product_category ("name", "parent_category_id")
VALUES ('Mouse', 4);

INSERT INTO product_category ("name", "parent_category_id")
VALUES ('Diğer', NULL);

INSERT INTO product_category ("name", "parent_category_id")
VALUES ('Kırtasiye', NULL);


-- Create indexes for table product_category

CREATE INDEX "IX_Relationship3" ON "product_category" ("parent_category_id")
;

-- Add keys for table product_category

ALTER TABLE "product_category" ADD CONSTRAINT "Key6" PRIMARY KEY ("id")
;

-- Table cart_line_item_audit_log

CREATE TABLE "cart_line_item_audit_log"(
 "id" Serial NOT NULL,
 "cart_id" Integer NOT NULL,
 "product_id" Integer NOT NULL,
 "created_at" Timestamp(0) DEFAULT now() NOT NULL,
 "updated_at" Timestamp(0) DEFAULT now() NOT NULL
)
WITH (OIDS=FALSE)
;

COMMENT ON TABLE "cart_line_item_audit_log" IS 'Sepete atılan ürünlerin loglarını tutan tablo. Multi primary keye ref veren tablonun test edilmesi için.'
;
COMMENT ON COLUMN "cart_line_item_audit_log"."id" IS 'Kayıt no.'
;
COMMENT ON COLUMN "cart_line_item_audit_log"."cart_id" IS 'Sepet atılan ürünün sepet id''si.'
;
COMMENT ON COLUMN "cart_line_item_audit_log"."product_id" IS 'Sepet atılan ürünün ürün id''si.'
;
COMMENT ON COLUMN "cart_line_item_audit_log"."created_at" IS 'Kaydın oluşturulduğu zaman.'
;
COMMENT ON COLUMN "cart_line_item_audit_log"."updated_at" IS 'Kaydın son güncellendiği zaman.'
;

-- Create indexes for table cart_line_item_audit_log

CREATE INDEX "IX_Relationship5" ON "cart_line_item_audit_log" ("cart_id","product_id")
;

-- Add keys for table cart_line_item_audit_log

ALTER TABLE "cart_line_item_audit_log" ADD CONSTRAINT "Key7" PRIMARY KEY ("id")
;

-- Create triggers for table cart_line_item_audit_log

CREATE TRIGGER "updated_at"
  BEFORE UPDATE
  ON "cart_line_item_audit_log" FOR EACH ROW
 EXECUTE PROCEDURE "t_updated_at"()
;

-- Table cart_line_item_cross_composite

CREATE TABLE "cart_line_item_cross_composite"(
 "id" Serial NOT NULL,
 "primary_cart_id" Integer,
 "primary_product_id" Integer,
 "secondary_cart_id" Integer,
 "secondary_product_id" Integer
)
WITH (OIDS=FALSE)
;

COMMENT ON TABLE "cart_line_item_cross_composite" IS 'Composite key içeren many to many tablo testi için oluşturulmuş olan tablo.'
;
COMMENT ON COLUMN "cart_line_item_cross_composite"."id" IS 'Kayıt no.'
;
COMMENT ON COLUMN "cart_line_item_cross_composite"."primary_cart_id" IS 'Birincil sepet id.'
;
COMMENT ON COLUMN "cart_line_item_cross_composite"."primary_product_id" IS 'Birincil ürün id.'
;
COMMENT ON COLUMN "cart_line_item_cross_composite"."secondary_cart_id" IS 'İkincil sepet id.'
;
COMMENT ON COLUMN "cart_line_item_cross_composite"."secondary_product_id" IS 'İkincil ürün id.'
;

-- Create indexes for table cart_line_item_cross_composite

CREATE INDEX "IX_Relationship8" ON "cart_line_item_cross_composite" ("primary_cart_id","primary_product_id")
;

CREATE INDEX "IX_Relationship9" ON "cart_line_item_cross_composite" ("secondary_cart_id","secondary_product_id")
;

-- Add keys for table cart_line_item_cross_composite

ALTER TABLE "cart_line_item_cross_composite" ADD CONSTRAINT "Key8" PRIMARY KEY ("id")
;

-- Table student

CREATE TABLE "student"(
 "first_name" Character varying(20) NOT NULL,
 "middle_name" Character varying(20) NOT NULL,
 "last_name" Character varying(20) NOT NULL,
 "class" Smallint
)
WITH (OIDS=FALSE)
;

COMMENT ON TABLE "student" IS '3''lü composit key test için oluşturulmuş yapay tablo.'
;
COMMENT ON COLUMN "student"."first_name" IS 'Adı.'
;
COMMENT ON COLUMN "student"."middle_name" IS 'Orta ismi'
;
COMMENT ON COLUMN "student"."last_name" IS 'Soy ismi'
;

-- Add keys for table student

ALTER TABLE "student" ADD CONSTRAINT "Key9" PRIMARY KEY ("first_name","middle_name","last_name")
;

-- Table class

CREATE TABLE "class"(
 "name" Character varying(20) NOT NULL,
 "teacher_name" Character varying(20) NOT NULL,
 "teacher_surname" Character varying(20) NOT NULL,
 "is_popular" Boolean
)
WITH (OIDS=FALSE)
;

COMMENT ON TABLE "class" IS '3''lü composite key test etmek için oluşturulmuş yapay ikinci tablo.'
;
COMMENT ON COLUMN "class"."name" IS 'Ders ismi'
;
COMMENT ON COLUMN "class"."teacher_name" IS 'Dersi veren hocanın ismi'
;
COMMENT ON COLUMN "class"."teacher_surname" IS 'Dersi veren hocanın soy ismi'
;
COMMENT ON COLUMN "class"."is_popular" IS 'Popüler ders mi?'
;

-- Add keys for table class

ALTER TABLE "class" ADD CONSTRAINT "Key10" PRIMARY KEY ("name","teacher_name","teacher_surname")
;

-- Table class_register

CREATE TABLE "class_register"(
 "name" Character varying(20) NOT NULL,
 "teacher_name" Character varying(20) NOT NULL,
 "teacher_surname" Character varying(20) NOT NULL,
 "first_name" Character varying(20) NOT NULL,
 "middle_name" Character varying(20) NOT NULL,
 "last_name" Character varying(20) NOT NULL
)
WITH (OIDS=FALSE)
;

COMMENT ON TABLE "class_register" IS '3 lü komposit key ile birleşen many to many tabloları test etmek için yapay tablo.'
;

-- Add keys for table class_register

ALTER TABLE "class_register" ADD CONSTRAINT "Key11" PRIMARY KEY ("name","teacher_name","teacher_surname","first_name","middle_name","last_name")
;

-- Table message

CREATE TABLE "message"(
 "id" Serial NOT NULL,
 "sender_first_name" Character varying(20),
 "sender_middle_name" Character varying(20),
 "sender_last_name" Character varying(20),
 "receiver_first_name" Character varying(20),
 "receiver_middle_name" Character varying(20),
 "receiver_last_name" Character varying(20)
)
WITH (OIDS=FALSE)
;

COMMENT ON TABLE "message" IS '3''lü composite key içeren self referencing tabloları test etmek için yapay tablo.'
;
COMMENT ON COLUMN "message"."id" IS 'Kayıt no'
;
COMMENT ON COLUMN "message"."sender_first_name" IS 'Gönderen ilk ismi'
;
COMMENT ON COLUMN "message"."sender_middle_name" IS 'Gönderen orta ismi'
;
COMMENT ON COLUMN "message"."sender_last_name" IS 'Gönderen soy ismi'
;
COMMENT ON COLUMN "message"."receiver_first_name" IS 'Mesaj alanın ilk ismi'
;
COMMENT ON COLUMN "message"."receiver_middle_name" IS 'Mesaj alanın orta ismi.'
;
COMMENT ON COLUMN "message"."receiver_last_name" IS 'Mesaj alanın soy ismi.'
;

-- Create indexes for table message

CREATE INDEX "IX_Relationship11" ON "message" ("sender_first_name","sender_middle_name","sender_last_name")
;

CREATE INDEX "IX_Relationship12" ON "message" ("receiver_first_name","receiver_middle_name","receiver_last_name")
;

-- Add keys for table message

ALTER TABLE "message" ADD CONSTRAINT "Key12" PRIMARY KEY ("id")
;

-- Table other_schema.other_schema_table

CREATE TABLE "other_schema"."other_schema_table"(
 "id" Serial NOT NULL,
 "name" Character varying(20),
 "account_id" Integer
)
WITH (OIDS=FALSE)
;

COMMENT ON TABLE "other_schema"."other_schema_table" IS 'Diğer bir şemayı kontrol etmek için kullanılan tablo.'
;
COMMENT ON COLUMN "other_schema"."other_schema_table"."id" IS 'Kayıt no.'
;
COMMENT ON COLUMN "other_schema"."other_schema_table"."name" IS 'Adı'
;
COMMENT ON COLUMN "other_schema"."other_schema_table"."account_id" IS 'Bağlı olduğu firma.'
;

-- Create indexes for table other_schema.other_schema_table

CREATE INDEX "IX_other_schema_table_id" ON "other_schema"."other_schema_table" ("account_id")
;

-- Add keys for table other_schema.other_schema_table

ALTER TABLE "other_schema"."other_schema_table" ADD CONSTRAINT "Key13" PRIMARY KEY ("id")
;

-- Table type_table

CREATE TABLE "type_table"(
 "id" Serial NOT NULL,
 "person_tax" "tax_no",
 "name" Character varying(20) DEFAULT 'oz',
 "company" "composite_udt",
 "options" "enumerated_udt"
)
WITH (OIDS=FALSE)
;

COMMENT ON TABLE "type_table" IS 'Table to test custom data types.'
;
COMMENT ON COLUMN "type_table"."id" IS 'Kayıt no.'
;
COMMENT ON COLUMN "type_table"."person_tax" IS 'Tax number of person.'
;
COMMENT ON COLUMN "type_table"."name" IS 'Name of the person'
;
COMMENT ON COLUMN "type_table"."options" IS 'Options of person'
;

-- Add keys for table type_table

ALTER TABLE "type_table" ADD CONSTRAINT "type_table_key" PRIMARY KEY ("id")
;

-- Create relationships section ------------------------------------------------- 

ALTER TABLE "contact" ADD CONSTRAINT "account_has_contacts" FOREIGN KEY ("company_id") REFERENCES "account" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
;

ALTER TABLE "cart" ADD CONSTRAINT "contact_has_carts" FOREIGN KEY ("contact_id") REFERENCES "contact" ("id") ON DELETE CASCADE ON UPDATE CASCADE
;

ALTER TABLE "cart_line_item" ADD CONSTRAINT "cart_has_products" FOREIGN KEY ("cart_id") REFERENCES "cart" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
;

ALTER TABLE "cart_line_item" ADD CONSTRAINT "product_has_carts" FOREIGN KEY ("product_id") REFERENCES "product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
;

ALTER TABLE "product_category" ADD CONSTRAINT "product_category_has_parent_category" FOREIGN KEY ("parent_category_id") REFERENCES "product_category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
;

ALTER TABLE "product" ADD CONSTRAINT "Relationship4" FOREIGN KEY ("product_category_id") REFERENCES "product_category" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
;

ALTER TABLE "contact" ADD CONSTRAINT "account_has_second_contacts" FOREIGN KEY ("second_company_id") REFERENCES "account" ("id") ON DELETE SET NULL ON UPDATE CASCADE
;

ALTER TABLE "account" ADD CONSTRAINT "contact_has_companies" FOREIGN KEY ("owner_id") REFERENCES "contact" ("id") ON DELETE SET NULL ON UPDATE CASCADE
;

ALTER TABLE "cart_line_item_audit_log" ADD CONSTRAINT "cart_line_item_has_audit_logs" FOREIGN KEY ("cart_id", "product_id") REFERENCES "cart_line_item" ("cart_id", "product_id") ON DELETE NO ACTION ON UPDATE NO ACTION
;

ALTER TABLE "cart_line_item_cross_composite" ADD CONSTRAINT "cart_line_item_has_many_primary_cross" FOREIGN KEY ("primary_cart_id", "primary_product_id") REFERENCES "cart_line_item" ("cart_id", "product_id") ON DELETE NO ACTION ON UPDATE NO ACTION
;

ALTER TABLE "cart_line_item_cross_composite" ADD CONSTRAINT "cart_line_item_has_many_secondary_cross" FOREIGN KEY ("secondary_cart_id", "secondary_product_id") REFERENCES "cart_line_item" ("cart_id", "product_id") ON DELETE NO ACTION ON UPDATE NO ACTION
;

ALTER TABLE "class_register" ADD CONSTRAINT "class_has_many_students" FOREIGN KEY ("name", "teacher_name", "teacher_surname") REFERENCES "class" ("name", "teacher_name", "teacher_surname") ON DELETE RESTRICT ON UPDATE CASCADE
;

ALTER TABLE "class_register" ADD CONSTRAINT "student_has_many_classes" FOREIGN KEY ("first_name", "middle_name", "last_name") REFERENCES "student" ("first_name", "middle_name", "last_name") ON DELETE RESTRICT ON UPDATE CASCADE
;

ALTER TABLE "message" ADD CONSTRAINT "student_has_many_messages_sent" FOREIGN KEY ("sender_first_name", "sender_middle_name", "sender_last_name") REFERENCES "student" ("first_name", "middle_name", "last_name") ON DELETE CASCADE ON UPDATE CASCADE
;

ALTER TABLE "message" ADD CONSTRAINT "student_has_many_messages_received" FOREIGN KEY ("receiver_first_name", "receiver_middle_name", "receiver_last_name") REFERENCES "student" ("first_name", "middle_name", "last_name") ON DELETE CASCADE ON UPDATE CASCADE
;

ALTER TABLE "other_schema"."other_schema_table" ADD CONSTRAINT "account_has_other_schema_tables" FOREIGN KEY ("account_id") REFERENCES "account" ("id") ON DELETE CASCADE ON UPDATE CASCADE
;