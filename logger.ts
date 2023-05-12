import { createWriteStream, type WriteStream } from "node:fs";
import { dirname, join } from "node:path";
import { format, inspect } from "node:util";
import { COLORS, DATETIME_LENGTH } from "./consts";

class Logger {
  path: any;
  stream: WriteStream;
  regexp: RegExp;

  constructor(logPath) {
    this.path = logPath;
    const date = new Date().toISOString().substring(0, 10);
    const filePath = join(logPath, `${date}.log`);
    this.stream = createWriteStream(filePath, { flags: "a" });
    this.regexp = new RegExp(dirname(this.path), "g");
  }

  async close(): Promise<WriteStream> {
    return await new Promise((resolve) => this.stream.end(resolve));
  }

  write(type = "info", s: string): void {
    const now = new Date().toISOString();
    const date = now.substring(0, DATETIME_LENGTH);
    const color = COLORS[type as keyof typeof COLORS];
    const line = `${date}\t${s}`;
    console.log(`${color}${line}\x1b[0m`);
    const out = line.replace(/[\n\r]\s*/g, "; ") + "\n";
    this.stream.write(out);
  }

  log(...args): void {
    const msg = format(...args);
    this.write("info", msg);
  }

  dir(...args): void {
    // don't know how to implement this
    const msg = inspect(args);
    this.write("info", msg);
  }

  debug(...args): void {
    const msg = format(...args);
    this.write("debug", msg);
  }

  error(...args): void {
    const msg = format(...args).replace(/[\n\r]{2,}/g, "\n");
    this.write("error", msg.replace(this.regexp, ""));
  }

  system(...args): void {
    const msg = format(...args);
    this.write("system", msg);
  }

  access(...args): void {
    const msg = format(...args);
    this.write("access", msg);
  }
}

export default new Logger("./log");
