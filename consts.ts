export const FRAMEWORK = "native";
export const STRUCTURE = {
  user: {
    create: ["record"],
    read: ["id"],
    update: ["id", "record"],
    delete: ["id"],
    find: ["mask"],
  },
  country: {
    read: ["id"],
    delete: ["id"],
    find: ["mask"],
  },
};
export const API = {
  port: 8001,
  transport: "http",
};
export const DB = {
  host: "127.0.0.1",
  port: 5432,
  database: "example",
  user: "marcus",
  password: "marcus",
};
export const LOAD = { timeout: 5000, displayErrors: false };
export const STATIC = { port: 8000 };
export const COLORS = {
  info: "\x1b[1;37m",
  debug: "\x1b[1;33m",
  error: "\x1b[0;31m",
  system: "\x1b[1;34m",
  access: "\x1b[1;38m",
};
export const DATETIME_LENGTH = 19;
