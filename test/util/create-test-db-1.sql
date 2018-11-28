/*
Created: 24.02.2016
Modified: 27.09.2017
Project: Node Test
Model: Node Test
Company: Ozsoft
Author: Özüm Eldoğan
Version: 1.0
Database: PostgreSQL 9.4
*/

-- Geçici fonksiyon: Schema mevcut değilse oluşturan fonksiyon.
    CREATE OR REPLACE FUNCTION temp_create_schema_if_not_exists (schema_array text[]) RETURNS TEXT AS $body$ DECLARE v_schema TEXT; BEGIN FOREACH v_schema IN ARRAY schema_array LOOP IF NOT EXISTS( SELECT 1 FROM pg_namespace WHERE nspname = v_schema ) THEN EXECUTE 'CREATE SCHEMA ' || quote_ident(v_schema); END IF; END LOOP; RETURN 'Press Execute button to continue...'; END; $body$ LANGUAGE 'plpgsql';
    SELECT temp_create_schema_if_not_exists(ARRAY['extra_modules']);
    DROP FUNCTION temp_create_schema_if_not_exists (schema_array text[]);

CREATE EXTENSION IF NOT EXISTS hstore SCHEMA extra_modules;           -- HStore

-- Create schemas section -------------------------------------------------

CREATE SCHEMA "other_schema"
;

COMMENT ON SCHEMA "other_schema" IS 'Other Schema Comment'
;

-- Create functions section -------------------------------------------------

CREATE FUNCTION "public"."t_updated_at"()
RETURNS trigger
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

CREATE TYPE "public"."composite_udt" AS
 ( "company_id" int4, "business_unit_id" int4 )
;
COMMENT ON TYPE composite_udt IS 'public type comment';
COMMENT ON COLUMN composite_udt.company_id IS 'public type column comment';


CREATE TYPE "public"."enumerated_udt" AS ENUM
 ( 'option_a', 'option_b', '"quote"', 'with,comma and "quote"' )
;

-- Create domain types section -------------------------------------------------

CREATE DOMAIN "public"."tax_no" AS Character varying(20) DEFAULT 1234 NOT NULL
;

-- Create tables section -------------------------------------------------

-- Table other_schema.other_schema_table

CREATE TABLE "other_schema"."other_schema_table"(
 "id" Serial NOT NULL,
 "name" Character varying(20),
 "account_id" Integer
)
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

-- Table public.account

