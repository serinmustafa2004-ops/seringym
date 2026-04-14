import { query } from "../config/db.js";

export async function getRecommendations(userId: string, role: "member" | "trainer" | "admin") {
  if (role === "member") {
    const [goalResult, statsResult, programResult] = await Promise.all([
      query<{
        primary_goal: string;
        training_level: string;
        preferred_days_per_week: number;
        focus_areas: string[];
        limitations: string | null;
      }>(
        `
          SELECT primary_goal, training_level, preferred_days_per_week, focus_areas, limitations
          FROM member_goals
          WHERE member_id = $1
        `,
        [userId]
      ),
      query<{ visits: string; booked_classes: string; total_paid: string }>(
        `
          SELECT
            (SELECT COUNT(*) FROM attendance_logs WHERE member_id = $1)::text AS visits,
            (SELECT COUNT(*) FROM class_bookings WHERE member_id = $1 AND status = 'booked')::text AS booked_classes,
            (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE user_id = $1)::text AS total_paid
        `,
        [userId]
      ),
      query<{ active_programs: string }>(
        `
          SELECT COUNT(*)::text AS active_programs
          FROM workout_programs
          WHERE member_id = $1 AND status = 'active'
        `,
        [userId]
      )
    ]);

    const goal = goalResult.rows[0];
    const stats = statsResult.rows[0];
    const activePrograms = programResult.rows[0]?.active_programs ?? "0";

    return {
      role,
      insights: [
        {
          title: "Haftalık yük dengesi",
          description: `${goal?.preferred_days_per_week ?? 3} gün hedefin için ${stats?.booked_classes ?? 0} rezervasyon görünür durumda. Güç ve kondisyonu dengelemek için bir alt vücut, bir kondisyon, bir core günü koru.`
        },
        {
          title: "Odak alanı önerisi",
          description: `${goal?.primary_goal ?? "Performans gelişimi"} hedefin nedeniyle ${goal?.focus_areas?.join(", ") ?? "genel kuvvet"} odaklarını önceliklendir. ${goal?.limitations ? `Dikkat edilmesi gereken not: ${goal.limitations}.` : ""}`
        },
        {
          title: "Program sürekliliği",
          description: `Sistemde ${activePrograms} aktif programın var ve toplam ${stats?.visits ?? 0} salon ziyaretin görünüyor. Düzeni korumak için aynı saat bloklarında çalışmaya devam et.`
        }
      ]
    };
  }

  if (role === "trainer") {
    const statsResult = await query<{
      avg_rating: string;
      review_count: string;
      earnings: string;
      active_programs: string;
    }>(
      `
        SELECT
          COALESCE(t.rating_average, 0)::text AS avg_rating,
          COALESCE(t.rating_count, 0)::text AS review_count,
          COALESCE(earnings.total_earnings, 0)::text AS earnings,
          COALESCE(programs.active_programs, 0)::text AS active_programs
        FROM trainers t
        LEFT JOIN (
          SELECT trainer_id, SUM(trainer_share) AS total_earnings
          FROM payments
          GROUP BY trainer_id
        ) earnings ON earnings.trainer_id = t.id
        LEFT JOIN (
          SELECT trainer_id, COUNT(*) AS active_programs
          FROM workout_programs
          WHERE status = 'active'
          GROUP BY trainer_id
        ) programs ON programs.trainer_id = t.id
        WHERE t.user_id = $1
      `,
      [userId]
    );

    const stats = statsResult.rows[0];
    return {
      role,
      insights: [
        {
          title: "Gelir optimizasyonu",
          description: `Toplam antrenör kazancın ${stats?.earnings ?? 0} TL. Özel ders dönüşümünü artırmak için yüksek puanlı paketleri vitrine çıkar.`
        },
        {
          title: "İtibar koruması",
          description: `Ortalama puanın ${stats?.avg_rating ?? 0} ve ${stats?.review_count ?? 0} yorumun var. Yeni üyelere ilk 2 hafta ölçüm takibi sunmak yorum kalitesini artırır.`
        },
        {
          title: "Program yükü",
          description: `${stats?.active_programs ?? 0} aktif program yönetiyorsun. Her programda ilerleme notu alanı eklemek üye bağlılığını güçlendirir.`
        }
      ]
    };
  }

  const statsResult = await query<{
    gross_revenue: string;
    gym_revenue: string;
    trainer_payouts: string;
    active_members: string;
  }>(
    `
      SELECT
        (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE payment_status = 'paid')::text AS gross_revenue,
        (SELECT COALESCE(SUM(gym_share), 0) FROM payments WHERE payment_status = 'paid')::text AS gym_revenue,
        (SELECT COALESCE(SUM(trainer_share), 0) FROM payments WHERE payment_status = 'paid')::text AS trainer_payouts,
        (SELECT COUNT(*) FROM memberships WHERE is_active = TRUE)::text AS active_members
    `
  );

  const stats = statsResult.rows[0];
  return {
    role,
    insights: [
      {
        title: "Gelir görünürlüğü",
        description: `Toplam tahsilat ${stats?.gross_revenue ?? 0} TL, salon payı ${stats?.gym_revenue ?? 0} TL. En kârlı kategorileri ayrı grafik olarak izlemek doğru olur.`
      },
      {
        title: "Antrenör maliyeti",
        description: `Antrenör ödemeleri ${stats?.trainer_payouts ?? 0} TL seviyesinde. Eğitmen başına gelir ve yorum puanını aynı tabloda göstermek karar hızını artırır.`
      },
      {
        title: "Üye tutundurma",
        description: `Aktif üyelik sayısı ${stats?.active_members ?? 0}. Üyelik bitişine 7 gün kalanlara otomatik teklif akışı eklemek gelir kaybını azaltır.`
      }
    ]
  };
}
