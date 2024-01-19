import Fastify from "fastify";

type RoutingEntity = Record<
  string,
  (...args: any[]) => Promise<{ rows: any[] }>
>;

type Routing = Record<string, RoutingEntity>;

const startServer = (routing: Routing, port: number, logger = console) => {
  const fastify = Fastify({
    logger: true,
  });

  // Helper function to process request data
  const receiveArgs = async (req) => {
    const buffers: Buffer[] = [];
    for await (const chunk of req.raw) {
      buffers.push(chunk);
    }
    const data = Buffer.concat(buffers).toString();
    return JSON.parse(data);
  };

  // Register routes
  Object.keys(routing).forEach((name) => {
    const entity = routing[name];
    Object.keys(entity).forEach((method) => {
      fastify.route({
        method: ["GET", "POST", "PUT", "DELETE"],
        url: `/${name}/${method}/:id?`,
        handler: async (request, reply) => {
          const { url } = request;
          if (url == null) return await reply.send("Not found 1");
          const [name, method, id] = url.substring(1).split("/");
          const entity = routing[name];
          if (entity == null) return await reply.send("Not found 3");
          const handler = entity[`${method}`];
          if (handler == null) return await reply.send("Not found 2");
          const src = handler.toString();
          const signature = src.substring(0, src.indexOf(")"));
          const args: any[] = [];
          if (signature.includes("(id")) args.push(id);
          if (signature.includes("{")) args.push(await receiveArgs(request));
          const result = await handler(...args);

          await reply.send(result.rows);
        },
      });
    });
  });
  console.log(routing);
  // Start server
  fastify.listen({ port, host: "0.0.0.0" }, (err, address) => {
    if (err != null) {
      logger.error(err);
      process.exit(1);
    }

    console.log(address, port);
    logger.log(`Server listening at ${address}`);
  });
};

export default startServer;
