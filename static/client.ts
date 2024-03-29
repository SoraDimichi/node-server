type Api = Record<string, Record<string, (...args: any[]) => Promise<any>>>;

const structure = {
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
} as const;

type Structure = typeof structure;

const http =
  (url: string) =>
  async (structure: Structure): Promise<Api> => {
    const api: Api = {};
    const services = Object.keys(structure);
    for (const name of services) {
      api[name] = {};
      const service = structure[name];
      const methods = Object.keys(service);
      for (const method of methods) {
        api[name][method] = async (...args: any[]) =>
          await new Promise((resolve, reject) => {
            fetch(`${url}/${name}/${method}/${args[0]["id"]}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ args }),
            })
              .then((res) => {
                if (res.status === 200) resolve(res.json());
                else throw new Error(`Status Code: ${res.status}`);
              })
              .catch((error) => {
                console.error(error);
                reject(error);
              });
          });
      }
    }
    return await Promise.resolve(api);
  };
const ws =
  (url: string) =>
  async (structure: Structure): Promise<Api> => {
    const socket = new WebSocket(url);
    const api: Api = {};
    const services = Object.keys(structure);
    for (const name of services) {
      api[name] = {};
      const service = structure[name];
      const methods = Object.keys(service);
      for (const method of methods) {
        api[name][method] = async (...args: any[]) =>
          await new Promise((resolve) => {
            const packet = { name, method, args };
            socket.send(JSON.stringify(packet));
            socket.onmessage = (event) => {
              const data = JSON.parse(event.data);
              resolve(data);
            };
          });
      }
    }
    return await new Promise((resolve) => {
      socket.addEventListener("open", () => {
        resolve(api);
      });
    });
  };

const scaffold = (url: string) => {
  const protocol = url.startsWith("ws:") ? "ws" : "http";
  return { http, ws }[protocol](url);
};

void (async () => {
  const getCity = await scaffold("http://localhost:8001")(structure);
  await getCity["country"]["read"]({ id: 1 });
})();
