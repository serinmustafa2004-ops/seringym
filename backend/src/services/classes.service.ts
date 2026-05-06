import { query } from "../config/db.js";

type UserRole = "member" | "trainer" | "admin";

export async function listClasses(userId: string, role: UserRole) {
  const result = await query(
    `
      SELECT
        c.id,
        c.name,
        c.category,
        c.description,
        c.capacity,
        c.starts_at,
        c.ends_at,
        c.room_name,
        u.full_name AS trainer_name,
        COUNT(cb.id)::int AS reserved_count,
        BOOL_OR(cb.member_id = $1 AND cb.status = 'booked') AS is_booked,
        'group_class'::text AS class_kind,
        NULL::int AS session_count
      FROM classes c
      JOIN trainers t ON t.id = c.trainer_id
      JOIN users u ON u.id = t.user_id
      LEFT JOIN class_bookings cb ON cb.class_id = c.id AND cb.status = 'booked'
      GROUP BY c.id, u.full_name

      UNION ALL

      SELECT
        ('payment-' || p.id)::text AS id,
        'Özel Ders Paketi' AS name,
        'Birebir Çalışma' AS category,
        COALESCE(
          p.description,
          trainer_user.full_name || ' ile satın alınan özel ders paketi'
        ) AS description,
        COALESCE(p.session_count, 1) AS capacity,
        p.paid_at AS starts_at,
        p.paid_at AS ends_at,
        'Randevu Planlaması' AS room_name,
        trainer_user.full_name AS trainer_name,
        0::int AS reserved_count,
        TRUE AS is_booked,
        'special_lesson'::text AS class_kind,
        p.session_count
      FROM payments p
      JOIN trainers t ON t.id = p.trainer_id
      JOIN users trainer_user ON trainer_user.id = t.user_id
      WHERE
        $2 = 'member'
        AND p.user_id = $1
        AND p.payment_category = 'personal_training'
        AND p.payment_status = 'paid'

      ORDER BY starts_at ASC
    `,
    [userId, role]
  );

  return result.rows;
}

export async function bookClass(memberId: string, classId: string) {
  const capacityResult = await query<{ capacity: number; reserved_count: string }>(
    `
      SELECT c.capacity, COUNT(cb.id)::text AS reserved_count
      FROM classes c
      LEFT JOIN class_bookings cb ON cb.class_id = c.id AND cb.status = 'booked'
      WHERE c.id = $1
      GROUP BY c.id
    `,
    [classId]
  );

  const record = capacityResult.rows[0];

  if (!record) {
    throw new Error("Ders bulunamadı.");
  }

  if (Number(record.reserved_count) >= record.capacity) {
    throw new Error("Ders kapasitesi dolu.");
  }

  await query(
    `
      INSERT INTO class_bookings (class_id, member_id, status)
      VALUES ($1, $2, 'booked')
      ON CONFLICT (class_id, member_id)
      DO UPDATE SET status = 'booked', booked_at = NOW()
    `,
    [classId, memberId]
  );

  return { message: "Rezervasyon oluşturuldu." };
}
