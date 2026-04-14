import pg from "pg";
import { env } from "./env.js";

const { Pool } = pg;
type QueryResultRow = pg.QueryResultRow;

function createPoolConfig(connectionString: string) {
  const isLocalConnection =
    connectionString.includes("localhost") || connectionString.includes("127.0.0.1");

  return {
    connectionString,
    ssl: isLocalConnection ? undefined : { rejectUnauthorized: false }
  };
}

export const pool = new Pool({
  ...createPoolConfig(env.DATABASE_URL)
});

export async function query<T extends QueryResultRow>(text: string, params: unknown[] = []) {
  return pool.query<T>(text, params);
}

export async function getClient() {
  return pool.connect();
}
