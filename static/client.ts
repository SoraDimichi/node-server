type ServiceMethod = Record<string, string[]>;
type ServiceStructure = Record<string, ServiceMethod>;
type Packet = { name: string; method: string; args: any[] };

const socket: WebSocket = new WebSocket("ws://127.0.0.1:8001/");

const scaffold = (structure: ServiceStructure) => {
  const api: Record<
    string,
    Record<string, (...args: any[]) => Promise<unknown>>
  > = {};
  const services = Object.keys(structure);
  for (const serviceName of services) {
    api[serviceName] = {};
    const service = structure[serviceName];
    const methods = Object.keys(service);
    for (const methodName of methods) {
      api[serviceName][methodName] = async (...args: any[]) =>
        await new Promise((resolve) => {
          const packet: Packet = {
            name: serviceName,
            method: methodName,
            args,
          };
          socket.send(JSON.stringify(packet));
          socket.onmessage = (event: MessageEvent) => {
            const data = JSON.parse(event.data);
            resolve(data);
          };
        });
    }
  }
  return api;
};

const api = scaffold({
  user: {
    create: ["record"],
    read: ["id"],
    update: ["id", "record"],
    delete: ["id"],
    find: ["mask"],
  },
  country: {
    read: ["id"],
    delete: ["id"],
    find: ["mask"],
  },
});

socket.addEventListener("open", () => {
  void (async () => {
    const data = await api["user"]["read"](3);
    console.dir({ data });
  })();
});
