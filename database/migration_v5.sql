UPDATE member_reward_wallets
SET
  points_balance = 1200,
  lifetime_points = GREATEST(lifetime_points, 1800),
  tier_name = 'Gold'
WHERE member_id = '22222222-2222-2222-2222-222222222222';

INSERT INTO reward_transactions (member_id, points, transaction_type, reason)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  780,
  'adjustment',
  'Test için puan bakiyesi yükseltildi'
);
