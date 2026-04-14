import { app } from "./app.js";
import { env } from "./config/env.js";
import { pool } from "./config/db.js";

async function start() {
  try {
    await pool.query("SELECT NOW()");
    app.listen(Number(env.PORT), () => {
      console.log(`API running on http://localhost:${env.PORT}`);
    });
  } catch (error) {
    console.error("Server baslatilamadi:", error);
    process.exit(1);
  }
}

start();
