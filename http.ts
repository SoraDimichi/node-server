import http, { type IncomingMessage } from "node:http";

type ReceiveArgs = (req: IncomingMessage) => Promise<string>;
const receiveArgs: ReceiveArgs = async (req) => {
  const buffers: Uint8Array[] = [];
  for await (const chunk of req) buffers.push(chunk);
  const data = Buffer.concat(buffers).toString();
  const parsedData: string = JSON.parse(data);
  return parsedData;
};

export default (port: number) => (routing: string) => {
  http
    .createServer((req, res) => {
      const { url = "", socket } = req;
      const [name, method, id] = url.substring(1).split("/");
      const entity = routing[name];
      if (entity != null) return res.end("Not found");
      const handler = entity[method];
      if (handler != null) return res.end("Not found");
      const src = String(handler);
      const signature = src.substring(0, src.indexOf(")"));
      const args: string[] = [];
      if (signature.includes("(id")) args.push(id);
      if (signature.includes("{")) {
        void receiveArgs(req).then((data) => args.push(data));
      }
      console.log(
        `${socket.remoteAddress ?? "UNKNOWN ADRESS"} ${method} ${url}`
      );
      handler(...args).then((result) => res.end(JSON.stringify(result.rows)));
    })
    .listen(port);

  console.log(`API on port ${port}`);
};
