/*
 Created: 02/10/2014
 Modified: 29/12/2014
 Project: SequelizeTest
 Model: SequelizeTest
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
    "name" Character varying(20) DEFAULT 'oz' NOT NULL,
    "surname" Character varying(20) DEFAULT 'O''Reilly' NOT NULL,
    "email" Character varying(20) DEFAULT 'x"x@x.com' NOT NULL,
    "birth_date" Date DEFAULT '2010-01-01' NOT NULL,
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
    "contact_id" Integer NOT NULL,
    "currency_id" Integer
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
COMMENT ON COLUMN "cart"."currency_id" IS 'Sepetin toplamını göstermek için kullanılacak olan currency id.'
;

INSERT INTO cart ("contact_id", "currency_id")
VALUES (1, 1);

INSERT INTO cart ("contact_id", "currency_id")
VALUES (4, 1);

INSERT INTO cart ("contact_id", "currency_id")
VALUES (3, 2);

INSERT INTO cart ("contact_id", "currency_id")
VALUES (2, 3);

INSERT INTO cart ("contact_id", "currency_id")
VALUES (1, 2);

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
    "quantity" Smallint DEFAULT 1 NOT NULL,
    "price" Numeric(30,6),
    "currency_id" Integer
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
COMMENT ON COLUMN "cart_line_item"."price" IS 'Satın alınma tarihindeki fiyat.'
;
COMMENT ON COLUMN "cart_line_item"."currency_id" IS 'Ürünün fiyatının para birimi.'
;

INSERT INTO cart_line_item ("cart_id", "product_id", "quantity", "price", "currency_id")
VALUES (4, 3, 3, 23.0, 1);

INSERT INTO cart_line_item ("cart_id", "product_id", "quantity", "price", "currency_id")
VALUES (4, 1, 1, 4.0, 2);

INSERT INTO cart_line_item ("cart_id", "product_id", "quantity", "price", "currency_id")
VALUES (3, 3, 1, 7.5, 3);

INSERT INTO cart_line_item ("cart_id", "product_id", "quantity", "price", "currency_id")
VALUES (3, 5, 2, 92.1, 1);

INSERT INTO cart_line_item ("cart_id", "product_id", "quantity", "price", "currency_id")
VALUES (2, 4, 1, 32, 2);

INSERT INTO cart_line_item ("cart_id", "product_id", "quantity", "price", "currency_id")
VALUES (2, 1, 1, 23, 3);

INSERT INTO cart_line_item ("cart_id", "product_id", "quantity", "price", "currency_id")
VALUES (1, 3, 1, 8, 1);

INSERT INTO cart_line_item ("cart_id", "product_id", "quantity", "price", "currency_id")
VALUES (1, 2, 3, 11.35, 2);

INSERT INTO cart_line_item ("cart_id", "product_id", "quantity", "price", "currency_id")
VALUES (1, 1, 2, 13, 1);

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


-- Add keys for table product_category

ALTER TABLE "product_category" ADD CONSTRAINT "Key6" PRIMARY KEY ("id")
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

INSERT INTO other_schema.other_schema_table ("id", "name", "account_id")
VALUES (1, 'Super', 1);

INSERT INTO other_schema.other_schema_table ("id", "name", "account_id")
VALUES (2, 'Mega', 1);

INSERT INTO other_schema.other_schema_table ("id", "name", "account_id")
VALUES (3, 'Other', 2);

INSERT INTO other_schema.other_schema_table ("id", "name", "account_id")
VALUES (4, 'Shoe', 2);

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

INSERT INTO public.type_table ("id", "person_tax", "name", "company", "options")
VALUES (1, E'62736273', E'John', E'(1,2)', E'option_a');

INSERT INTO public.type_table ("id", "person_tax", "name", "company", "options")
VALUES (2, E'83736282', E'Michael', E'(4,99)', E'option_b');

-- Add keys for table type_table

ALTER TABLE "type_table" ADD CONSTRAINT "type_table_key" PRIMARY KEY ("id")
;

-- Table currency

CREATE TABLE "currency"(
    "id" Serial NOT NULL,
    "name" Character varying(20) NOT NULL,
    "exchange_rate" Numeric(6,4) NOT NULL
)
WITH (OIDS=FALSE)
;

COMMENT ON TABLE "currency" IS 'Para birimlerini tutan tablo.'
;
COMMENT ON COLUMN "currency"."id" IS 'Kayıt no.'
;
COMMENT ON COLUMN "currency"."name" IS 'Para birimi ismi'
;
COMMENT ON COLUMN "currency"."exchange_rate" IS 'Para birimi değeri.'
;

INSERT INTO currency (name, exchange_rate) VALUES ('TL', 1);
INSERT INTO currency (name, exchange_rate) VALUES ('USD', 2.21);
INSERT INTO currency (name, exchange_rate) VALUES ('EUR', 3.01);


-- Add keys for table currency

ALTER TABLE "currency" ADD CONSTRAINT "Key14" PRIMARY KEY ("id")
;

-- Table cart_currency_statistic

CREATE TABLE "cart_currency_statistic"(
    "cart_id" Integer NOT NULL,
    "currency_id" Integer NOT NULL
)
WITH (OIDS=FALSE)
;
COMMENT ON COLUMN "cart_currency_statistic"."cart_id" IS 'Sepet id.'
;

INSERT INTO cart_currency_statistic (cart_id, currency_id) VALUES (1, 1);
INSERT INTO cart_currency_statistic (cart_id, currency_id) VALUES (2, 1);
INSERT INTO cart_currency_statistic (cart_id, currency_id) VALUES (3, 3);

-- Add keys for table cart_currency_statistic

ALTER TABLE "cart_currency_statistic" ADD CONSTRAINT "Key15" PRIMARY KEY ("cart_id","currency_id")
;

-- Table empty_table

CREATE TABLE "empty_table"(
)
WITH (OIDS=FALSE)
;

COMMENT ON TABLE "empty_table" IS 'Test table without columns.'
;

-- Table alternative_product

CREATE TABLE "alternative_product"(
    "product_id" Integer NOT NULL,
    "alternative_product_id" Integer NOT NULL,
    "suggestion_type_id" Integer
)
WITH (OIDS=FALSE)
;

COMMENT ON TABLE "alternative_product" IS 'Table for storing alternative products.'
;

-- Add keys for table alternative_product

ALTER TABLE "alternative_product" ADD CONSTRAINT "Key17" PRIMARY KEY ("product_id","alternative_product_id")
;

-- Table suggestion_type

CREATE TABLE "suggestion_type"(
    "name" Character varying(20),
    "id" Serial NOT NULL
)
WITH (OIDS=FALSE)
;

COMMENT ON TABLE "suggestion_type" IS 'Suggestion types for alternative products.'
;
COMMENT ON COLUMN "suggestion_type"."id" IS 'Kayıt no.'
;

-- Add keys for table suggestion_type

ALTER TABLE "suggestion_type" ADD CONSTRAINT "Key18" PRIMARY KEY ("id")
;

-- Create relationships section -------------------------------------------------

    ALTER TABLE "contact" ADD CONSTRAINT "primary_contacts" FOREIGN KEY ("company_id") REFERENCES "account" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
;

ALTER TABLE "cart" ADD CONSTRAINT "contact_carts" FOREIGN KEY ("contact_id") REFERENCES "contact" ("id") ON DELETE CASCADE ON UPDATE CASCADE
;

ALTER TABLE "cart_line_item" ADD CONSTRAINT "cart_cart_line_items" FOREIGN KEY ("cart_id") REFERENCES "cart" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
;

ALTER TABLE "cart_line_item" ADD CONSTRAINT "product_cart_line_items" FOREIGN KEY ("product_id") REFERENCES "product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
;

ALTER TABLE "product_category" ADD CONSTRAINT "child_product_categories" FOREIGN KEY ("parent_category_id") REFERENCES "product_category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
;

ALTER TABLE "product" ADD CONSTRAINT "product_category_products" FOREIGN KEY ("product_category_id") REFERENCES "product_category" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
;

ALTER TABLE "contact" ADD CONSTRAINT "secondary_contacts" FOREIGN KEY ("second_company_id") REFERENCES "account" ("id") ON DELETE SET NULL ON UPDATE CASCADE
;

ALTER TABLE "account" ADD CONSTRAINT "owned_companies" FOREIGN KEY ("owner_id") REFERENCES "contact" ("id") ON DELETE SET NULL ON UPDATE CASCADE
;

ALTER TABLE "other_schema"."other_schema_table" ADD CONSTRAINT "other_schema_tables" FOREIGN KEY ("account_id") REFERENCES "account" ("id") ON DELETE CASCADE ON UPDATE CASCADE
;

ALTER TABLE "cart_line_item" ADD CONSTRAINT "cart_line_items" FOREIGN KEY ("currency_id") REFERENCES "currency" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
;

ALTER TABLE "cart" ADD CONSTRAINT "currency_carts" FOREIGN KEY ("currency_id") REFERENCES "currency" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
;

ALTER TABLE "cart_currency_statistic" ADD CONSTRAINT "cart_cart_currency_statistics" FOREIGN KEY ("cart_id") REFERENCES "cart" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
;

ALTER TABLE "cart_currency_statistic" ADD CONSTRAINT "currency_cart_currency_statistics" FOREIGN KEY ("currency_id") REFERENCES "currency" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
;

ALTER TABLE "alternative_product" ADD CONSTRAINT "source_alternative_products" FOREIGN KEY ("product_id") REFERENCES "product" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
;

ALTER TABLE "alternative_product" ADD CONSTRAINT "destination_alternative_products" FOREIGN KEY ("alternative_product_id") REFERENCES "product" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
;

ALTER TABLE "alternative_product" ADD CONSTRAINT "suggestion_type_alternative_products" FOREIGN KEY ("suggestion_type_id") REFERENCES "suggestion_type" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
;






