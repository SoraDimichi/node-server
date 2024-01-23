const config: AppOptions = {
  api: {
    port: Number(process.env.API_PORT),
    transport: process.env.TRANSPORT,
    framework: process.env.FRAMEWORK,
    root: "api",
    db: {
      port: Number(process.env.DB_PORT),
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    },
  },
  static: {
    port: Number(process.env.STAT_PORT),
    root: "static",
  },
  logger: process.env.LOGGER,
} as const;

export type LoggerOptions = "pino" | "console" | "logger";

export type DatabaseOptions = {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
};

export type ApiOptions = {
  port: number;
  root: string;
  transport: "http" | "ws";
  framework: "native" | "fastify";
  db: DatabaseOptions;
};

export type StaticOptions = { root: string; port: number };

export type AppOptions = {
  api: ApiOptions;
  static: StaticOptions;
  logger: LoggerOptions;
};

export default config;
