"use strict";

import fs from "node:fs";
import path from "node:path";
import { format, inspect } from "node:util";
import { type LoggerOptions } from "./config";

const logger = (config: LoggerOptions) => {
  const { out, colors, datetimeLength } = config;

  class Logger {
    private readonly stream: fs.WriteStream;
    private readonly regexp: RegExp;

    constructor() {
      const date = new Date().toISOString().substring(0, 10);
      const filePath = path.join(out, `${date}.log`);
      this.stream = fs.createWriteStream(filePath, { flags: "a" });
      this.regexp = new RegExp(path.dirname(out), "g");
    }

    async close(): Promise<void> {
      await new Promise((resolve) => this.stream.end(resolve));
    }

    private write(type: string = "info", s: string): void {
      const now = new Date().toISOString();
      const date = now.substring(0, datetimeLength);
      const color = colors[type];
      const line = date + "\t" + s;
      console.log(color + line + "\x1b[0m");
      const out = line.replace(/[\n\r]\s*/g, "; ") + "\n";
      this.stream.write(out);
    }

    log(...args: Parameters<typeof format>): void {
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

  return new Logger();
};

export default logger;
