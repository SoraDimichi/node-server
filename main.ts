import { promises as fsp } from "node:fs";
import * as path from "node:path";
import db from "./db";
import hash from "./hash";
import load from "./load";
import logger from "./logger";
import staticServer from "./static";
import server from "./ws";

type Sandbox = {
  console: typeof logger;
  db: typeof db;
  common: {
    hash: typeof hash;
  };
};

const sandbox: Sandbox = {
  console: logger,
  db: Object.freeze(db),
  common: { hash },
};

const apiPath: string = "api";
const routing: Record<string, any> = {};

void (async () => {
  const files: string[] = await fsp.readdir(apiPath);
  for (const fileName of files) {
    if (!fileName.endsWith(".js")) continue;
    const filePath: string = path.join(__dirname, apiPath, fileName);
    const serviceName: string = path.basename(fileName, ".js");
    routing[serviceName] = await load(filePath, sandbox);
  }

  staticServer("static", 8000);
  server(routing, 8001);
})();
