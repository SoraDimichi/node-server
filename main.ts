import { readdir } from "node:fs/promises";
import { basename, join } from "node:path";
import { createDatabaseInterface } from "./db";
import hash from "./hash";
import load from "./load";
import logger from "./logger";
import staticServer from "./static";
import server from "./ws";

type Sandbox = {
  console: typeof logger;
  db: ReturnType<typeof createDatabaseInterface>;
  common: {
    hash: typeof hash;
  };
};

const config = {
  api: {
    port: 8001,
    root: "api",
  },
  stat: {
    port: 8000,
    root: "static",
  },
  db: {
    host: "127.0.0.1",
    port: 5432,
    database: "example",
    user: "marcus",
    password: "marcus",
  },
};

void (async (c: typeof config) => {
  const { db, api, stat } = c;

  const sandbox: Sandbox = {
    console: logger,
    db: createDatabaseInterface(db),
    common: { hash },
  };

  const dirPath = join(__dirname, api.root);
  const files: string[] = await readdir(dirPath);
  const routing: Record<string, any> = {};
  for (const fileName of files) {
    if (!fileName.endsWith(".js")) continue;
    const filePath: string = join(dirPath, fileName);
    const serviceName: string = basename(fileName, ".js");
    routing[serviceName] = await load(filePath, sandbox);
  }

  staticServer(stat);

  server(routing, api.port);
})(config);
