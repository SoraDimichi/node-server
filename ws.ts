import { Server, type RawData } from "ws";
import console from "./logger";

export default (port: number) => (routing) => {
  const ws = new Server({ port });

  ws.on("connection", (connection, req) => {
    const ip = req.socket.remoteAddress;
    connection.on("message", async (message: RawData) => {
      const obj = JSON.parse(message.toString());
      const { name, method, args = [] } = obj;
      const entity = routing[name];
      if (entity == null) {
        return connection.send('"Not found"', { binary: false });
      }
      const handler = entity[method];
      if (handler == null) {
        return connection.send('"Not found"', { binary: false });
      }
      const json = JSON.stringify(args);
      const parameters = json.substring(1, json.length - 1);
      console.log(
        `${String(ip)} ${String(name)}.${String(method)}(${parameters})`
      );
      try {
        const result = await handler(...args);
        connection.send(JSON.stringify(result.rows), { binary: false });
      } catch (err) {
        console.error(err);
        connection.send('"Server error"', { binary: false });
      }
    });
  });

  console.log(`API on port ${port}`);
};
