import { Db, Sequence, Table, Schema } from "../../src/index";
import getDb from "../test-helper/get-db";

let db: Db;
let sequence: Sequence;

beforeAll(async () => {
  db = await getDb();
  [sequence] = (db.get("public") as Schema).sequences;
});

describe("Sequence", () => {
  it("should be a Sequence.", () => {
    expect(sequence).toBeInstanceOf(Sequence);
  });

  it("should have a name.", () => {
    expect(sequence.name).toBe("account_id_seq");
  });
});
