import fs from "node:fs";
import http from "node:http";
import path from "node:path";

const serveStatic = (root: string, port: number): void => {
  http
    .createServer((req, res) => {
      void (async () => {
        if (typeof req.url !== "string") return;
        const url = req.url === "/" ? "/index.html" : req.url;
        const filePath = path.join(__dirname, root, url);
        try {
          const data = await fs.promises.readFile(filePath);
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
