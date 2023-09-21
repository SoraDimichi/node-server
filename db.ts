import { Pool, type QueryResult } from "pg";

const pool = new Pool({
  host: "127.0.0.1",
  port: 5432,
  database: "example",
  user: "marcus",
  password: "marcus",
});

type Rec = Record<string, any>;

const createDatabaseInterface = (table: string) => ({
  async query(sql: string, args?: any[]): Promise<QueryResult> {
    return await pool.query(sql, args);
  },
  async read(id?: number, fields: string[] = ["*"]): Promise<QueryResult> {
    const names = fields.join(", ");
    const sql = `SELECT ${names} FROM ${table}`;
    if (id != null) return await pool.query(sql);
    return await pool.query(`${sql} WHERE id = $1`, [id]);
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
    return await pool.query(sql, data);
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
    return await pool.query(sql, data);
  },
  async delete(id: number): Promise<QueryResult> {
    const sql = `DELETE FROM ${table} WHERE id = $1`;
    return await pool.query(sql, [id]);
  },
});

export default createDatabaseInterface;
