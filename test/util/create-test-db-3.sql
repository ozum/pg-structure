/*
Created: 29.11.2015
Modified: 29.11.2015
Model: PostgreSQL 9.4
Database: PostgreSQL 9.4
*/



-- Create tables section -------------------------------------------------

-- Table account

CREATE TABLE "account"(
 "id" Serial NOT NULL,
 "name" Character varying(20)
)
;
COMMENT ON COLUMN "account"."id" IS 'Kayıt no.'
;

-- Add keys for table account

ALTER TABLE "account" ADD CONSTRAINT "Key1" PRIMARY KEY ("id")
;

-- Table product

CREATE TABLE "product"(
 "id" Serial NOT NULL,
 "name" Character varying(20),
 "purchase_currency_id" Integer,
 "selling_currency_id" Integer,
 "account_id" Integer
)
;
COMMENT ON COLUMN "product"."id" IS 'Kayıt no.'
;

-- Create indexes for table product

CREATE INDEX "IX_purchase_currency_products" ON "product" ("purchase_currency_id")
;

CREATE INDEX "IX_selling_currency_products" ON "product" ("selling_currency_id")
;

CREATE INDEX "IX_account_products" ON "product" ("account_id")
;

-- Add keys for table product

ALTER TABLE "product" ADD CONSTRAINT "Key2" PRIMARY KEY ("id")
;

-- Table currency

CREATE TABLE "currency"(
 "id" Serial NOT NULL,
 "name" Character varying(20)
)
;
COMMENT ON COLUMN "currency"."id" IS 'Kayıt no.'
;

-- Add keys for table currency

ALTER TABLE "currency" ADD CONSTRAINT "Key3" PRIMARY KEY ("id")
;

-- Table contact

CREATE TABLE "contact"(
 "id" Serial NOT NULL,
 "name" Character varying(20),
 "account_id" Integer
)
;
COMMENT ON COLUMN "contact"."id" IS 'Kayıt no.'
;

-- Create indexes for table contact

CREATE INDEX "IX_account_contacts" ON "contact" ("account_id")
;

-- Add keys for table contact

ALTER TABLE "contact" ADD CONSTRAINT "Key4" PRIMARY KEY ("id")
;

-- Create relationships section -------------------------------------------------

ALTER TABLE "product" ADD CONSTRAINT "purchase_currency_products" FOREIGN KEY ("purchase_currency_id") REFERENCES "currency" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
;

ALTER TABLE "product" ADD CONSTRAINT "selling_currency_products" FOREIGN KEY ("selling_currency_id") REFERENCES "currency" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
;

ALTER TABLE "product" ADD CONSTRAINT "account_products" FOREIGN KEY ("account_id") REFERENCES "account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
;

ALTER TABLE "contact" ADD CONSTRAINT "account_contacts" FOREIGN KEY ("account_id") REFERENCES "account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
;





