import { readdir } from "fs/promises";
import { basename, join } from "node:path";
import { API, DB, LOAD, STATIC } from "./consts";
import pg from "./db";
import hash from "./hash";
import http from "./http";
import l from "./load";
import logger from "./logger";
import ss from "./static";
import ws from "./ws";

const db = pg(DB);
const server = { http, ws }[API.transport](API.port);
const staticServer = ss(STATIC.port);
const load = l(LOAD);

const sandbox = {
  console: Object.freeze(logger),
  db: Object.freeze(db),
  common: { hash },
};
const apiPath = join(process.cwd(), "./api");
const routing = {};

void (async () => {
  const files = await readdir(apiPath);
  for (const fileName of files) {
    if (!fileName.endsWith(".ts")) continue;
    const filePath = join(apiPath, fileName);
    const serviceName = basename(fileName, ".js");
    routing[serviceName] = load(filePath, sandbox);
  }

  void staticServer("./static");
  server(routing);
})();
