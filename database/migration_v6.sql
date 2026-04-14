INSERT INTO users (id, full_name, email, password_hash, role, phone, avatar_url)
VALUES
  ('99990000-0000-0000-0000-000000000001', 'Can Gür', 'can.gur@seringym.local', '$2a$10$S9M8FGjJt94suBT76cKi1u0I6N6byN1Nsx3Rp3XIanFkFJxuxMxDP', 'trainer', '+905554040404', 'https://images.unsplash.com/photo-1541534401786-2077eed87a72'),
  ('99990000-0000-0000-0000-000000000002', 'Eda Yurt', 'eda.yurt@seringym.local', '$2a$10$S9M8FGjJt94suBT76cKi1u0I6N6byN1Nsx3Rp3XIanFkFJxuxMxDP', 'trainer', '+905555050505', 'https://images.unsplash.com/photo-1518611012118-696072aa579a'),
  ('99990000-0000-0000-0000-000000000003', 'Oğuz Mert', 'oguz.mert@seringym.local', '$2a$10$S9M8FGjJt94suBT76cKi1u0I6N6byN1Nsx3Rp3XIanFkFJxuxMxDP', 'trainer', '+905556060606', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438'),
  ('99990000-0000-0000-0000-000000000004', 'İpek Çınar', 'ipek.cinar@seringym.local', '$2a$10$S9M8FGjJt94suBT76cKi1u0I6N6byN1Nsx3Rp3XIanFkFJxuxMxDP', 'trainer', '+905557070707', 'https://images.unsplash.com/photo-1518310383802-640c2de311b2')
ON CONFLICT (id) DO NOTHING;

INSERT INTO trainers (id, user_id, title, specialties, bio, hourly_rate, years_of_experience, rating_average, rating_count, is_marketplace_visible)
VALUES
  ('99991000-0000-0000-0000-000000000001', '99990000-0000-0000-0000-000000000001', 'Dayanıklılık ve Kardiyo Koçu', ARRAY['Koşu', 'Kondisyon', 'Dayanıklılık'], 'Uzun süreli kondisyon gelişimi ve yağ yakımı planları hazırlıyorum.', 920, 9, 4.8, 33, TRUE),
  ('99991000-0000-0000-0000-000000000002', '99990000-0000-0000-0000-000000000002', 'Kadın Güçlenme Uzmanı', ARRAY['Güç', 'Sıkılaşma', 'Postür'], 'Kadın üyeler için güçlenme ve sıkılaşma temelli programlar tasarlıyorum.', 970, 10, 4.9, 41, TRUE),
  ('99991000-0000-0000-0000-000000000003', '99990000-0000-0000-0000-000000000003', 'Cross Training Koçu', ARRAY['Cross Training', 'HIIT', 'Patlayıcı Güç'], 'Yüksek tempolu antrenmanları kontrollü teknikle birleştiriyorum.', 980, 8, 4.7, 28, TRUE),
  ('99991000-0000-0000-0000-000000000004', '99990000-0000-0000-0000-000000000004', 'Pilates ve Reformer Eğitmeni', ARRAY['Reformer', 'Pilates', 'Esneklik'], 'Esneklik, merkez bölge ve postür gelişimine odaklanıyorum.', 890, 11, 4.9, 36, TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO trainer_certificates (trainer_id, name, issuer, issued_at)
VALUES
  ('99991000-0000-0000-0000-000000000001', 'ACE Fitness Nutrition', 'ACE', '2022-11-11'),
  ('99991000-0000-0000-0000-000000000002', 'Women Strength Specialist', 'NASM', '2023-02-09'),
  ('99991000-0000-0000-0000-000000000003', 'Cross Training Performance', 'FMS', '2021-06-17'),
  ('99991000-0000-0000-0000-000000000004', 'Reformer Advanced Coach', 'Balanced Body', '2022-04-05')
ON CONFLICT DO NOTHING;

WITH adlar AS (
  SELECT ARRAY[
    'Ahmet','Ayşe','Mehmet','Fatma','Ali','Zeynep','Mustafa','Elif','Hasan','Merve',
    'Emre','Seda','Burak','Ebru','Onur','Cansu','Hakan','Tuğçe','Kaan','Büşra',
    'Serkan','Gizem','Tolga','Derya','Uğur','İrem','Barış','Pelin','Furkan','Nazlı',
    'Murat','Yasemin','Kerem','Aslı','Volkan','Hande','Caner','Sinem','Deniz','Esra'
  ] AS adlar,
  ARRAY[
    'Yılmaz','Kaya','Demir','Şahin','Çelik','Arslan','Koç','Aydın','Kurt','Polat',
    'Yıldırım','Öztürk','Karaca','Avcı','Kılıç','Eren','Aslan','Güneş','Bulut','Akın',
    'Taş','Çetin','Özdemir','Tekin','Korkmaz','Karataş','Şimşek','Can','Doğan','Sezer',
    'Acar','Toprak','Ateş','Çalışkan','Özkan','Yalçın','Uçar','Kaplan','Yüce','Duman'
  ] AS soyadlar
)
INSERT INTO users (id, full_name, email, password_hash, role, phone, avatar_url)
SELECT
  ('93000000-0000-0000-0000-' || LPAD(gs::text, 12, '0'))::uuid,
  (adlar.adlar[((gs - 50) % 40) + 1] || ' ' || adlar.soyadlar[((gs - 50) % 40) + 1]),
  'uye' || gs || '@seringym.local',
  '$2a$10$S9M8FGjJt94suBT76cKi1u0I6N6byN1Nsx3Rp3XIanFkFJxuxMxDP',
  'member',
  '+90554' || LPAD((200000 + gs)::text, 6, '0'),
  NULL
FROM generate_series(50, 249) AS gs
CROSS JOIN adlar
ON CONFLICT (id) DO NOTHING;

INSERT INTO memberships (user_id, membership_type, start_date, end_date, is_active, monthly_price, remaining_freezes)
SELECT
  ('93000000-0000-0000-0000-' || LPAD(gs::text, 12, '0'))::uuid,
  CASE
    WHEN gs % 3 = 0 THEN 'yearly'::membership_type
    WHEN gs % 2 = 0 THEN 'monthly'::membership_type
    ELSE 'daily'::membership_type
  END,
  CURRENT_DATE - ((gs % 45) || ' days')::interval,
  CURRENT_DATE + ((30 + gs % 90) || ' days')::interval,
  TRUE,
  CASE
    WHEN gs % 3 = 0 THEN 1350
    WHEN gs % 2 = 0 THEN 1600
    ELSE 300
  END,
  1
FROM generate_series(50, 249) AS gs
ON CONFLICT DO NOTHING;

INSERT INTO member_goals (member_id, primary_goal, training_level, preferred_days_per_week, focus_areas, limitations)
SELECT
  ('93000000-0000-0000-0000-' || LPAD(gs::text, 12, '0'))::uuid,
  CASE
    WHEN gs % 4 = 0 THEN 'Kas kütlesi kazanmak'
    WHEN gs % 3 = 0 THEN 'Yağ yakmak'
    WHEN gs % 2 = 0 THEN 'Sıkılaşmak'
    ELSE 'Genel kondisyon artırmak'
  END,
  CASE
    WHEN gs % 4 = 0 THEN 'İleri Seviye'
    WHEN gs % 3 = 0 THEN 'Orta Seviye'
    ELSE 'Başlangıç'
  END,
  3 + (gs % 4),
  CASE
    WHEN gs % 4 = 0 THEN ARRAY['Üst Vücut', 'Güç']
    WHEN gs % 3 = 0 THEN ARRAY['Kardiyo', 'Alt Vücut']
    WHEN gs % 2 = 0 THEN ARRAY['Core', 'Mobilite']
    ELSE ARRAY['Duruş', 'Genel Kuvvet']
  END,
  NULL
FROM generate_series(50, 249) AS gs
ON CONFLICT (member_id) DO NOTHING;

UPDATE member_reward_wallets
SET
  points_balance = 5000,
  lifetime_points = GREATEST(lifetime_points, 8000),
  tier_name = 'Gold';

INSERT INTO member_reward_wallets (member_id, points_balance, lifetime_points, tier_name)
SELECT
  CASE
    WHEN gs <= 49 THEN ('90000000-0000-0000-0000-' || LPAD(gs::text, 12, '0'))::uuid
    ELSE ('93000000-0000-0000-0000-' || LPAD(gs::text, 12, '0'))::uuid
  END,
  5000,
  8000 + gs * 2,
  'Gold'
FROM generate_series(1, 249) AS gs
ON CONFLICT (member_id) DO UPDATE
SET
  points_balance = 5000,
  lifetime_points = GREATEST(member_reward_wallets.lifetime_points, EXCLUDED.lifetime_points),
  tier_name = 'Gold';

UPDATE member_reward_wallets
SET
  points_balance = 5000,
  lifetime_points = GREATEST(lifetime_points, 9000),
  tier_name = 'Gold'
WHERE member_id = '22222222-2222-2222-2222-222222222222';

INSERT INTO trainer_reviews (trainer_id, member_id, rating, comment)
SELECT
  CASE (gs % 8)
    WHEN 0 THEN '55555555-5555-5555-5555-555555555555'::uuid
    WHEN 1 THEN '66666666-6666-6666-6666-666666666666'::uuid
    WHEN 2 THEN '77776666-6666-6666-6666-666666666666'::uuid
    WHEN 3 THEN '88887777-7777-7777-7777-777777777777'::uuid
    WHEN 4 THEN '99991000-0000-0000-0000-000000000001'::uuid
    WHEN 5 THEN '99991000-0000-0000-0000-000000000002'::uuid
    WHEN 6 THEN '99991000-0000-0000-0000-000000000003'::uuid
    ELSE '99991000-0000-0000-0000-000000000004'::uuid
  END,
  CASE
    WHEN gs <= 49 THEN ('90000000-0000-0000-0000-' || LPAD(gs::text, 12, '0'))::uuid
    ELSE ('93000000-0000-0000-0000-' || LPAD(gs::text, 12, '0'))::uuid
  END,
  4 + (gs % 2),
  CASE
    WHEN gs % 4 = 0 THEN 'Uzun süredir beraber çalışıyoruz, planlaması ve takibi gerçekten çok güçlü.'
    WHEN gs % 4 = 1 THEN 'Salonun en disiplinli antrenörlerinden biri, sonuçlarımı net gördüm.'
    WHEN gs % 4 = 2 THEN 'İletişimi çok iyi, hareketleri doğru öğretip motive ediyor.'
    ELSE 'Programlar uzun vadede sürdürülebilir ve üyeyi gerçekten takip ediyor.'
  END
FROM generate_series(1, 180) AS gs
ON CONFLICT (trainer_id, member_id) DO NOTHING;

UPDATE trainers t
SET
  rating_average = stats.avg_rating,
  rating_count = stats.review_count
FROM (
  SELECT trainer_id, ROUND(AVG(rating)::numeric, 2) AS avg_rating, COUNT(*) AS review_count
  FROM trainer_reviews
  GROUP BY trainer_id
) AS stats
WHERE stats.trainer_id = t.id;

INSERT INTO payments (id, user_id, trainer_id, amount, gym_share, trainer_share, currency, payment_category, payment_method, payment_status, invoice_no, description, paid_at)
SELECT
  ('94000000-0000-0000-0000-' || LPAD(gs::text, 12, '0'))::uuid,
  ('93000000-0000-0000-0000-' || LPAD(gs::text, 12, '0'))::uuid,
  CASE (gs % 8)
    WHEN 0 THEN '55555555-5555-5555-5555-555555555555'::uuid
    WHEN 1 THEN '66666666-6666-6666-6666-666666666666'::uuid
    WHEN 2 THEN '77776666-6666-6666-6666-666666666666'::uuid
    WHEN 3 THEN '88887777-7777-7777-7777-777777777777'::uuid
    WHEN 4 THEN '99991000-0000-0000-0000-000000000001'::uuid
    WHEN 5 THEN '99991000-0000-0000-0000-000000000002'::uuid
    WHEN 6 THEN '99991000-0000-0000-0000-000000000003'::uuid
    ELSE '99991000-0000-0000-0000-000000000004'::uuid
  END,
  1100 + (gs * 8),
  320 + (gs % 6) * 15,
  780 + (gs % 7) * 25,
  'TRY',
  CASE
    WHEN gs % 3 = 0 THEN 'personal_training'
    WHEN gs % 3 = 1 THEN 'membership'
    ELSE 'mobility_session'
  END,
  CASE
    WHEN gs % 2 = 0 THEN 'credit_card'
    ELSE 'bank_transfer'
  END,
  'paid',
  'INV-SG-' || LPAD(gs::text, 4, '0'),
  'Uzun süreli işletme verisi için oluşturulmuş ödeme kaydı',
  NOW() - ((gs % 120) || ' days')::interval
FROM generate_series(50, 249) AS gs
ON CONFLICT (id) DO NOTHING;

INSERT INTO attendance_logs (id, member_id, check_in_at, check_out_at, access_method)
SELECT
  ('95000000-0000-0000-' || LPAD(gs::text, 4, '0') || '-' || LPAD(visit_no::text, 12, '0'))::uuid,
  CASE
    WHEN gs <= 49 THEN ('90000000-0000-0000-0000-' || LPAD(gs::text, 12, '0'))::uuid
    ELSE ('93000000-0000-0000-0000-' || LPAD(gs::text, 12, '0'))::uuid
  END,
  NOW() - ((gs % 90) || ' days')::interval - ((visit_no * 3 + gs % 5) || ' hours')::interval,
  NOW() - ((gs % 90) || ' days')::interval - (((visit_no * 3 + gs % 5) - 1) || ' hours')::interval,
  CASE WHEN (gs + visit_no) % 2 = 0 THEN 'qr' ELSE 'card' END
FROM generate_series(1, 249) AS gs
CROSS JOIN generate_series(1, 4) AS visit_no
ON CONFLICT (id) DO NOTHING;
