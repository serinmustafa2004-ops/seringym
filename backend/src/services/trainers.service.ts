import { query } from "../config/db.js";

type Filters = {
  specialty?: string;
  minRating?: number;
};

export async function listMarketplaceTrainers(filters: Filters) {
  const params: unknown[] = [];
  const where: string[] = ["t.is_marketplace_visible = TRUE"];

  if (filters.specialty) {
    params.push(filters.specialty);
    where.push(`$${params.length} = ANY(t.specialties)`);
  }

  if (filters.minRating) {
    params.push(filters.minRating);
    where.push(`t.rating_average >= $${params.length}`);
  }

  const sql = `
    SELECT
      t.id,
      u.full_name,
      u.avatar_url,
      t.title,
      t.specialties,
      t.bio,
      t.hourly_rate,
      t.years_of_experience,
      t.rating_average,
      t.rating_count,
      COALESCE(
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'name', tc.name,
            'issuer', tc.issuer
          )
        ) FILTER (WHERE tc.id IS NOT NULL),
        '[]'
      ) AS certificates
    FROM trainers t
    JOIN users u ON u.id = t.user_id
    LEFT JOIN trainer_certificates tc ON tc.trainer_id = t.id
    WHERE ${where.join(" AND ")}
    GROUP BY t.id, u.full_name, u.avatar_url
    ORDER BY t.rating_average DESC, t.rating_count DESC
  `;

  const result = await query(sql, params);

  const trainerIds = result.rows.map((row: any) => row.id);

  const reviews = trainerIds.length
    ? await query(
        `
          SELECT
            tr.trainer_id,
            u.full_name,
            tr.rating,
            tr.comment,
            tr.created_at
          FROM trainer_reviews tr
          JOIN users u ON u.id = tr.member_id
          WHERE tr.trainer_id = ANY($1::uuid[])
          ORDER BY tr.created_at DESC
        `,
        [trainerIds]
      )
    : { rows: [] as any[] };

  return result.rows.map((trainer: any) => ({
    ...trainer,
    reviews: reviews.rows.filter((review: any) => review.trainer_id === trainer.id)
  }));
}

export async function addTrainerReview(
  trainerId: string,
  memberId: string,
  rating: number,
  comment: string
) {
  await query(
    `
      INSERT INTO trainer_reviews (trainer_id, member_id, rating, comment)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (trainer_id, member_id)
      DO UPDATE SET
        rating = EXCLUDED.rating,
        comment = EXCLUDED.comment,
        created_at = NOW()
    `,
    [trainerId, memberId, rating, comment]
  );

  await query(
    `
      UPDATE trainers
      SET
        rating_average = COALESCE((
          SELECT ROUND(AVG(rating)::numeric, 2)
          FROM trainer_reviews
          WHERE trainer_id = $1
        ), 0),
        rating_count = (
          SELECT COUNT(*)
          FROM trainer_reviews
          WHERE trainer_id = $1
        )
      WHERE id = $1
    `,
    [trainerId]
  );

  return { message: "Yorum kaydedildi." };
}
