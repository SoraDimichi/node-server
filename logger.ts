import fs from "node:fs";
import path from "node:path";
import { format, inspect } from "node:util";
import pino from "pino";
const loggerConfig = {
  out: "log",
  colors: {
    info: "\x1b[1;37m",
    debug: "\x1b[1;33m",
    error: "\x1b[0;31m",
    system: "\x1b[1;34m",
    access: "\x1b[1;38m",
  },
  datetimeLength: 19,
};

const { out, colors, datetimeLength } = loggerConfig;

class Logger {
  private readonly stream: fs.WriteStream;
  private readonly regexp: RegExp;

  constructor() {
    this.stream = fs.createWriteStream(this.createFilePath(), { flags: "a" });
    this.regexp = new RegExp(path.dirname(out), "g");
  }

  async close(): Promise<void> {
    await new Promise((resolve) => this.stream.end(resolve));
  }

  public getCurrentDate(): string {
    const now = new Date().toISOString();
    const date = now.substring(0, datetimeLength);
    return date;
  }

  public createFilePath(): string {
    const date = new Date().toISOString().substring(0, 10);
    const filePath = path.join(out, `${date}.log`);
    return filePath;
  }

  private write(type: string = "info", s: string): void {
    const date = this.getCurrentDate();
    const color = colors[type];
    const line = date + "\t" + s;
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    console.log(color + line + "\x1b[0m");
    const out = line.replace(/[\n\r]\s*/g, "; ") + "\n";
    this.stream.write(out);
  }

  log(...args: Parameters<typeof format>): void {
    const msg = format(...args);
    this.write("info", msg);
  }

  info(...args: Parameters<typeof format>): void {
    const msg = format(...args);
    this.write("info", msg);
  }

  dir(...args: Parameters<typeof inspect>): void {
    const msg = inspect(...args);
    this.write("info", msg);
  }

  debug(...args: Parameters<typeof format>): void {
    const msg = format(...args);
    this.write("debug", msg);
  }

  error(...args: Parameters<typeof format>): void {
    const msg = format(...args).replace(/[\n\r]{2,}/g, "\n");
    this.write("error", msg.replace(this.regexp, ""));
  }

  system(...args: Parameters<typeof format>): void {
    const msg = format(...args);
    this.write("system", msg);
  }

  access(...args: Parameters<typeof format>): void {
    const msg = format(...args);
    this.write("access", msg);
  }
}

const logger = new Logger();
const pinoLogger = pino(
  pino.destination({ dest: logger.createFilePath(), sync: true })
);

export default { logger, pino: pinoLogger, console };
