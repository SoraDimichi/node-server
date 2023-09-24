import { readdir } from "node:fs/promises";
import { basename, join } from "node:path";
import config, { type ApiOptions } from "./config";
import { createDatabaseInterface } from "./db";
import hash from "./hash";
import load from "./load";
import log from "./logger";
import staticServer from "./static";
import store from "./transport";

type Sandbox = {
  console: ReturnType<typeof log>;
  db: ReturnType<typeof createDatabaseInterface>;
  common: {
    hash: typeof hash;
  };
};

const server = async (options: ApiOptions, logger: any) => {
  const { port, root, transport, db, loader } = options;

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
    routing[serviceName] = await load(loader)(filePath, sandbox);
  }

  store[transport](routing, port, logger);
};

void (async (options) => {
  const l = log(options.logger);

  await server(options.api, l);
  staticServer(options.static, l);
})(config);
