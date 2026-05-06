import { getClient, query } from "../config/db.js";
import { topluBildirimOlustur } from "./notifications.service.js";

type CreateProgramInput = {
  memberId: string;
  title: string;
  goalSummary: string;
  notes?: string;
  days: Array<{
    dayIndex: number;
    dayLabel: string;
    focusArea: string;
    exerciseName: string;
    sets: string;
    reps: string;
    restSeconds: number;
    notes?: string;
  }>;
};

export async function getProgramsOverview(userId: string, role: "member" | "trainer" | "admin") {
  const memberFilter = role === "member" ? "WHERE wp.member_id = $1" : "";
  const trainerFilter = role === "trainer" ? "WHERE t.user_id = $1" : "";

  const programsResult =
    role === "member"
      ? await query(
          `
            SELECT
              wp.id,
              wp.title,
              wp.goal_summary,
              wp.notes,
              wp.status,
              wp.created_at::text,
              member_user.full_name AS member_name,
              trainer_user.full_name AS trainer_name
            FROM workout_programs wp
            JOIN users member_user ON member_user.id = wp.member_id
            JOIN trainers t ON t.id = wp.trainer_id
            JOIN users trainer_user ON trainer_user.id = t.user_id
            ${memberFilter}
            ORDER BY wp.created_at DESC
          `,
          [userId]
        )
      : await query(
          `
            SELECT
              wp.id,
              wp.title,
              wp.goal_summary,
              wp.notes,
              wp.status,
              wp.created_at::text,
              member_user.full_name AS member_name,
              trainer_user.full_name AS trainer_name
            FROM workout_programs wp
            JOIN users member_user ON member_user.id = wp.member_id
            JOIN trainers t ON t.id = wp.trainer_id
            JOIN users trainer_user ON trainer_user.id = t.user_id
            ${trainerFilter}
            ORDER BY wp.created_at DESC
          `,
          role === "trainer" ? [userId] : []
        );

  const programIds = programsResult.rows.map((program: any) => program.id);
  const daysResult = programIds.length
    ? await query(
        `
          SELECT
            program_id,
            day_index,
            day_label,
            focus_area,
            exercise_name,
            sets,
            reps,
            rest_seconds,
            notes
          FROM workout_program_days
          WHERE program_id = ANY($1::uuid[])
          ORDER BY day_index ASC, exercise_name ASC
        `,
        [programIds]
      )
    : { rows: [] as any[] };

  const membersResult =
    role !== "member"
      ? await query<{ id: string; full_name: string; username: string | null; email: string }>(
          `
            SELECT DISTINCT id, full_name, username, email
            FROM users
            WHERE role = 'member'
            ORDER BY full_name ASC, username ASC NULLS LAST, email ASC
          `
        )
      : { rows: [] as any[] };

  const memberNameCounts = new Map<string, number>();
  for (const member of membersResult.rows) {
    memberNameCounts.set(member.full_name, (memberNameCounts.get(member.full_name) ?? 0) + 1);
  }

  const assignableMembers = membersResult.rows.map((member) => {
    const hasDuplicateName = (memberNameCounts.get(member.full_name) ?? 0) > 1;
    const suffix = member.username ?? member.email.split("@")[0];

    return {
      ...member,
      display_name: hasDuplicateName ? `${member.full_name} • ${suffix}` : member.full_name
    };
  });

  return {
    role,
    assignableMembers,
    programs: programsResult.rows.map((program: any) => ({
      ...program,
      days: daysResult.rows.filter((day: any) => day.program_id === program.id)
    }))
  };
}

export async function createWorkoutProgram(
  userId: string,
  role: "member" | "trainer" | "admin",
  payload: CreateProgramInput
) {
  const trainerResult =
    role === "trainer"
      ? await query<{ trainer_id: string }>(
          `SELECT id AS trainer_id FROM trainers WHERE user_id = $1 LIMIT 1`,
          [userId]
        )
      : await query<{ trainer_id: string }>(
          `SELECT id AS trainer_id FROM trainers ORDER BY years_of_experience DESC LIMIT 1`
        );

  const trainerId = trainerResult.rows[0]?.trainer_id;
  if (!trainerId) {
    throw new Error("Programı yazacak antrenör bulunamadı.");
  }

  const client = await getClient();

  try {
    await client.query("BEGIN");

    const programInsert = await client.query<{ id: string }>(
      `
        INSERT INTO workout_programs (trainer_id, member_id, title, goal_summary, notes, status)
        VALUES ($1, $2, $3, $4, $5, 'active')
        RETURNING id
      `,
      [trainerId, payload.memberId, payload.title, payload.goalSummary, payload.notes ?? null]
    );

    const programId = programInsert.rows[0].id;

    for (const day of payload.days) {
      await client.query(
        `
          INSERT INTO workout_program_days (
            program_id,
            day_index,
            day_label,
            focus_area,
            exercise_name,
            sets,
            reps,
            rest_seconds,
            notes
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `,
        [
          programId,
          day.dayIndex,
          day.dayLabel,
          day.focusArea,
          day.exerciseName,
          day.sets,
          day.reps,
          day.restSeconds,
          day.notes ?? null
        ]
      );
    }

    await client.query("COMMIT");
    const adminIds = await query<{ id: string }>(`SELECT id FROM users WHERE role = 'admin'`);
    const trainerUserIds = await query<{ user_id: string }>(`SELECT user_id FROM trainers WHERE id = $1`, [trainerId]);
    await topluBildirimOlustur(
      [payload.memberId, trainerUserIds.rows[0]?.user_id ?? "", ...adminIds.rows.map((item) => item.id)],
      "Yeni Program Atandı",
      `${payload.title} programı sisteme eklendi.`,
      "program"
    );
    return { message: "Antrenman programı kaydedildi." };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
