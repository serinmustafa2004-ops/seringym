import bcrypt from "bcryptjs";
import { getClient, query } from "../config/db.js";
import { bildirimOlustur } from "./notifications.service.js";

type YeniKullaniciGirdisi = {
  fullName: string;
  username: string;
  email: string;
  role: "member" | "trainer" | "admin";
  phone?: string;
  gender?: string;
  password: string;
  membershipType?: "daily" | "monthly" | "yearly";
  trainerTitle?: string;
  trainerHourlyRate?: number;
  trainerBio?: string;
  specialties?: string[];
};

type KullaniciGuncellemeGirdisi = {
  fullName: string;
  username: string;
  email: string;
  phone?: string;
  gender?: string;
  membershipType?: "daily" | "monthly" | "yearly";
  trainerTitle?: string;
  trainerHourlyRate?: number;
  trainerBio?: string;
  specialties?: string[];
};

function roleText(role: string) {
  if (role === "member") return "Üye";
  if (role === "trainer") return "Antrenör";
  return "Yönetici";
}

function membershipText(type?: string | null) {
  if (type === "daily") return "Günlük";
  if (type === "monthly") return "Aylık";
  if (type === "yearly") return "Yıllık";
  return "-";
}

function csvEscape(value: string | number | null | undefined) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

export async function getAdminUserOverview(role: "member" | "trainer" | "admin") {
  if (role !== "admin") {
    throw new Error("Bu alan sadece yönetici için kullanılabilir.");
  }

  const [summaryResult, usersResult] = await Promise.all([
    query<{
      total_users: string;
      total_members: string;
      total_trainers: string;
      total_admins: string;
    }>(
      `
        SELECT
          COUNT(*)::text AS total_users,
          COUNT(*) FILTER (WHERE role = 'member')::text AS total_members,
          COUNT(*) FILTER (WHERE role = 'trainer')::text AS total_trainers,
          COUNT(*) FILTER (WHERE role = 'admin')::text AS total_admins
        FROM users
      `
    ),
    query<{
      id: string;
      full_name: string;
      username: string | null;
      email: string;
      role: "member" | "trainer" | "admin";
      phone: string | null;
      gender: string | null;
      created_at: string;
      membership_type: string | null;
      trainer_title: string | null;
      hourly_rate: string | null;
      specialties: string[] | null;
    }>(
      `
        SELECT
          u.id,
          u.full_name,
          u.username,
          u.email,
          u.role,
          u.phone,
          u.gender,
          u.created_at::text,
          m.membership_type::text,
          t.title AS trainer_title,
          t.hourly_rate::text,
          t.specialties
        FROM users u
        LEFT JOIN LATERAL (
          SELECT membership_type
          FROM memberships
          WHERE user_id = u.id AND is_active = TRUE
          ORDER BY end_date DESC
          LIMIT 1
        ) m ON TRUE
        LEFT JOIN trainers t ON t.user_id = u.id
        ORDER BY u.created_at DESC, u.full_name ASC
      `
    )
  ]);

  return {
    summary: summaryResult.rows[0] ?? {
      total_users: "0",
      total_members: "0",
      total_trainers: "0",
      total_admins: "0"
    },
    users: usersResult.rows
  };
}

