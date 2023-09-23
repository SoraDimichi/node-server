import { readdir } from "node:fs/promises";
import { basename, join } from "node:path";
import { createDatabaseInterface, type DatabaseConfig } from "./db";
import hash from "./hash";
import http from "./http";
import load from "./load";
import logger from "./logger";
import staticServer from "./static";
import ws from "./ws";

type Sandbox = {
  console: typeof logger;
  db: ReturnType<typeof createDatabaseInterface>;
  common: {
    hash: typeof hash;
  };
};

const config = {
  api: {
    port: Number(process.env.API_PORT as string),
    root: "api",
    transport: "http",
    db: {
      host: process.env.DB_HOST as string,
      port: Number(process.env.DB_PORT as string),
      database: process.env.DB_NAME as string,
      user: process.env.DB_USER as string,
      password: process.env.DB_PASSWORD as string,
    },
  },
  stat: {
    port: Number(process.env.STAT_PORT as string),
    root: "static",
  },
} as const;

type ApiConfig = {
  port: number;
  root: string;
  transport: "http" | "ws";
  db: DatabaseConfig;
};

const server = async (c: ApiConfig) => {
  const { port, root, transport, db } = c;
  const sandbox: Sandbox = {
    console: logger,
    db: createDatabaseInterface(db),
    common: { hash },
  };

  const dirPath = join(__dirname, root);
  const files: string[] = await readdir(dirPath);
  const routing: Record<string, any> = {};

  for (const fileName of files) {
    if (!fileName.endsWith(".js")) continue;
    const filePath: string = join(dirPath, fileName);
    const serviceName: string = basename(fileName, ".js");
    routing[serviceName] = await load(filePath, sandbox);
  }

  ({ http, ws })[transport](routing, port);
};

void (async (c: typeof config) => {
  const { api, stat } = c;

  await server(api);
  staticServer(stat);
})(config);
