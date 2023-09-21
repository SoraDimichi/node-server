import { promises as fs } from "node:fs";
import {
  Script,
  createContext,
  type Context,
  type RunningScriptOptions,
} from "node:vm";

const RUN_OPTIONS: RunningScriptOptions = {
  timeout: 5000,
  displayErrors: false,
};

const executeScript = async (
  filePath: string,
  sandbox: Record<string, any>
): Promise<any> => {
  const src: string = await fs.readFile(filePath, "utf8");
  const code: string = `'use strict';\n${src}`;
  const script: Script = new Script(code);
  const context: Context = createContext(Object.freeze({ ...sandbox }));
  const exported: any = script.runInContext(context, RUN_OPTIONS);
  return exported;
};

export default executeScript;
