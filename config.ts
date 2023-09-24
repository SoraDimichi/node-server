const config: AppOptions = {
  api: {
    port: Number(process.env.API_PORT),
    transport: process.env.TRANSPORT,
    root: "api",
    db: {
      port: Number(process.env.DB_PORT),
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    },
    loader: {
      timeout: 5000,
      displayErrors: false,
    },
  },
  static: {
    port: Number(process.env.STAT_PORT),
    root: "static",
  },
  logger: {
    out: "logs",
    colors: {
      info: "\x1b[1;37m",
      debug: "\x1b[1;33m",
      error: "\x1b[0;31m",
      system: "\x1b[1;34m",
      access: "\x1b[1;38m",
    },
    datetimeLength: 19,
  },
} as const;

export type LoggerOptions = {
  out: string;
  colors: Record<string, string>;
  datetimeLength: number;
};

export type DatabaseOptions = {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
};

export type LoaderOptions = {
  timeout: number;
  displayErrors: boolean;
};

export type ApiOptions = {
  port: number;
  root: string;
  transport: "http" | "ws";
  db: DatabaseOptions;
  loader: LoaderOptions;
};

export type StaticOptions = { root: string; port: number };

export type AppOptions = {
  api: ApiOptions;
  static: StaticOptions;
  logger: LoggerOptions;
};

export default config;
