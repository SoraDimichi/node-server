import { readFile } from "node:fs/promises";
import http from "node:http";
import { join } from "node:path";

type StaticConfig = { root: string; port: number };

const serveStatic = (config: StaticConfig): void => {
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

  console.log(`Static on port ${port}`);
};

export default serveStatic;
