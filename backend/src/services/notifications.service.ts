import { query } from "../config/db.js";

type BildirimTuru = "odeme" | "program" | "odul" | "ders" | "guvenlik" | "sistem";

export async function bildirimOlustur(
  userId: string,
  baslik: string,
  mesaj: string,
  tur: BildirimTuru = "sistem"
) {
  await query(
    `
      INSERT INTO notifications (user_id, title, message, notification_type)
      VALUES ($1, $2, $3, $4)
    `,
    [userId, baslik, mesaj, tur]
  );
}

export async function topluBildirimOlustur(
  userIds: string[],
  baslik: string,
  mesaj: string,
  tur: BildirimTuru = "sistem"
) {
  const temizListe = Array.from(new Set(userIds.filter(Boolean)));
  if (!temizListe.length) return;

  for (const userId of temizListe) {
    await bildirimOlustur(userId, baslik, mesaj, tur);
  }
}

export async function bildirimleriGetir(userId: string, role: "member" | "trainer" | "admin") {
  const storedResult = await query<{
    id: string;
    title: string;
    message: string;
    notification_type: string;
    is_read: boolean;
    created_at: string;
  }>(
    `
      SELECT id, title, message, notification_type, is_read, created_at::text
      FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 12
    `,
    [userId]
  );

  const dynamicRows =
    role === "member"
      ? await query<{
          id: string;
          title: string;
          message: string;
          created_at: string;
        }>(
          `
            SELECT
              'yaklasan-ders-' || c.id AS id,
              'Ders Yaklaşıyor' AS title,
              c.name || ' dersi ' || to_char(c.starts_at, 'DD.MM.YYYY HH24:MI') || ' saatinde başlıyor.' AS message,
              c.starts_at::text AS created_at
            FROM class_bookings cb
            JOIN classes c ON c.id = cb.class_id
            WHERE cb.member_id = $1
              AND cb.status = 'booked'
              AND c.starts_at BETWEEN NOW() AND NOW() + INTERVAL '24 hours'
            ORDER BY c.starts_at ASC
            LIMIT 4
          `,
          [userId]
        )
      : { rows: [] as Array<{ id: string; title: string; message: string; created_at: string }> };

  const notifications = [
    ...dynamicRows.rows.map((row) => ({
      id: row.id,
      title: row.title,
      message: row.message,
      notificationType: "ders",
      isRead: false,
      createdAt: row.created_at
    })),
    ...storedResult.rows.map((row) => ({
      id: row.id,
      title: row.title,
      message: row.message,
      notificationType: row.notification_type,
      isRead: row.is_read,
      createdAt: row.created_at
    }))
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 12);

  return {
    unreadCount: notifications.filter((item) => !item.isRead).length,
    notifications
  };
}

export async function tumBildirimleriOkunduYap(userId: string) {
  await query(`UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE`, [userId]);
  return { message: "Bildirimler okundu olarak işaretlendi." };
}
