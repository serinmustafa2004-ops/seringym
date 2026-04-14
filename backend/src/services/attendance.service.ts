import { query } from "../config/db.js";

type Filters = {
  date?: string;
  from?: string;
  to?: string;
  member?: string;
};

export async function getAttendanceOverview(filters: Filters) {
  const params: unknown[] = [];
  const where: string[] = [];

  if (filters.date) {
    params.push(filters.date);
    where.push(`DATE(a.check_in_at) = $${params.length}`);
  }

  if (filters.from) {
    params.push(filters.from);
    where.push(`a.check_in_at >= $${params.length}::date`);
  }

  if (filters.to) {
    params.push(filters.to);
    where.push(`a.check_in_at < ($${params.length}::date + INTERVAL '1 day')`);
  }

  if (filters.member) {
    params.push(`%${filters.member}%`);
    where.push(`u.full_name ILIKE $${params.length}`);
  }

  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const [recordsResult, hourChartResult, dayChartResult] = await Promise.all([
    query<{
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
        ${whereClause}
        ORDER BY a.check_in_at DESC
        LIMIT 120
      `,
      params
    ),
    query<{ hour_label: string; total: string }>(
      `
        SELECT
          TO_CHAR(DATE_TRUNC('hour', a.check_in_at), 'HH24:00') AS hour_label,
          COUNT(*)::text AS total
        FROM attendance_logs a
        JOIN users u ON u.id = a.member_id
        ${whereClause}
        GROUP BY DATE_TRUNC('hour', a.check_in_at)
        ORDER BY DATE_TRUNC('hour', a.check_in_at)
      `,
      params
    ),
    query<{ day_label: string; total: string }>(
      `
        SELECT
          TO_CHAR(DATE(a.check_in_at), 'DD Mon') AS day_label,
          COUNT(*)::text AS total
        FROM attendance_logs a
        JOIN users u ON u.id = a.member_id
        ${whereClause}
        GROUP BY DATE(a.check_in_at)
        ORDER BY DATE(a.check_in_at)
      `,
      params
    )
  ]);

  return {
    records: recordsResult.rows,
    hourChart: hourChartResult.rows,
    dayChart: dayChartResult.rows
  };
}
