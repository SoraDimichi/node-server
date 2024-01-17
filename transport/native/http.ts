import * as http from "node:http";

type RoutingEntity = Record<
  string,
  (...args: any[]) => Promise<{ rows: any[] }>
>;

type Routing = Record<string, RoutingEntity>;

const receiveArgs = async (req: http.IncomingMessage): Promise<any> => {
  const buffers: Buffer[] = [];
  for await (const chunk of req) buffers.push(chunk);
  const data = Buffer.concat(buffers).toString();
  return JSON.parse(data);
};

const startServer = (
  routing: Routing,
  port: number,
  logger = console
): void => {
  http
    .createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
      void (async () => {
        const { url, socket } = req;

        if (url == null) return res.end("Not found 1");
        const [name, method, id] = url.substring(1).split("/");
        const entity = routing[name];
        if (entity == null) return res.end("Not found 3");
        const handler = entity[`${method}`];
        if (handler == null) return res.end("Not found 2");
        const src = handler.toString();
        const signature = src.substring(0, src.indexOf(")"));
        const args: any[] = [];
        if (signature.includes("(id")) args.push(id);
        if (signature.includes("{")) args.push(await receiveArgs(req));

        logger.log(`${String(socket.remoteAddress)} ${"read"} ${url}`);
        const result = await handler(...args);
        return res.end(JSON.stringify(result.rows));
      })();
    })
    .listen(port);

  logger.log(`API on port ${port}`);
};

export default startServer;
