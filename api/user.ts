import { crud } from "../db";
import { hash } from "../hash";
const users = crud("users");

export default {
  async read(id) {
    return await users.read(id, ["id", "login"]);
  },
  async create({ login, password }) {
    const passwordHash = await hash(password);
    return await users.create({ login, password: passwordHash });
  },
  async update(id, { login, password }) {
    const passwordHash = await hash(password);
    return await users.update(id, { login, password: passwordHash });
  },
  async delete(id) {
    return await users.delete(id);
  },
  async find(mask) {
    const sql = "SELECT login from users where login like $1";
    return await users.query(sql, [mask]);
  },
  async readAll() {
    const sql = "SELECT * from users";
    return await users.query(sql);
  },
};
