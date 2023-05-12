import { readFile } from "node:fs/promises";
import http from "node:http";
import { join } from "node:path";

export default (port: number) => async (root: string) => {
  http
    .createServer((req, res) => {
      const url = req.url === "/" ? "/index.html" : req.url;
      if (url == null) return;
      const filePath = join(root, url);
      try {
        const data = readFile(filePath);
        res.end(data);
      } catch (err) {
        res.statusCode = 404;
        res.end('"File is not found"');
      }
    })
    .listen(port);

  console.log(`Static on port ${port}`);
};
