import { app } from "./app.js";
import { env } from "./config/env.js";
import { pool } from "./config/db.js";

async function start() {
  app.listen(Number(env.PORT), () => {
    console.log(`API running on http://localhost:${env.PORT}`);
  });

  try {
    await pool.query("SELECT NOW()");
    console.log("Veritabani baglantisi hazir.");
  } catch (error) {
    console.error("Veritabani ilk denemede hazir degil:", error);
  }
}

start();
