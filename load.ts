import { promises as fs } from "node:fs";
import { Script, createContext, type Context } from "node:vm";

const executeScript =
  (options) =>
  async (filePath: string, sandbox: Record<string, any>): Promise<any> => {
    const src: string = await fs.readFile(filePath, "utf8");
    const code: string = `'use strict';\n${src}`;
    const script: Script = new Script(code);
    const context: Context = createContext(Object.freeze({ ...sandbox }));
    const exported: any = script.runInContext(context, options);
    return exported;
  };

export default executeScript;
