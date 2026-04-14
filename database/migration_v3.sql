INSERT INTO users (id, full_name, email, password_hash, role, phone, avatar_url)
VALUES
  ('55554444-4444-4444-4444-444444444444', 'Deniz Aksoy', 'deniz@gympro.local', '$2a$10$S9M8FGjJt94suBT76cKi1u0I6N6byN1Nsx3Rp3XIanFkFJxuxMxDP', 'trainer', '+905551010101', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d'),
  ('66665555-5555-5555-5555-555555555555', 'Buse Çetin', 'buse@gympro.local', '$2a$10$S9M8FGjJt94suBT76cKi1u0I6N6byN1Nsx3Rp3XIanFkFJxuxMxDP', 'trainer', '+905552020202', 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df')
ON CONFLICT (id) DO NOTHING;

INSERT INTO trainers (id, user_id, title, specialties, bio, hourly_rate, years_of_experience, rating_average, rating_count, is_marketplace_visible)
VALUES
  ('77776666-6666-6666-6666-666666666666', '55554444-4444-4444-4444-444444444444', 'Fonksiyonel Kuvvet Koçu', ARRAY['Kuvvet', 'HIIT', 'Atletik Performans'], 'Kuvvet ve kondisyon planlarını performans hedefiyle birleştiriyorum.', 950, 7, 4.7, 19, TRUE),
  ('88887777-7777-7777-7777-777777777777', '66665555-5555-5555-5555-555555555555', 'Yoga ve Duruş Uzmanı', ARRAY['Yoga', 'Postür', 'Esneklik'], 'Duruş bozukluğu ve esneklik odaklı kişisel planlar hazırlıyorum.', 780, 5, 4.8, 14, TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO trainer_certificates (trainer_id, name, issuer, issued_at)
VALUES
  ('77776666-6666-6666-6666-666666666666', 'TRX Coach', 'TRX Training', '2023-01-15'),
  ('88887777-7777-7777-7777-777777777777', 'Yoga Alliance RYT 200', 'Yoga Alliance', '2022-09-20')
ON CONFLICT DO NOTHING;

INSERT INTO users (id, full_name, email, password_hash, role, phone, avatar_url)
SELECT
  ('90000000-0000-0000-0000-' || LPAD(gs::text, 12, '0'))::uuid,
  'Üye ' || gs,
  'uye' || gs || '@seringym.local',
  '$2a$10$S9M8FGjJt94suBT76cKi1u0I6N6byN1Nsx3Rp3XIanFkFJxuxMxDP',
  'member',
  '+90553' || LPAD((1000000 + gs)::text, 7, '0'),
  NULL
FROM generate_series(1, 49) AS gs
ON CONFLICT (id) DO NOTHING;

INSERT INTO memberships (user_id, membership_type, start_date, end_date, is_active, monthly_price, remaining_freezes)
SELECT
  ('90000000-0000-0000-0000-' || LPAD(gs::text, 12, '0'))::uuid,
  CASE
    WHEN gs % 3 = 0 THEN 'yearly'::membership_type
    WHEN gs % 2 = 0 THEN 'monthly'::membership_type
    ELSE 'daily'::membership_type
  END,
  CURRENT_DATE - ((gs % 20) || ' days')::interval,
  CURRENT_DATE + ((20 + gs % 60) || ' days')::interval,
  TRUE,
  CASE
    WHEN gs % 3 = 0 THEN 1100
    WHEN gs % 2 = 0 THEN 1450
    ELSE 250
  END,
  1
FROM generate_series(1, 49) AS gs
ON CONFLICT DO NOTHING;

INSERT INTO member_reward_wallets (member_id, points_balance, lifetime_points, tier_name)
SELECT
  ('90000000-0000-0000-0000-' || LPAD(gs::text, 12, '0'))::uuid,
  50 + (gs * 7),
  100 + (gs * 12),
  CASE
    WHEN gs % 4 = 0 THEN 'Gold'
    WHEN gs % 2 = 0 THEN 'Silver'
    ELSE 'Starter'
  END
FROM generate_series(1, 49) AS gs
ON CONFLICT (member_id) DO NOTHING;

INSERT INTO member_goals (member_id, primary_goal, training_level, preferred_days_per_week, focus_areas, limitations)
SELECT
  ('90000000-0000-0000-0000-' || LPAD(gs::text, 12, '0'))::uuid,
  CASE
    WHEN gs % 3 = 0 THEN 'Kas kütlesi artırmak'
    WHEN gs % 2 = 0 THEN 'Yağ yakmak'
    ELSE 'Genel kondisyonu yükseltmek'
  END,
  CASE
    WHEN gs % 3 = 0 THEN 'İleri Seviye'
    WHEN gs % 2 = 0 THEN 'Orta Seviye'
    ELSE 'Başlangıç'
  END,
  3 + (gs % 3),
  CASE
    WHEN gs % 3 = 0 THEN ARRAY['Üst Vücut', 'Kuvvet']
    WHEN gs % 2 = 0 THEN ARRAY['Alt Vücut', 'Kardiyo']
    ELSE ARRAY['Core', 'Mobilite']
  END,
  NULL
FROM generate_series(1, 49) AS gs
ON CONFLICT (member_id) DO NOTHING;

INSERT INTO payments (id, user_id, trainer_id, amount, gym_share, trainer_share, currency, payment_category, payment_method, payment_status, invoice_no, description, paid_at)
SELECT
  ('91000000-0000-0000-0000-' || LPAD(gs::text, 12, '0'))::uuid,
  ('90000000-0000-0000-0000-' || LPAD(gs::text, 12, '0'))::uuid,
  CASE
    WHEN gs % 4 = 0 THEN '55555555-5555-5555-5555-555555555555'::uuid
    WHEN gs % 4 = 1 THEN '66666666-6666-6666-6666-666666666666'::uuid
    WHEN gs % 4 = 2 THEN '77776666-6666-6666-6666-666666666666'::uuid
    ELSE '88887777-7777-7777-7777-777777777777'::uuid
  END,
  900 + (gs * 10),
  250 + (gs * 2),
  650 + (gs * 8),
  'TRY',
  CASE
    WHEN gs % 2 = 0 THEN 'personal_training'
    ELSE 'membership'
  END,
  CASE
    WHEN gs % 2 = 0 THEN 'credit_card'
    ELSE 'bank_transfer'
  END,
  'paid',
  'INV-2026-' || LPAD(gs::text, 3, '0'),
  'Oluşturulmuş örnek ödeme kaydı',
  NOW() - ((gs % 25) || ' days')::interval
FROM generate_series(1, 49) AS gs
ON CONFLICT (id) DO NOTHING;
