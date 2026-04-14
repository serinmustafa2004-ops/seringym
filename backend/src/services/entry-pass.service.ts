import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { getClient, query } from "../config/db.js";

type PassPayload = {
  type: "entry_pass";
  sub: string;
};

export async function getEntryPass(userId: string, role: "member" | "trainer" | "admin") {
  if (role !== "member") {
    throw new Error("Salon giriş kare kodu sadece üye hesabında görüntülenebilir.");
  }

  const userResult = await query<{
    full_name: string;
    username: string | null;
  }>(
    `
      SELECT full_name, username
      FROM users
      WHERE id = $1
      LIMIT 1
    `,
    [userId]
  );

  const user = userResult.rows[0];
  if (!user) {
    throw new Error("Üye bulunamadı.");
  }

  const statusResult = await query<{
    check_in_at: string;
    check_out_at: string | null;
  }>(
    `
      SELECT check_in_at::text, check_out_at::text
      FROM attendance_logs
      WHERE member_id = $1
      ORDER BY check_in_at DESC
      LIMIT 1
    `,
    [userId]
  );

  const latestStatus = statusResult.rows[0];
  const isInside = Boolean(latestStatus && latestStatus.check_out_at === null);

  const token = jwt.sign({ type: "entry_pass", sub: userId } satisfies PassPayload, env.JWT_SECRET, {
    expiresIn: "12h"
  });
  const qrValue = `SerinGym|Giris|${user.username ?? userId}|${token}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(qrValue)}`;

  return {
    fullName: user.full_name,
    username: user.username,
    passToken: token,
    qrUrl,
    expiresInHours: 12,
    currentStatus: isInside ? "İçeride" : "Dışarıda",
    lastActionAt: latestStatus?.check_out_at ?? latestStatus?.check_in_at ?? null
  };
}

export async function scanEntryPass(
  passToken: string,
  role: "member" | "trainer" | "admin"
) {
  if (role !== "admin") {
    throw new Error("Kare kod okutma işlemi sadece yönetici alanında kullanılabilir.");
  }

  let payload: PassPayload;

  try {
    payload = jwt.verify(passToken, env.JWT_SECRET) as PassPayload;
  } catch {
    throw new Error("Kare kod geçersiz veya süresi dolmuş.");
  }

  if (payload.type !== "entry_pass") {
    throw new Error("Geçersiz giriş kare kodu.");
  }

  const client = await getClient();

  try {
    await client.query("BEGIN");

    const userResult = await client.query<{
      id: string;
      full_name: string;
      role: "member" | "trainer" | "admin";
    }>(
      `
        SELECT id, full_name, role
        FROM users
        WHERE id = $1
        LIMIT 1
      `,
      [payload.sub]
    );

    const user = userResult.rows[0];
    if (!user || user.role !== "member") {
      throw new Error("Bu kare kod bir üyeye ait değil.");
    }

    const openLogResult = await client.query<{
      id: string;
      check_in_at: string;
    }>(
      `
        SELECT id, check_in_at::text
        FROM attendance_logs
        WHERE member_id = $1 AND check_out_at IS NULL
        ORDER BY check_in_at DESC
        LIMIT 1
        FOR UPDATE
      `,
      [user.id]
    );

    if (openLogResult.rows[0]) {
      await client.query(
        `
          UPDATE attendance_logs
          SET check_out_at = NOW()
          WHERE id = $1
        `,
        [openLogResult.rows[0].id]
      );

      await client.query("COMMIT");

      return {
        action: "check_out",
        fullName: user.full_name,
        message: `${user.full_name} için çıkış işlemi kaydedildi.`
      };
    }

    await client.query(
      `
        INSERT INTO attendance_logs (member_id, check_in_at, access_method)
        VALUES ($1, NOW(), 'qr')
      `,
      [user.id]
    );

    await client.query("COMMIT");

    return {
      action: "check_in",
      fullName: user.full_name,
      message: `${user.full_name} için giriş işlemi kaydedildi.`
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function getRecentEntryScans(role: "member" | "trainer" | "admin") {
  if (role !== "admin") {
    throw new Error("Son giriş hareketleri sadece yönetici alanında görüntülenebilir.");
  }

  const result = await query<{
    id: string;
    full_name: string;
    check_in_at: string;
    check_out_at: string | null;
    access_method: string;
  }>(
    `
      SELECT
        a.id,
        u.full_name,
        a.check_in_at::text,
        a.check_out_at::text,
        a.access_method
      FROM attendance_logs a
      JOIN users u ON u.id = a.member_id
      ORDER BY a.check_in_at DESC
      LIMIT 10
    `
  );

  return {
    records: result.rows.map((row) => ({
      id: row.id,
      fullName: row.full_name,
      status: row.check_out_at ? "Çıkış Yaptı" : "İçeride",
      checkInAt: row.check_in_at,
      checkOutAt: row.check_out_at,
      accessMethod: row.access_method === "qr" ? "Kare Kod" : "Kart"
    }))
  };
}
