import Fastify from "fastify";
import type * as http from "node:http";

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

const startServer = (routing: Routing, port: number, logger = console) => {
  Fastify({ logger: true })
    .all("/*", async (req, res) => {
        // console.log("all");
        try {
          const { url, socket } = req;
          // Set CORS headers to allow requests from any origin
          // await res.header("Access-Control-Allow-Origin", "*");
          // await res.header(
          //   "Access-Control-Allow-Methods",
          //   "GET, POST, PUT, DELETE, OPTIONS"
          // );
          // await res.header(
          //   "Access-Control-Allow-Headers",
          //   "X-Requested-With,content-type"
          // );
          // await res.header("Access-Control-Allow-Credentials", "true");
          // // Handle preflight requests for CORS
          // if (req.method === "OPTIONS") {
          //   await res.code(204).send();
          //   return;
          // }
          console.log(url);
          if (url == null) return await res.send("Not found 1");
          const [name, method, id] = url.substring(1).split("/");
          const entity = routing[name];
          if (entity == null) return await res.send("Not found 3");
          const handler = entity[`${method}`];
          if (handler == null) return await res.send("Not found 2");
          const src = handler.toString();
          const signature = src.substring(0, src.indexOf(")"));
          const args: any[] = [];
          if (signature.includes("(id")) args.push(id);
          if (signature.includes("{")) args.push(await receiveArgs(req as any));
          logger.log(`${String(socket.remoteAddress)} ${method} ${url}`);
          const result = await handler(...args);
          return await res.send(JSON.stringify(result.rows));
        } catch (err) {
          logger.error(err);
          await res.code(500).send("Internal Server Error");
        }
    })
    .listen({ port, host: '0.0.0.0' }, (err, address) => {
      if (err != null) {
        logger.error(err);
        process.exit(1);
      }

      console.log(address, port);
      logger.log(`Server listening at ${address}`);
    });
};

export default startServer;
