import { readFile } from "node:fs/promises";
import http from "node:http";
import { join } from "node:path";
import { type StaticOptions } from "./config";

const serveStatic = (config: StaticOptions, logger: any): void => {
  const { root, port } = config;
  http
    .createServer((req, res) => {
      void (async () => {
        if (typeof req.url !== "string") return;
        const url = req.url === "/" ? "/index.html" : req.url;
        const filePath = join(__dirname, root, url);
        try {
          const data = await readFile(filePath);
          res.end(data);
        } catch (err) {
          res.statusCode = 404;
          res.end('"File is not found"');
        }
      })();
    })
    .listen(port);

  logger.log(`Static on port ${port}`);
};

export default serveStatic;
