import { query } from "../config/db.js";

export async function getDashboardSummary(memberId: string) {
  const profile = await query<{
    full_name: string;
    email: string;
    role: "member" | "trainer" | "admin";
    membership_type: string | null;
    end_date: string | null;
    is_active: boolean | null;
  }>(
    `
      SELECT u.full_name, u.email, u.role, m.membership_type, m.end_date, m.is_active
      FROM users u
      LEFT JOIN memberships m ON m.user_id = u.id AND m.is_active = TRUE
      WHERE u.id = $1
    `,
    [memberId]
  );

  const baseProfile = profile.rows[0];

  if (!baseProfile) {
    throw new Error("Kullanıcı bulunamadı.");
  }

  const roleStatsPromise =
    baseProfile.role === "admin"
      ? query<{
          total_members: string;
          active_classes: string;
          visible_trainers: string;
        }>(
          `
            SELECT
              (SELECT COUNT(*) FROM users WHERE role = 'member')::text AS total_members,
              (SELECT COUNT(*) FROM classes WHERE starts_at >= NOW())::text AS active_classes,
              (SELECT COUNT(*) FROM trainers WHERE is_marketplace_visible = TRUE)::text AS visible_trainers
          `
        )
      : baseProfile.role === "trainer"
        ? query<{
            trainer_classes: string;
            trainer_reviews: string;
            avg_rating: string;
          }>(
            `
              SELECT
                COUNT(DISTINCT c.id)::text AS trainer_classes,
                COUNT(DISTINCT tr.id)::text AS trainer_reviews,
                COALESCE(MAX(t.rating_average), 0)::text AS avg_rating
              FROM trainers t
              LEFT JOIN classes c ON c.trainer_id = t.id
              LEFT JOIN trainer_reviews tr ON tr.trainer_id = t.id
              WHERE t.user_id = $1
            `,
            [memberId]
          )
        : query<{
            upcoming_classes: string;
            completed_visits: string;
            reward_badges: string;
          }>(
            `
              SELECT
                (SELECT COUNT(*) FROM class_bookings WHERE member_id = $1 AND status = 'booked')::text AS upcoming_classes,
                (SELECT COUNT(*) FROM attendance_logs WHERE member_id = $1)::text AS completed_visits,
                (SELECT COUNT(*) FROM member_badges WHERE member_id = $1)::text AS reward_badges
            `,
            [memberId]
          );

  const [wallet, bookings, trainers, roleStats] = await Promise.all([
    query<{
      points_balance: number;
      lifetime_points: number;
      tier_name: string;
    }>(
      `
        SELECT points_balance, lifetime_points, tier_name
        FROM member_reward_wallets
        WHERE member_id = $1
      `,
      [memberId]
    ),
    query<{ total_bookings: string; total_attendance: string }>(
      `
        SELECT
          COUNT(*) FILTER (WHERE status = 'booked')::text AS total_bookings,
          COUNT(*) FILTER (WHERE status = 'attended')::text AS total_attendance
        FROM class_bookings
        WHERE member_id = $1
      `,
      [memberId]
    ),
    query<{ favorite_trainers: string }>(
      `
        SELECT COUNT(*)::text AS favorite_trainers
        FROM trainer_reviews
        WHERE member_id = $1
      `,
      [memberId]
    ),
    roleStatsPromise
  ]);

  const liveMetrics = await query<{
    active_people: string;
    male_count: string;
    female_count: string;
    occupancy_rate: string;
  }>(
    `
      WITH active_attendance AS (
        SELECT DISTINCT ON (a.member_id)
          a.member_id,
          a.check_in_at,
          a.check_out_at
        FROM attendance_logs a
        ORDER BY a.member_id, a.check_in_at DESC
      )
      SELECT
        COUNT(*)::text AS active_people,
        COUNT(*) FILTER (WHERE u.gender = 'Erkek')::text AS male_count,
        COUNT(*) FILTER (WHERE u.gender = 'Kadın')::text AS female_count,
        ROUND((COUNT(*)::numeric / 300) * 100, 1)::text AS occupancy_rate
      FROM active_attendance aa
      JOIN users u ON u.id = aa.member_id
      WHERE aa.check_out_at IS NULL OR aa.check_out_at > NOW() - INTERVAL '2 hours'
    `
  );

  return {
    profile: baseProfile,
    wallet: wallet.rows[0] ?? {
      points_balance: 0,
      lifetime_points: 0,
      tier_name: "Starter"
    },
    stats: {
      totalBookings: Number(bookings.rows[0]?.total_bookings ?? 0),
      attendedClasses: Number(bookings.rows[0]?.total_attendance ?? 0),
      reviewedTrainers: Number(trainers.rows[0]?.favorite_trainers ?? 0)
    },
    roleStats: {
      ...(roleStats.rows[0] ?? {}),
      activePeople: Number(liveMetrics.rows[0]?.active_people ?? 0),
      maleCount: Number(liveMetrics.rows[0]?.male_count ?? 0),
      femaleCount: Number(liveMetrics.rows[0]?.female_count ?? 0),
      occupancyRate: Number(liveMetrics.rows[0]?.occupancy_rate ?? 0)
    }
  };
}
