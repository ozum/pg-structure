import { Db, Domain, CompositeType, CheckConstraint, BaseType } from "../../src/index";
import getDb from "../test-helper/get-db";

let db: Db;
let crossSchemaDomain: Domain;
let price: Domain;
let checkConstraint: CheckConstraint;

beforeAll(async () => {
  db = await getDb();
  crossSchemaDomain = db.schemas.get("public").types.get("cross_schema_domain") as Domain;
  price = db.schemas.get("public").types.get("price") as Domain;
  checkConstraint = (db.types.get("price") as Domain).checkConstraints[0]; // eslint-disable-line prefer-destructuring
});

describe("Domain", () => {
  it("should be domain.", () => {
    expect(crossSchemaDomain).toBeInstanceOf(Domain);
  });

  it("should have check constraints.", () => {
    expect(checkConstraint.name).toBe("price_check");
  });

  it("should have type.", () => {
    expect(crossSchemaDomain.type).toBeInstanceOf(CompositeType);
    expect(price.type).toBeInstanceOf(BaseType);
  });

  it("should have precision and scale.", () => {
    expect(price.precision).toBe(8);
    expect(price.scale).toBe(2);
  });

  it("should have array dimension.", () => {
    expect(crossSchemaDomain.arrayDimension).toBe(1);
  });

  it("should have default value.", () => {
    expect(price.default).toBe("1.2");
  });

  it("should have not null attribute.", () => {
    expect(price.notNull).toBe(true);
  });
});
