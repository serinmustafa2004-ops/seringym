import { query } from "../config/db.js";

export async function listClasses(memberId: string) {
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
        BOOL_OR(cb.member_id = $1 AND cb.status = 'booked') AS is_booked
      FROM classes c
      JOIN trainers t ON t.id = c.trainer_id
      JOIN users u ON u.id = t.user_id
      LEFT JOIN class_bookings cb ON cb.class_id = c.id AND cb.status = 'booked'
      GROUP BY c.id, u.full_name
      ORDER BY c.starts_at ASC
    `,
    [memberId]
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
