import { randomBytes, scrypt } from "node:crypto";

const hash = async (password: string): Promise<string> =>
  await new Promise((resolve, reject) => {
    const salt = randomBytes(16).toString("base64");
    scrypt(password, salt, 64, (err: Error | null, result: Buffer) => {
      if (err != null) reject(err);
      resolve(salt + ":" + result.toString("base64"));
    });
  });

export { hash };
