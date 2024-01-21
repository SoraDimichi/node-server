import { Pool, type QueryResult } from "pg";
import { type DatabaseOptions } from "./config";

type Rec = Record<string, any>;

let pool: Pool | null = null;

const init = (options: DatabaseOptions) => {
  pool = new Pool(options);
};

const getPool = (): Pool => {
  if (pool == null) throw new Error("Database is not initialized");
  return pool;
};

const crud = (table: string) => ({
  async query(sql: string, args?: any[]): Promise<QueryResult> {
    return await getPool().query(sql, args);
  },
  async read(id?: number, fields: string[] = ["*"]): Promise<QueryResult> {
    const names = fields.join(", ");
    console.log(id, fields, table);
    const sql = `SELECT ${names} FROM ${table}`;
    if (id === null) return await getPool().query(sql);
    return await getPool().query(`${sql} WHERE id = $1`, [id]);
  },
  async create(record: Rec): Promise<QueryResult> {
    const keys = Object.keys(record);
    const nums: string[] = new Array(keys.length);
    const data: any[] = new Array(keys.length);
    let i = 0;
    for (const key of keys) {
      data[i] = record[key];
      nums[i] = `$${++i}`;
    }
    const fields = '"' + keys.join('", "') + '"';
    const params = nums.join(", ");
    const sql = `INSERT INTO "${table}" (${fields}) VALUES (${params})`;
    return await getPool().query(sql, data);
  },
  async update(id: number, record: Rec): Promise<QueryResult> {
    const keys = Object.keys(record);
    const updates: string[] = new Array(keys.length);
    const data: any[] = new Array(keys.length);
    let i = 0;
    for (const key of keys) {
      data[i] = record[key];
      updates[i] = `${key} = $${++i}`;
    }
    const delta = updates.join(", ");
    const sql = `UPDATE ${table} SET ${delta} WHERE id = $${++i}`;
    data.push(id);
    return await getPool().query(sql, data);
  },
  async delete(id: number): Promise<QueryResult> {
    const sql = `DELETE FROM ${table} WHERE id = $1`;
    return await getPool().query(sql, [id]);
  },
});

export { crud, init };
