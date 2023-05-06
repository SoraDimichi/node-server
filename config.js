module.exports = {
  api: {
    port: 8001,
    transport: "ws",
  },
  db: {
    host: "127.0.0.1",
    port: 5432,
    database: "example",
    user: "marcus",
    password: "marcus",
  },
  load: {
    timeout: 5000,
    displayErrors: false,
  },
  static: {
    port: 8000,
  },
};
