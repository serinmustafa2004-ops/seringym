import { getClient, query } from "../config/db.js";
import { topluBildirimOlustur } from "./notifications.service.js";

export async function getRewardOverview(memberId: string) {
  const [walletResult, badgesResult, rewardsResult, transactionsResult] = await Promise.all([
    query<{ points_balance: number; lifetime_points: number; tier_name: string }>(
      `
        SELECT points_balance, lifetime_points, tier_name
        FROM member_reward_wallets
        WHERE member_id = $1
      `,
      [memberId]
    ),
    query<{ name: string; description: string; icon: string; earned_at: string }>(
      `
        SELECT b.name, b.description, b.icon, mb.earned_at
        FROM member_badges mb
        JOIN badges b ON b.id = mb.badge_id
        WHERE mb.member_id = $1
        ORDER BY mb.earned_at DESC
      `,
      [memberId]
    ),
    query<{ id: string; name: string; description: string; points_cost: number; reward_type: string }>(
      `
        SELECT id, name, description, points_cost, reward_type
        FROM rewards
        WHERE is_active = TRUE
        ORDER BY points_cost ASC
      `
    ),
    query<{ reason: string; points: number; transaction_type: string; created_at: string }>(
      `
        SELECT reason, points, transaction_type, created_at
        FROM reward_transactions
        WHERE member_id = $1
        ORDER BY created_at DESC
        LIMIT 8
      `,
      [memberId]
    )
  ]);

  return {
    wallet: walletResult.rows[0],
    badges: badgesResult.rows,
    rewards: rewardsResult.rows,
    transactions: transactionsResult.rows
  };
}

export async function redeemReward(memberId: string, rewardId: string) {
  const rewardResult = await query<{ id: string; points_cost: number; name: string }>(
    `
      SELECT id, points_cost, name
      FROM rewards
      WHERE id = $1 AND is_active = TRUE
    `,
    [rewardId]
  );

  const reward = rewardResult.rows[0];

  if (!reward) {
    throw new Error("Ödül bulunamadı.");
  }

  const walletResult = await query<{ points_balance: number }>(
    `
      SELECT points_balance
      FROM member_reward_wallets
      WHERE member_id = $1
    `,
    [memberId]
  );

  const wallet = walletResult.rows[0];

  if (!wallet || wallet.points_balance < reward.points_cost) {
    throw new Error("Yetersiz puan.");
  }

  const client = await getClient();

  try {
    await client.query("BEGIN");
    await client.query(
      `
        UPDATE member_reward_wallets
        SET points_balance = points_balance - $1
        WHERE member_id = $2
      `,
      [reward.points_cost, memberId]
    );

    await client.query(
      `
        INSERT INTO reward_transactions (member_id, reward_id, points, transaction_type, reason)
        VALUES ($1, $2, $3, 'redeem', $4)
      `,
      [memberId, reward.id, reward.points_cost, `${reward.name} kullanıldı`]
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  const redeemCode = `SERINGYM-${reward.name.slice(0, 3).toUpperCase()}-${reward.id.slice(0, 4)}-${memberId.slice(0, 4)}`;
  const qrValue = `SerinGym|Ödül|${reward.name}|${redeemCode}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(qrValue)}`;
  const adminIds = await query<{ id: string }>(`SELECT id FROM users WHERE role = 'admin'`);
  await topluBildirimOlustur(
    [memberId, ...adminIds.rows.map((item) => item.id)],
    "Ödül Teslim Talebi",
    `${reward.name} ödülü için kare kod üretildi.`,
    "odul"
  );

  return {
    message: "Ödül başarıyla kullanıldı.",
    rewardName: reward.name,
    redeemCode,
    qrUrl
  };
}
