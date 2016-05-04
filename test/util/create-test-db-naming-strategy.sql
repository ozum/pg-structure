/*
Created: 03.05.2016
Modified: 03.05.2016
Project: pg-structure
Model: Naming Strategy
Author: Özüm Eldoğan
Database: PostgreSQL 9.4
*/



-- Create tables section -------------------------------------------------

-- Table Account

CREATE TABLE "Account"(
 "id" Integer NOT NULL,
 "organizationId" Integer NOT NULL,
 "primaryContactId" Integer
)
;

-- Create indexes for table Account

CREATE INDEX "IXContactAccounts" ON "Account" ("primaryContactId","organizationId")
;

-- Add keys for table Account

ALTER TABLE "Account" ADD CONSTRAINT "Account_Key1" PRIMARY KEY ("id","organizationId")
;

-- Table Organization

CREATE TABLE "Organization"(
 "id" Serial NOT NULL
)
;

-- Add keys for table Organization

ALTER TABLE "Organization" ADD CONSTRAINT "Organization_Key1" PRIMARY KEY ("id")
;

-- Table Contact

CREATE TABLE "Contact"(
 "id" Integer NOT NULL,
 "organizationId" Integer NOT NULL,
 "accountId" Integer
)
;

-- Create indexes for table Contact

CREATE INDEX "IXAccountContacts" ON "Contact" ("accountId","organizationId")
;

-- Add keys for table Contact

ALTER TABLE "Contact" ADD CONSTRAINT "Contact_Key1" PRIMARY KEY ("id","organizationId")
;

-- Table Address

CREATE TABLE "Address"(
 "id" Serial NOT NULL,
 "organizationId" Integer,
 "contactId" Integer,
 "accountId" Integer
)
;

-- Create indexes for table Address

CREATE INDEX "IXContactAddresss" ON "Address" ("organizationId","contactId")
;

CREATE INDEX "IXAccountAddresss" ON "Address" ("accountId","organizationId")
;

-- Add keys for table Address

ALTER TABLE "Address" ADD CONSTRAINT "Address_Key1" PRIMARY KEY ("id")
;

-- Create relationships section ------------------------------------------------- 

ALTER TABLE "Account" ADD CONSTRAINT "OrganizationAccounts" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
;

ALTER TABLE "Contact" ADD CONSTRAINT "AccountContacts" FOREIGN KEY ("accountId", "organizationId") REFERENCES "Account" ("id", "organizationId") ON DELETE CASCADE ON UPDATE CASCADE
;

ALTER TABLE "Contact" ADD CONSTRAINT "OrganizationContacts" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
;

ALTER TABLE "Address" ADD CONSTRAINT "ContactAddresses" FOREIGN KEY ("contactId", "organizationId") REFERENCES "Contact" ("id", "organizationId") ON DELETE CASCADE ON UPDATE CASCADE
;

ALTER TABLE "Address" ADD CONSTRAINT "AccountAddresses" FOREIGN KEY ("accountId", "organizationId") REFERENCES "Account" ("id", "organizationId") ON DELETE CASCADE ON UPDATE CASCADE
;

ALTER TABLE "Account" ADD CONSTRAINT "ContactAccounts" FOREIGN KEY ("primaryContactId", "organizationId") REFERENCES "Contact" ("id", "organizationId") ON DELETE CASCADE ON UPDATE CASCADE
;