export async function createManagedUser(role: "member" | "trainer" | "admin", payload: YeniKullaniciGirdisi) {
  if (role !== "admin") {
    throw new Error("Bu alan sadece yönetici için kullanılabilir.");
  }

  const client = await getClient();

  try {
    await client.query("BEGIN");
    const passwordHash = await bcrypt.hash(payload.password, 10);

    const userResult = await client.query<{ id: string }>(
      `
        INSERT INTO users (full_name, username, email, password_hash, role, phone, gender)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `,
      [
        payload.fullName,
        payload.username,
        payload.email,
        passwordHash,
        payload.role,
        payload.phone ?? null,
        payload.gender ?? "Belirtilmedi"
      ]
    );

    const userId = userResult.rows[0].id;

    if (payload.role === "member") {
      await client.query(
        `
          INSERT INTO memberships (user_id, membership_type, start_date, end_date, is_active, monthly_price, remaining_freezes)
          VALUES ($1, $2, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', TRUE, 2250, 1)
        `,
        [userId, payload.membershipType ?? "monthly"]
      );

      await client.query(
        `
          INSERT INTO member_reward_wallets (member_id, points_balance, lifetime_points, tier_name)
          VALUES ($1, 0, 0, 'Başlangıç')
          ON CONFLICT (member_id) DO NOTHING
        `,
        [userId]
      );
    }

    if (payload.role === "trainer") {
      await client.query(
        `
          INSERT INTO trainers (user_id, title, specialties, bio, hourly_rate, years_of_experience, rating_average, rating_count, is_marketplace_visible)
          VALUES ($1, $2, $3, $4, $5, 1, 0, 0, TRUE)
        `,
        [
          userId,
          payload.trainerTitle ?? "Kişisel Antrenör",
          payload.specialties ?? ["Genel Fitness"],
          payload.trainerBio ?? "Yeni eklenen antrenör profili.",
          payload.trainerHourlyRate ?? 900
        ]
      );
    }

    await client.query("COMMIT");
    await bildirimOlustur(userId, "Hesabınız Oluşturuldu", "Yönetici hesabınızı sisteme tanımladı.", "sistem");

    return { message: "Kullanıcı başarıyla eklendi." };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function updateManagedUser(
  adminRole: "member" | "trainer" | "admin",
  userId: string,
  payload: KullaniciGuncellemeGirdisi
) {
  if (adminRole !== "admin") {
    throw new Error("Bu alan sadece yönetici için kullanılabilir.");
  }

  const roleResult = await query<{ role: "member" | "trainer" | "admin" }>(
    `SELECT role FROM users WHERE id = $1 LIMIT 1`,
    [userId]
  );
  const existingRole = roleResult.rows[0]?.role;
  if (!existingRole) {
    throw new Error("Güncellenecek kullanıcı bulunamadı.");
  }

  const client = await getClient();

  try {
    await client.query("BEGIN");

    await client.query(
      `
        UPDATE users
        SET full_name = $2, username = $3, email = $4, phone = $5, gender = $6, updated_at = NOW()
        WHERE id = $1
      `,
      [userId, payload.fullName, payload.username, payload.email, payload.phone ?? null, payload.gender ?? null]
    );

    if (existingRole === "member" && payload.membershipType) {
      await client.query(
        `
          UPDATE memberships
          SET membership_type = $2
          WHERE user_id = $1 AND is_active = TRUE
        `,
        [userId, payload.membershipType]
      );
    }

    if (existingRole === "trainer") {
      await client.query(
        `
          UPDATE trainers
          SET title = $2,
              specialties = $3,
              bio = $4,
              hourly_rate = $5
          WHERE user_id = $1
        `,
        [
          userId,
          payload.trainerTitle ?? "Kişisel Antrenör",
          payload.specialties ?? ["Genel Fitness"],
          payload.trainerBio ?? "Antrenör profili güncellendi.",
          payload.trainerHourlyRate ?? 900
        ]
      );
    }

    await client.query("COMMIT");
    await bildirimOlustur(userId, "Profil Güncellendi", "Yönetici hesap bilgilerinizi güncelledi.", "sistem");
    return { message: "Kullanıcı bilgileri güncellendi." };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteManagedUser(adminRole: "member" | "trainer" | "admin", userId: string) {
  if (adminRole !== "admin") {
    throw new Error("Bu alan sadece yönetici için kullanılabilir.");
  }

  await query(`DELETE FROM users WHERE id = $1`, [userId]);
  return { message: "Kullanıcı sistemden kaldırıldı." };
}

export async function exportAdminReport(role: "member" | "trainer" | "admin", format: "excel" | "pdf") {
  if (role !== "admin") {
    throw new Error("Bu alan sadece yönetici için kullanılabilir.");
  }

  const result = await query<{
    paid_at: string;
    member_name: string;
    trainer_name: string | null;
    amount: string;
    gym_share: string;
    trainer_share: string;
    payment_category: string;
    payment_method: string;
    invoice_no: string | null;
    description: string | null;
  }>(
    `
      SELECT
        p.paid_at::text,
        member_user.full_name AS member_name,
        trainer_user.full_name AS trainer_name,
        p.amount::text,
        p.gym_share::text,
        p.trainer_share::text,
        p.payment_category,
        p.payment_method,
        p.invoice_no,
        p.description
      FROM payments p
      JOIN users member_user ON member_user.id = p.user_id
      LEFT JOIN trainers t ON t.id = p.trainer_id
      LEFT JOIN users trainer_user ON trainer_user.id = t.user_id
      ORDER BY p.paid_at DESC
      LIMIT 400
    `
  );

  if (format === "excel") {
    const header = [
      "Tarih",
      "Üye",
      "Antrenör",
      "İşlem",
      "Tutar",
      "Salon Payı",
      "Antrenör Payı",
      "Ödeme Yöntemi",
      "Fatura No",
      "Açıklama"
    ];
    const rows = result.rows.map((row) => [
      new Date(row.paid_at).toLocaleString("tr-TR"),
      row.member_name,
      row.trainer_name ?? "-",
      row.payment_category === "membership" ? "Üyelik" : "Özel Ders",
      row.amount,
      row.gym_share,
      row.trainer_share,
      row.payment_method === "credit_card" ? "Kredi Kartı" : row.payment_method,
      row.invoice_no ?? "-",
      row.description ?? "-"
    ]);

    const csv = [header, ...rows].map((line) => line.map(csvEscape).join(";")).join("\n");

    return {
      filename: "seringym-yonetim-raporu.csv",
      contentType: "text/csv; charset=utf-8",
      body: `\uFEFF${csv}`
    };
  }

  const rowsHtml = result.rows
    .map(
      (row) => `
        <tr>
          <td>${new Date(row.paid_at).toLocaleString("tr-TR")}</td>
          <td>${row.member_name}</td>
          <td>${row.trainer_name ?? "-"}</td>
          <td>${row.payment_category === "membership" ? "Üyelik" : "Özel Ders"}</td>
          <td>${row.amount} TL</td>
          <td>${row.gym_share} TL</td>
          <td>${row.trainer_share} TL</td>
          <td>${row.invoice_no ?? "-"}</td>
        </tr>
      `
    )
    .join("");

  return {
    filename: "seringym-yonetim-raporu.html",
    contentType: "text/html; charset=utf-8",
    body: `
      <!doctype html>
      <html lang="tr">
        <head>
          <meta charset="utf-8" />
          <title>SerinGym Yönetim Raporu</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 32px; color: #161616; }
            h1 { margin-bottom: 8px; }
            p { color: #555; }
            table { width: 100%; border-collapse: collapse; margin-top: 24px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 13px; }
            th { background: #f3f3f3; }
          </style>
        </head>
        <body>
          <h1>SerinGym Yönetim Raporu</h1>
          <p>Bu görünüm tarayıcıdan yazdırılarak PDF olarak kaydedilebilir.</p>
          <table>
            <thead>
              <tr>
                <th>Tarih</th>
                <th>Üye</th>
                <th>Antrenör</th>
                <th>İşlem</th>
                <th>Tutar</th>
                <th>Salon Payı</th>
                <th>Antrenör Payı</th>
                <th>Fatura No</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </body>
      </html>
    `
  };
}
