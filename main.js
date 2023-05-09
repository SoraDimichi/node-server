"use strict";
const config = require("./config.js");
const server = require(`./${config.api.transport}.js`)(config.api.port);
const staticServer = require("./static.js")(config.static.port);
const db = require("./db.js")(config.db);
const load = require("./load.js")(config.load);

const fsp = require("node:fs").promises;
const path = require("node:path");
const hash = require("./hash.js");
const logger = require("./logger.js");

const sandbox = {
  console: Object.freeze(logger),
  db: Object.freeze(db),
  common: { hash },
};
const apiPath = path.join(process.cwd(), "./api");
const routing = {};

(async () => {
  const files = await fsp.readdir(apiPath);
  for (const fileName of files) {
    if (!fileName.endsWith(".js")) continue;
    const filePath = path.join(apiPath, fileName);
    const serviceName = path.basename(fileName, ".js");
    routing[serviceName] = await load(filePath, sandbox);
  }

  staticServer("./static");
  server(routing);
})();
