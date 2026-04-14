import pg from "pg";
import { env } from "./env.js";

const { Pool } = pg;
type QueryResultRow = pg.QueryResultRow;

export const pool = new Pool({
  connectionString: env.DATABASE_URL
});

export async function query<T extends QueryResultRow>(text: string, params: unknown[] = []) {
  return pool.query<T>(text, params);
}

export async function getClient() {
  return pool.connect();
}
