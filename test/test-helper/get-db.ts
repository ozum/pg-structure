import pgStructure, { Db } from "../../src/index";

let db: Db;
let desscriptiveDb: Db;
let nameDb: Db;
let reverseNameDb: Db;
let descriptiveNameDb: Db;
let reverseDescriptiveNameDb: Db;

export default async function getDb(): Promise<Db> {
  if (!(db instanceof Db)) {
    db = await pgStructure({ database: "pg-structure-test-main", user: "user", password: "password" });
  }
  return db;
}

export async function getDescriptiveDb(): Promise<Db> {
  if (!(desscriptiveDb instanceof Db)) {
    desscriptiveDb = await pgStructure(
      { database: "pg-structure-test-main", user: "user", password: "password" },
      { relationNameFunction: "descriptive" }
    );
  }
  return desscriptiveDb;
}

export async function getRelationNameDb(): Promise<Db> {
  if (!(nameDb instanceof Db)) {
    nameDb = await pgStructure({ database: "pg-structure-test-relation-names", user: "user", password: "password" });
  }
  return nameDb;
}

export async function getDescriptiveNameDb(): Promise<Db> {
  if (!(descriptiveNameDb instanceof Db)) {
    descriptiveNameDb = await pgStructure(
      { database: "pg-structure-test-relation-names", user: "user", password: "password" },
      { relationNameFunction: "descriptive" }
    );
  }
  return descriptiveNameDb;
}

export async function getReverseRelationNameDb(): Promise<Db> {
  if (!(reverseNameDb instanceof Db)) {
    reverseNameDb = await pgStructure(
      {
        database: "pg-structure-test-relation-names-reverse",
        user: "user",
        password: "password",
      },
      { foreignKeyAliasTargetFirst: true }
    );
  }
  return reverseNameDb;
}

export async function getReverseDescriptiveNameDb(): Promise<Db> {
  if (!(reverseDescriptiveNameDb instanceof Db)) {
    reverseDescriptiveNameDb = await pgStructure(
      {
        database: "pg-structure-test-relation-names-reverse",
        user: "user",
        password: "password",
      },
      { foreignKeyAliasTargetFirst: true, relationNameFunction: "descriptive" }
    );
  }
  return reverseDescriptiveNameDb;
}
