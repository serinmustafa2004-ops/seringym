import pg from "pg";
import { env } from "./env.js";

const { Pool } = pg;
type QueryResultRow = pg.QueryResultRow;

function createPoolConfig(connectionString: string) {
  const isLocalConnection =
    connectionString.includes("localhost") || connectionString.includes("127.0.0.1");

  return {
    connectionString,
    ssl: isLocalConnection ? undefined : { rejectUnauthorized: false },
    connectionTimeoutMillis: isLocalConnection ? 5000 : 15000,
    idleTimeoutMillis: 10000
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
