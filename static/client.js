"use strict";

const transport = {
  ws: (structure, url = "ws://127.0.0.1:8001/") => {
    const socket = new WebSocket(url);
    const api = {};
    const services = Object.keys(structure);
    for (const serviceName of services) {
      api[serviceName] = {};
      const service = structure[serviceName];
      const methods = Object.keys(service);
      for (const methodName of methods) {
        api[serviceName][methodName] = (...args) =>
          new Promise((resolve) => {
            const packet = { name: serviceName, method: methodName, args };
            socket.send(JSON.stringify(packet));
            socket.onmessage = (event) => {
              const data = JSON.parse(event.data);
              resolve(data);
            };
          });
      }
    }

    socket.addEventListener("open", async () => {
      const data = await api.user.read(3);
      console.dir({ data });
    });

    return api;
  },
  http: (structure, url = "http://127.0.0.1:8001/") => {
    const api = {};
    const services = Object.keys(structure);
    for (const serviceName of services) {
      api[serviceName] = {};
      const service = structure[serviceName];
      const methods = Object.keys(service);
      for (const methodName of methods) {
        api[serviceName][methodName] = (...args) =>
          new Promise((resolve, reject) => {
            const u = `${url}${methodName}`;
            fetch(u, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(args),
            }).then((res) => {
              const { status } = res;
              if (status !== 200) {
                reject(new Error(`Status Code: ${status}`));
                return;
              }
              resolve(res.json());
            });
          });
      }
    }
    return api;
  },
};

const scaffold = (url, structure) =>
  transport[new URL(url).protocol](structure, url);

scaffold("ws://127.0.0.1:8001/", {
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
