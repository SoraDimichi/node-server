import fs from "node:fs/promises";
import vm from "node:vm";

export default (config) => async (filePath, sandbox) => {
  const src = await fs.readFile(filePath, "utf8");
  const code = `'use strict';\n${src}`;
  const script = new vm.Script(code);
  const context = vm.createContext(Object.freeze({ ...sandbox }));
  const exported = script.runInContext(context, config);
  return exported;
};
