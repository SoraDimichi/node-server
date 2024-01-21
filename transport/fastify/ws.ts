import Fastify from "fastify";

import { type AddressInfo } from "ws";
import websocket from "@fastify/websocket";

type RoutingEntity = Record<string, (...args: any[]) => Promise<unknown>>;

type Routing = Record<string, RoutingEntity>;

const startServer = (
  routing: Routing,
  port: number,
  logger = console
): void => {
  const fastify = Fastify();

  void fastify.register(websocket);
  void fastify.register(async function (fastify) {
    fastify.get("/*", { websocket: true }, (connection, req) => {
      const ip = (req.socket.address() as AddressInfo).address;
      connection.socket.on("message", (message, req) => {
        void (async () => {
          const obj = JSON.parse(message.toString()); // eslint-disable-line @typescript-eslint/no-base-to-string
          const { name, method, args = [] } = obj;
          const entity = routing[name];
          if (entity == null) {
            connection.socket.send('"Not found"', { binary: false });
            return;
          }
          const handler = entity[method];
          if (handler == null) {
            connection.socket.send('"Not found"', { binary: false });
            return;
          }
          const json = JSON.stringify(args);
          const parameters = json.substring(1, json.length - 1);
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          logger.log(`${ip} ${name}.${method}(${parameters})`);
          try {
            const result = await handler(...args);
            connection.socket.send(JSON.stringify(result as string), {
              binary: false,
            });
          } catch (err) {
            logger.error(err);
            connection.socket.send('"Server error"', { binary: false });
          }
        })();
      });
    });
  });
  void fastify.listen({ port, host: "0.0.0.0" });

  logger.log(`API on port ${port}`);
};

export default startServer;
