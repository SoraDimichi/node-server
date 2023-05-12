import crypto from "node:crypto";

type Hash = (password: string) => Promise<string>;
const hash: Hash = async (password) =>
  await new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString("base64");
    crypto.scrypt(password, salt, 64, (err, result) => {
      if (err != null) reject(err);
      resolve(salt + ":" + result.toString("base64"));
    });
  });

export default hash;
