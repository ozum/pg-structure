import PgTestUtil from "pg-test-util";

module.exports = async () => {
  const pgTestUtil = new PgTestUtil({ connection: { connectionString: "postgresql://user:password@127.0.0.1:5432/template1" } });
  try {
    await pgTestUtil.createDatabase({
      drop: true,
      name: "pg-structure-test-main",
      file: `${__dirname}/ddl/main.sql`,
    });
    await pgTestUtil.createDatabase({
      drop: true,
      name: "pg-structure-test-relation-names",
      file: `${__dirname}/ddl/relation-names.sql`,
    });
    await pgTestUtil.createDatabase({
      drop: true,
      name: "pg-structure-test-relation-names-reverse",
      file: `${__dirname}/ddl/relation-names-reverse.sql`,
    });
  } catch (e) {
    console.log(e);
  }

  (global as any).pgTestUtil = pgTestUtil;
};
