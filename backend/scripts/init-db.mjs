import fs from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const { Pool } = pg;

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL tanımlı değil.");
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl
});

const localDatabaseDir = path.join(process.cwd(), "database");
const parentDatabaseDir = path.resolve(process.cwd(), "..", "database");
const files = [
  "schema.sql",
  "seed.sql",
  "migration_v2.sql",
  "migration_v3.sql",
  "migration_v4.sql",
  "migration_v5.sql",
  "migration_v6.sql",
  "migration_v7.sql",
  "migration_v8.sql",
  "migration_v9.sql",
  "migration_v10.sql",
  "migration_v11.sql",
  "migration_v12.sql",
  "migration_v13.sql"
];

async function main() {
  const databaseDir = await fs
    .access(localDatabaseDir)
    .then(() => localDatabaseDir)
    .catch(async () => {
      await fs.access(parentDatabaseDir);
      return parentDatabaseDir;
    });

  const existsResult = await pool.query(`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'users'
    ) AS exists
  `);

  if (existsResult.rows[0]?.exists) {
    console.log("Veritabanı zaten hazır, başlangıç verisi atlanıyor.");
    await pool.end();
    return;
  }

  const client = await pool.connect();

  try {
    for (const file of files) {
      const sql = await fs.readFile(path.join(databaseDir, file), "utf8");
      await client.query(sql);
      console.log(`${file} uygulandı.`);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(async (error) => {
  console.error("Veritabanı hazırlığı başarısız:", error);
  await pool.end();
  process.exit(1);
});
