import pgStructure, { Db } from "../../src/index";

let db: Db;
let desscriptiveDb: Db;
let nameDb: Db;
let reverseNameDb: Db;
let optimalNameDb: Db;
let reverseOptimalNameDb: Db;

export default async function getDb(): Promise<Db> {
  if (!(db instanceof Db)) {
    db = await pgStructure({ database: "pg-structure-test-main", user: "user", password: "password" });
  }
  return db;
}

export async function getOptimalDb(): Promise<Db> {
  if (!(desscriptiveDb instanceof Db)) {
    desscriptiveDb = await pgStructure(
      { database: "pg-structure-test-main", user: "user", password: "password" },
      { relationNameFunctions: "optimal" }
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

export async function getOptimalNameDb(): Promise<Db> {
  if (!(optimalNameDb instanceof Db)) {
    optimalNameDb = await pgStructure(
      { database: "pg-structure-test-relation-names", user: "user", password: "password" },
      { relationNameFunctions: "optimal" }
    );
  }
  return optimalNameDb;
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

export async function getReverseOptimalNameDb(): Promise<Db> {
  if (!(reverseOptimalNameDb instanceof Db)) {
    reverseOptimalNameDb = await pgStructure(
      {
        database: "pg-structure-test-relation-names-reverse",
        user: "user",
        password: "password",
      },
      { foreignKeyAliasTargetFirst: true, relationNameFunctions: "optimal" }
    );
  }
  return reverseOptimalNameDb;
}