CREATE TABLE "public"."account"(
 "id" Serial NOT NULL,
 "created_at" Timestamp(0) DEFAULT now() NOT NULL,
 "updated_at" Timestamp(0) DEFAULT now() NOT NULL,
 "owner_id" Integer,
 "is_active" Boolean DEFAULT true NOT NULL,
 "name" Character varying(50) NOT NULL,
 "field_default_empty" Text DEFAULT '',
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
;

COMMENT ON TABLE "public"."account" IS 'Firma bilgilerinin tutulduğu tablo. [pg-structure]{ "jsonkey": "jsonvalue" }[/pg-structure]'
;
COMMENT ON COLUMN "public"."account"."id" IS 'Kayıt no. [pg-structure]{ "columnExtra": 2 }[/pg-structure]'
;
COMMENT ON COLUMN "public"."account"."created_at" IS 'Kaydın oluşturulduğu zaman.'
;
COMMENT ON COLUMN "public"."account"."updated_at" IS 'Kaydın son güncellendiği zaman.'
;
COMMENT ON COLUMN "public"."account"."owner_id" IS 'Şirket sahibi.'
;
COMMENT ON COLUMN "public"."account"."is_active" IS 'Kayıt sistemde aktif olarak kullanılıyor mu. Silme işlemi olmadığından kalabalık yaratması istenmeyen kayıtlar pasif konuma getirilir.'
;
COMMENT ON COLUMN "public"."account"."name" IS 'Firma adı.'
;

-- Create indexes for table public.account

CREATE INDEX "IX_Relationship7" ON "public"."account" ("owner_id")
;

-- Add keys for table public.account

ALTER TABLE "public"."account" ADD CONSTRAINT "Key2" PRIMARY KEY ("id")
;

-- Create triggers for table public.account

CREATE TRIGGER "updated_at"
  BEFORE UPDATE
  ON "public"."account" FOR EACH ROW
 EXECUTE PROCEDURE "public"."t_updated_at"()
;

-- Table public.cart

CREATE TABLE "public"."cart"(
 "id" Serial NOT NULL,
 "created_at" Timestamp(0) DEFAULT now() NOT NULL,
 "updated_at" Timestamp(0) DEFAULT now() NOT NULL,
 "contact_id" Integer NOT NULL
)
;

COMMENT ON TABLE "public"."cart" IS 'Alışveriş sepetlerini tutan tablo.'
;
COMMENT ON COLUMN "public"."cart"."id" IS 'Kayıt no.'
;
COMMENT ON COLUMN "public"."cart"."created_at" IS 'Kaydın oluşturulduğu zaman.'
;
COMMENT ON COLUMN "public"."cart"."updated_at" IS 'Kaydın son güncellendiği zaman.'
;
COMMENT ON COLUMN "public"."cart"."contact_id" IS 'Alışveriş sepetinin sahibi.'
;

-- Create indexes for table public.cart

CREATE INDEX "IX_Relationship2" ON "public"."cart" ("contact_id")
;

-- Add keys for table public.cart

ALTER TABLE "public"."cart" ADD CONSTRAINT "Key3" PRIMARY KEY ("id")
;

-- Create triggers for table public.cart

CREATE TRIGGER "updated_at"
  BEFORE UPDATE
  ON "public"."cart" FOR EACH ROW
 EXECUTE PROCEDURE "public"."t_updated_at"()
;

-- Table public.cart_line_item

CREATE TABLE "public"."cart_line_item"(
 "cart_id" Integer NOT NULL,
 "product_id" Integer NOT NULL,
 "created_at" Timestamp(0) DEFAULT now() NOT NULL,
 "updated_at" Timestamp(0) DEFAULT now() NOT NULL,
 "quantity" Smallint DEFAULT 1 NOT NULL
)
;

COMMENT ON TABLE "public"."cart_line_item" IS 'Sepetteki ürünleri tutan tablo.'
;
COMMENT ON COLUMN "public"."cart_line_item"."created_at" IS 'Kaydın oluşturulduğu zaman.'
;
COMMENT ON COLUMN "public"."cart_line_item"."updated_at" IS 'Kaydın son güncellendiği zaman.'
;
COMMENT ON COLUMN "public"."cart_line_item"."quantity" IS 'Sepete eklenen ürün adedi.'
;

-- Add keys for table public.cart_line_item

ALTER TABLE "public"."cart_line_item" ADD CONSTRAINT "Key5" PRIMARY KEY ("cart_id","product_id")
;

-- Create triggers for table public.cart_line_item

CREATE TRIGGER "updated_at"
  BEFORE UPDATE
  ON "public"."cart_line_item" FOR EACH ROW
 EXECUTE PROCEDURE "public"."t_updated_at"()
;

-- Table public.cart_line_item_audit_log

CREATE TABLE "public"."cart_line_item_audit_log"(
 "id" Serial NOT NULL,
 "cart_id" Integer NOT NULL,
 "product_id" Integer NOT NULL,
 "created_at" Timestamp(0) DEFAULT now() NOT NULL,
 "updated_at" Timestamp(0) DEFAULT now() NOT NULL
)
;

COMMENT ON TABLE "public"."cart_line_item_audit_log" IS 'Sepete atılan ürünlerin loglarını tutan tablo. Multi primary keye ref veren tablonun test edilmesi için.'
;
COMMENT ON COLUMN "public"."cart_line_item_audit_log"."id" IS 'Kayıt no.'
;
COMMENT ON COLUMN "public"."cart_line_item_audit_log"."cart_id" IS 'Sepet atılan ürünün sepet id''si.'
;
COMMENT ON COLUMN "public"."cart_line_item_audit_log"."product_id" IS 'Sepet atılan ürünün ürün id''si.'
;
COMMENT ON COLUMN "public"."cart_line_item_audit_log"."created_at" IS 'Kaydın oluşturulduğu zaman.'
;
COMMENT ON COLUMN "public"."cart_line_item_audit_log"."updated_at" IS 'Kaydın son güncellendiği zaman.'
;

-- Create indexes for table public.cart_line_item_audit_log

CREATE INDEX "IX_Relationship5" ON "public"."cart_line_item_audit_log" ("cart_id","product_id")
;

-- Add keys for table public.cart_line_item_audit_log

ALTER TABLE "public"."cart_line_item_audit_log" ADD CONSTRAINT "Key7" PRIMARY KEY ("id")
;

-- Create triggers for table public.cart_line_item_audit_log

CREATE TRIGGER "updated_at"
  BEFORE UPDATE
  ON "public"."cart_line_item_audit_log" FOR EACH ROW
 EXECUTE PROCEDURE "public"."t_updated_at"()
;

-- Table public.cart_line_item_cross_composite

CREATE TABLE "public"."cart_line_item_cross_composite"(
 "id" Serial NOT NULL,
 "primary_cart_id" Integer,
 "primary_product_id" Integer,
 "secondary_cart_id" Integer,
 "secondary_product_id" Integer
)
;

COMMENT ON TABLE "public"."cart_line_item_cross_composite" IS 'Composite key içeren many to many tablo testi için oluşturulmuş olan tablo.'
;
COMMENT ON COLUMN "public"."cart_line_item_cross_composite"."id" IS 'Kayıt no.'
;
COMMENT ON COLUMN "public"."cart_line_item_cross_composite"."primary_cart_id" IS 'Birincil sepet id.'
;
COMMENT ON COLUMN "public"."cart_line_item_cross_composite"."primary_product_id" IS 'Birincil ürün id.'
;
COMMENT ON COLUMN "public"."cart_line_item_cross_composite"."secondary_cart_id" IS 'İkincil sepet id.'
;
COMMENT ON COLUMN "public"."cart_line_item_cross_composite"."secondary_product_id" IS 'İkincil ürün id.'
;

-- Create indexes for table public.cart_line_item_cross_composite

CREATE INDEX "IX_Relationship8" ON "public"."cart_line_item_cross_composite" ("primary_cart_id","primary_product_id")
;

CREATE INDEX "IX_Relationship9" ON "public"."cart_line_item_cross_composite" ("secondary_cart_id","secondary_product_id")
;

-- Add keys for table public.cart_line_item_cross_composite

ALTER TABLE "public"."cart_line_item_cross_composite" ADD CONSTRAINT "Key8" PRIMARY KEY ("id")
;

-- Table public.class

CREATE TABLE "public"."class"(
 "name" Character varying(20) NOT NULL,
 "teacher_name" Character varying(20) NOT NULL,
 "teacher_surname" Character varying(20) NOT NULL,
 "is_popular" Boolean
)
;

COMMENT ON TABLE "public"."class" IS '3''lü composite key test etmek için oluşturulmuş yapay ikinci tablo.'
;
COMMENT ON COLUMN "public"."class"."name" IS 'Ders ismi'
;
COMMENT ON COLUMN "public"."class"."teacher_name" IS 'Dersi veren hocanın ismi'
;
COMMENT ON COLUMN "public"."class"."teacher_surname" IS 'Dersi veren hocanın soy ismi'
;
COMMENT ON COLUMN "public"."class"."is_popular" IS 'Popüler ders mi?'
;

-- Add keys for table public.class

ALTER TABLE "public"."class" ADD CONSTRAINT "Key10" PRIMARY KEY ("name","teacher_name","teacher_surname")
;

-- Table public.class_register

CREATE TABLE "public"."class_register"(
 "name" Character varying(20) NOT NULL,
 "teacher_name" Character varying(20) NOT NULL,
 "teacher_surname" Character varying(20) NOT NULL,
 "first_name" Character varying(20) NOT NULL,
 "middle_name" Character varying(20) NOT NULL,
 "last_name" Character varying(20) NOT NULL
)
;

COMMENT ON TABLE "public"."class_register" IS '3 lü komposit key ile birleşen many to many tabloları test etmek için yapay tablo.'
;

-- Add keys for table public.class_register

ALTER TABLE "public"."class_register" ADD CONSTRAINT "Key11" PRIMARY KEY ("name","teacher_name","teacher_surname","first_name","middle_name","last_name")
;

-- Table public.contact

CREATE TABLE "public"."contact"(
 "id" Serial NOT NULL,
 "created_at" Timestamp(0) DEFAULT now() NOT NULL,
 "updated_at" Timestamp(0) DEFAULT now() NOT NULL,
 "name" Character varying(20) DEFAULT 'oz'::character varying NOT NULL,
 "surname" Character varying(20) DEFAULT 'O''Reilly'::character varying NOT NULL,
 "email" Character varying(20) DEFAULT 'x"x@x.com'::character varying NOT NULL,
 "birth_date" Date DEFAULT '2010-01-01'::date NOT NULL,
 "is_active" Boolean DEFAULT true NOT NULL,
 "company_id" Integer NOT NULL,
 "second_company_id" Integer,
 "custom" Json,
 "custom_hstore" "extra_modules"."hstore"
)
;

COMMENT ON TABLE "public"."contact" IS 'Kişi bilgilerini tutan tablo.'
;
COMMENT ON COLUMN "public"."contact"."id" IS 'Kayıt no.'
;
COMMENT ON COLUMN "public"."contact"."created_at" IS 'Kaydın oluşturulduğu zaman.'
;
COMMENT ON COLUMN "public"."contact"."updated_at" IS 'Kaydın son güncellendiği zaman.'
;
COMMENT ON COLUMN "public"."contact"."name" IS 'Kullanıcının adı.'
;
COMMENT ON COLUMN "public"."contact"."surname" IS 'Kullanıcının soyadı.'
;
COMMENT ON COLUMN "public"."contact"."email" IS 'Kullanıcının e-posta adresi.'
;
COMMENT ON COLUMN "public"."contact"."birth_date" IS 'Doğum tarihi.'
;
COMMENT ON COLUMN "public"."contact"."is_active" IS 'Kayıt sistemde aktif olarak kullanılıyor mu. Silme işlemi olmadığından kalabalık yaratması istenmeyen kayıtlar pasif konuma getirilir.'
;
COMMENT ON COLUMN "public"."contact"."company_id" IS 'İrtibatın dahil olduğu firma.'
;
COMMENT ON COLUMN "public"."contact"."second_company_id" IS 'İrtibatın ikinci şirketi. (Aynı tablodan aynı tabloya birden fazla relation varsa test etmek için)'
;
COMMENT ON COLUMN "public"."contact"."custom" IS 'JSON formatında custom değerleri tutan alan.'
;
COMMENT ON COLUMN "public"."contact"."custom_hstore" IS 'HSTORE formatında custom değerleri tutan alan'
;

-- Create indexes for table public.contact

CREATE INDEX "IX_Relationship1" ON "public"."contact" ("company_id")
;

CREATE INDEX "IX_Relationship6" ON "public"."contact" ("second_company_id")
;

CREATE UNIQUE INDEX "IX_Unique_Full_Name" ON "public"."contact" ("name","surname")
;

CREATE UNIQUE INDEX "IX_Unique_Mail_Surname" ON "public"."contact" ("email","surname")
;

-- Add keys for table public.contact

ALTER TABLE "public"."contact" ADD CONSTRAINT "Key1" PRIMARY KEY ("id")
;

ALTER TABLE "public"."contact" ADD CONSTRAINT "email" UNIQUE ("email")
;

ALTER TABLE "public"."contact" ADD CONSTRAINT "nameandemail" UNIQUE ("name","email")
;

-- Create triggers for table public.contact

CREATE TRIGGER "updated_at"
  BEFORE UPDATE
  ON "public"."contact" FOR EACH ROW
 EXECUTE PROCEDURE "public"."t_updated_at"()
;

-- Table public.message

CREATE TABLE "public"."message"(
 "id" Serial NOT NULL,
 "sender_first_name" Character varying(20),
 "sender_middle_name" Character varying(20),
 "sender_last_name" Character varying(20),
 "receiver_first_name" Character varying(20),
 "receiver_middle_name" Character varying(20),
 "receiver_last_name" Character varying(20)
)
;

COMMENT ON TABLE "public"."message" IS '3''lü composite key içeren self referencing tabloları test etmek için yapay tablo.'
;
COMMENT ON COLUMN "public"."message"."id" IS 'Kayıt no'
;
COMMENT ON COLUMN "public"."message"."sender_first_name" IS 'Gönderen ilk ismi'
;
COMMENT ON COLUMN "public"."message"."sender_middle_name" IS 'Gönderen orta ismi'
;
COMMENT ON COLUMN "public"."message"."sender_last_name" IS 'Gönderen soy ismi'
;
COMMENT ON COLUMN "public"."message"."receiver_first_name" IS 'Mesaj alanın ilk ismi'
;
COMMENT ON COLUMN "public"."message"."receiver_middle_name" IS 'Mesaj alanın orta ismi.'
;
COMMENT ON COLUMN "public"."message"."receiver_last_name" IS 'Mesaj alanın soy ismi.'
;

-- Create indexes for table public.message

CREATE INDEX "IX_Relationship11" ON "public"."message" ("sender_first_name","sender_middle_name","sender_last_name")
;

CREATE INDEX "IX_Relationship12" ON "public"."message" ("receiver_first_name","receiver_middle_name","receiver_last_name")
;

-- Add keys for table public.message

ALTER TABLE "public"."message" ADD CONSTRAINT "Key12" PRIMARY KEY ("id")
;

-- Table public.product

CREATE TABLE "public"."product"(
 "id" Serial NOT NULL,
 "created_at" Timestamp(0) DEFAULT now() NOT NULL,
 "updated_at" Timestamp(0) DEFAULT now() NOT NULL,
 "name" Character varying(20) NOT NULL,
 "product_category_id" Integer NOT NULL
)
;

COMMENT ON TABLE "public"."product" IS 'Ürünleri tutan tablo.'
;
COMMENT ON COLUMN "public"."product"."id" IS 'Kayıt no.'
;
COMMENT ON COLUMN "public"."product"."created_at" IS 'Kaydın oluşturulduğu zaman.'
;
COMMENT ON COLUMN "public"."product"."updated_at" IS 'Kaydın son güncellendiği zaman.'
;
COMMENT ON COLUMN "public"."product"."name" IS 'Ürünün ismi'
;
COMMENT ON COLUMN "public"."product"."product_category_id" IS 'Ürün kategorisi'
;

-- Create indexes for table public.product

CREATE INDEX "IX_Relationship4" ON "public"."product" ("product_category_id")
;

-- Add keys for table public.product

ALTER TABLE "public"."product" ADD CONSTRAINT "Key4" PRIMARY KEY ("id")
;

-- Create triggers for table public.product

CREATE TRIGGER "updated_at"
  BEFORE UPDATE
  ON "public"."product" FOR EACH ROW
 EXECUTE PROCEDURE "public"."t_updated_at"()
;

-- Table public.product_category

CREATE TABLE "public"."product_category"(
 "id" Serial NOT NULL,
 "parent_category_id" Integer,
 "name" Character varying(20) NOT NULL
)
;

COMMENT ON TABLE "public"."product_category" IS 'Ürün kategorilerini tutan tablo.'
;
COMMENT ON COLUMN "public"."product_category"."id" IS 'Kayıt no.'
;
COMMENT ON COLUMN "public"."product_category"."name" IS 'Ürün kategori ismi.'
;

-- Create indexes for table public.product_category

CREATE INDEX "IX_Relationship3" ON "public"."product_category" ("parent_category_id")
;

-- Add keys for table public.product_category

ALTER TABLE "public"."product_category" ADD CONSTRAINT "Key6" PRIMARY KEY ("id")
;

-- Table public.student

CREATE TABLE "public"."student"(
 "first_name" Character varying(20) NOT NULL,
 "middle_name" Character varying(20) NOT NULL,
 "last_name" Character varying(20) NOT NULL,
 "class" Smallint
)
;

COMMENT ON TABLE "public"."student" IS '3''lü composit key test için oluşturulmuş yapay tablo.'
;
COMMENT ON COLUMN "public"."student"."first_name" IS 'Adı.'
;
COMMENT ON COLUMN "public"."student"."middle_name" IS 'Orta ismi'
;
COMMENT ON COLUMN "public"."student"."last_name" IS 'Soy ismi'
;

-- Add keys for table public.student

ALTER TABLE "public"."student" ADD CONSTRAINT "Key9" PRIMARY KEY ("first_name","middle_name","last_name")
;

-- Table public.type_table

CREATE TABLE "public"."type_table"(
 "id" Serial NOT NULL,
 "person_tax" "public"."tax_no",
 "name" Character varying(20) DEFAULT 'oz'::character varying,
 "company" "public"."composite_udt",
 "options" "public"."enumerated_udt"
)
;

COMMENT ON TABLE "public"."type_table" IS 'Table to test custom data types.'
;
COMMENT ON COLUMN "public"."type_table"."id" IS 'Kayıt no.'
;
COMMENT ON COLUMN "public"."type_table"."person_tax" IS 'Tax number of person.'
;
COMMENT ON COLUMN "public"."type_table"."name" IS 'Name of the person'
;
COMMENT ON COLUMN "public"."type_table"."options" IS 'Options of person'
;

-- Add keys for table public.type_table

ALTER TABLE "public"."type_table" ADD CONSTRAINT "type_table_key" PRIMARY KEY ("id")
;

-- Create views section -------------------------------------------------

CREATE VIEW "public"."v_contacts_with_account" AS
SELECT "public"."account"."id" AS "account_id", "public"."account"."name" AS "account_name", "public"."contact"."name" AS "contact_name"
FROM "public"."account", "public"."contact"
WHERE contact.company_id = account.id
;

CREATE VIEW "other_schema"."v_contacts_with_account" AS
SELECT "name"
FROM "other_schema"."other_schema_table"
;

COMMENT ON VIEW "other_schema"."v_contacts_with_account" IS 'Diğer bir şemada aynı isimli view ile çakışma olup olmadığını test için.'
;

CREATE VIEW "other_schema"."contact" AS
SELECT "id"
FROM "other_schema"."other_schema_table"
;

COMMENT ON VIEW "other_schema"."contact" IS 'public schema''da bulunan bir tablo ismi ile aynı isimli view. Çakışma testi için.'
;

-- Create relationships section -------------------------------------------------

ALTER TABLE "public"."contact" ADD CONSTRAINT "account_contacts" FOREIGN KEY ("company_id") REFERENCES "public"."account" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
;

ALTER TABLE "public"."contact" ADD CONSTRAINT "account_second_contacts" FOREIGN KEY ("second_company_id") REFERENCES "public"."account" ("id") ON DELETE SET NULL ON UPDATE CASCADE
;

ALTER TABLE "public"."account" ADD CONSTRAINT "contact_has_companies" FOREIGN KEY ("owner_id") REFERENCES "public"."contact" ("id") ON DELETE SET NULL ON UPDATE CASCADE
;

ALTER TABLE "public"."cart" ADD CONSTRAINT "contact_has_carts" FOREIGN KEY ("contact_id") REFERENCES "public"."contact" ("id") ON DELETE CASCADE ON UPDATE CASCADE
;

COMMENT ON CONSTRAINT "contact_has_carts" ON "public"."cart" IS 'Constraint description. [pg-structure]{ "o2mName": "carts", "name": "O''Reilly" }[/pg-structure]'
;

ALTER TABLE "public"."product" ADD CONSTRAINT "Relationship4" FOREIGN KEY ("product_category_id") REFERENCES "public"."product_category" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
;

ALTER TABLE "public"."cart_line_item" ADD CONSTRAINT "cart_has_products" FOREIGN KEY ("cart_id") REFERENCES "public"."cart" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
;

COMMENT ON CONSTRAINT "cart_has_products" ON "public"."cart_line_item" IS '[pg-structure]
{
    name: {
        o2m: json_cart_line_items,
        m2o: json_cart
    }
}
[/pg-structure]'
;

ALTER TABLE "public"."cart_line_item" ADD CONSTRAINT "cst_cart_line_items, cst_product, cst_product" FOREIGN KEY ("product_id") REFERENCES "public"."product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
;

ALTER TABLE "public"."product_category" ADD CONSTRAINT "product_category_has_parent_category" FOREIGN KEY ("parent_category_id") REFERENCES "public"."product_category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
;

ALTER TABLE "public"."cart_line_item_audit_log" ADD CONSTRAINT "cart_line_item_has_audit_logs" FOREIGN KEY ("cart_id", "product_id") REFERENCES "public"."cart_line_item" ("cart_id", "product_id") ON DELETE NO ACTION ON UPDATE NO ACTION
;

ALTER TABLE "public"."cart_line_item_cross_composite" ADD CONSTRAINT "cart_line_item_has_many_primary_cross" FOREIGN KEY ("primary_cart_id", "primary_product_id") REFERENCES "public"."cart_line_item" ("cart_id", "product_id") ON DELETE NO ACTION ON UPDATE NO ACTION
;

ALTER TABLE "public"."cart_line_item_cross_composite" ADD CONSTRAINT "cart_line_item_has_many_secondary_cross" FOREIGN KEY ("secondary_cart_id", "secondary_product_id") REFERENCES "public"."cart_line_item" ("cart_id", "product_id") ON DELETE NO ACTION ON UPDATE NO ACTION
;

ALTER TABLE "public"."class_register" ADD CONSTRAINT "student_has_many_classes" FOREIGN KEY ("first_name", "middle_name", "last_name") REFERENCES "public"."student" ("first_name", "middle_name", "last_name") ON DELETE RESTRICT ON UPDATE CASCADE
;

ALTER TABLE "public"."class_register" ADD CONSTRAINT "class_has_many_students" FOREIGN KEY ("name", "teacher_name", "teacher_surname") REFERENCES "public"."class" ("name", "teacher_name", "teacher_surname") ON DELETE RESTRICT ON UPDATE CASCADE
;

ALTER TABLE "public"."message" ADD CONSTRAINT "student_has_many_messages_received" FOREIGN KEY ("receiver_first_name", "receiver_middle_name", "receiver_last_name") REFERENCES "public"."student" ("first_name", "middle_name", "last_name") ON DELETE CASCADE ON UPDATE CASCADE
;

COMMENT ON CONSTRAINT "student_has_many_messages_received" ON "public"."message" IS '[pg-structure]
{
    name: {
        m2m: json_sender
    }
}
[/pg-structure]'
;

ALTER TABLE "public"."message" ADD CONSTRAINT "student_has_many_messages_sent" FOREIGN KEY ("sender_first_name", "sender_middle_name", "sender_last_name") REFERENCES "public"."student" ("first_name", "middle_name", "last_name") ON DELETE CASCADE ON UPDATE CASCADE
;

ALTER TABLE "other_schema"."other_schema_table" ADD CONSTRAINT "account_has_other_schema_tables" FOREIGN KEY ("account_id") REFERENCES "public"."account" ("id") ON DELETE CASCADE ON UPDATE CASCADE
;





COMMENT ON SCHEMA public
IS 'public schema comment';
