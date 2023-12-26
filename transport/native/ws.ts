import { Server, type AddressInfo } from "ws";

type RoutingEntity = Record<string, (...args: any[]) => Promise<unknown>>;

type Routing = Record<string, RoutingEntity>;

const startServer = (
  routing: Routing,
  port: number,
  logger = console
): void => {
  const ws = new Server({ port });

  ws.on("connection", (connection, req) => {
    const ip = (req.socket.address() as AddressInfo).address;
    connection.on("message", (message: string) => {
      void (async () => {
        const obj = JSON.parse(message);
        const { name, method, args = [] } = obj;
        const entity = routing[name];
        if (entity == null) {
          connection.send('"Not found"', { binary: false });
          return;
        }
        const handler = entity[method];
        if (handler == null) {
          connection.send('"Not found"', { binary: false });
          return;
        }
        const json = JSON.stringify(args);
        const parameters = json.substring(1, json.length - 1);
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        logger.log(`${ip} ${name}.${method}(${parameters})`);
        try {
          const result = await handler(...args);
          connection.send(JSON.stringify(result as string), { binary: false });
        } catch (err) {
          logger.error(err);
          connection.send('"Server error"', { binary: false });
        }
      })();
    });
  });

  logger.log(`API on port ${port}`);
};

export default startServer;
