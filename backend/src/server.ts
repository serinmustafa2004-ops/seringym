import { app } from "./app.js";
import { env } from "./config/env.js";
import { pool } from "./config/db.js";

async function start() {
  const port = Number(env.PORT);
  const server = app.listen(port, () => {
    console.log(`API running on http://localhost:${port}`);
  });

  server.on("error", (error) => {
    console.error("HTTP sunucusu baslatilamadi:", error);
    process.exit(1);
  });

  try {
    await pool.query("SELECT NOW()");
    console.log("Veritabani baglantisi hazir.");
  } catch (error) {
    console.error("Veritabani ilk denemede hazir degil:", error);
  }
}

start().catch((error) => {
  console.error("Sunucu acilisinda beklenmeyen hata:", error);
  process.exit(1);
});
