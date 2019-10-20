module.exports = async () => {
  const { pgTestUtil } = global as any;
  await pgTestUtil.dropAllDatabases(); // To inspect without drop use: await pgTestUtil.disconnectAll({ disconnect: true });
  await pgTestUtil.disconnectAll();
};
