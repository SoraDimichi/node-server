import http, { type IncomingMessage, type ServerResponse } from "node:http";

type ReceiveArgs = (req: IncomingMessage) => Promise<string>;
const receiveArgs: ReceiveArgs = async (req) => {
  const buffers: Uint8Array[] = [];
  for await (const chunk of req) buffers.push(chunk);
  const data = Buffer.concat(buffers).toString();
  const parsedData: string = JSON.parse(data);
  return parsedData;
};

export default (port: number) => (routing: any) => {
  http
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    .createServer(async (req: IncomingMessage, res: ServerResponse) => {
      const { url = "", socket } = req;
      const [name, method, id] = url.substring(1).split("/");
      const entity = routing[name];
      if (entity == null) {
        res.statusCode = 404;
        return res.end("Not found");
      }
      const handler = entity[method];
      if (handler == null) {
        res.statusCode = 404;
        return res.end("Not found");
      }
      const src = handler.toString();
      const signature = src.substring(0, src.indexOf(")"));
      const args: string[] = [];
      if (signature.includes("(id") === true) args.push(id);
      if (signature.includes("{") === true) args.push(await receiveArgs(req));
      console.log(
        `${socket.remoteAddress ?? "unknown address"} ${method} ${url}`
      );
      const result = await handler(...args);
      return res.end(JSON.stringify(result.rows));
    })
    .listen(port);

  console.log(`API on port ${port}`);
};
