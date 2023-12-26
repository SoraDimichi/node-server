import { readdir } from "node:fs/promises";
import { basename, join } from "node:path";
import config, { type ApiOptions } from "./config";
import { init } from "./db";
import log from "./logger";
import staticServer from "./static";
import store from "./transport";

const server = async (options: ApiOptions, logger: any) => {
  const { port, root, transport, db, framework } = options;
  init(db);

  const dirPath = join(__dirname, root);
  const files: string[] = await readdir(dirPath);
  const routing: Record<string, any> = {};

  for (const fileName of files) {
    if (!fileName.endsWith(".js")) continue;
    const filePath: string = join(dirPath, fileName);
    const serviceName: string = basename(fileName, ".js");
    routing[serviceName] = import(filePath);
  }

  store[framework][transport](routing, port, logger);
};

void (async (options) => {
  const l = log(options.logger);

  await server(options.api, l);
  staticServer(options.static, l);
})(config);
