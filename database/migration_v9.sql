ALTER TABLE users
  ADD COLUMN IF NOT EXISTS gender VARCHAR(20) NOT NULL DEFAULT 'Belirtilmedi';

UPDATE users
SET gender = CASE
  WHEN full_name IN ('Ece Kaya', 'Selin Aras', 'Buse Çetin', 'İpek Çınar') THEN 'Kadın'
  WHEN full_name IN ('Admin Kullanici', 'Mert Yildiz', 'Deniz Aksoy', 'Can Gür', 'Oğuz Mert') THEN 'Erkek'
  ELSE gender
END
WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55554444-4444-4444-4444-444444444444',
  '66665555-5555-5555-5555-555555555555',
  '99990000-0000-0000-0000-000000000001',
  '99990000-0000-0000-0000-000000000002',
  '99990000-0000-0000-0000-000000000003',
  '99990000-0000-0000-0000-000000000004'
);

WITH cinsiyetler AS (
  SELECT * FROM (
    VALUES
      (1, 'Erkek'), (2, 'Kadın'), (3, 'Erkek'), (4, 'Kadın'), (5, 'Erkek'),
      (6, 'Kadın'), (7, 'Erkek'), (8, 'Kadın'), (9, 'Erkek'), (10, 'Kadın'),
      (11, 'Erkek'), (12, 'Kadın'), (13, 'Erkek'), (14, 'Kadın'), (15, 'Erkek'),
      (16, 'Kadın'), (17, 'Erkek'), (18, 'Kadın'), (19, 'Erkek'), (20, 'Kadın'),
      (21, 'Erkek'), (22, 'Kadın'), (23, 'Erkek'), (24, 'Kadın'), (25, 'Erkek'),
      (26, 'Kadın'), (27, 'Erkek'), (28, 'Kadın'), (29, 'Erkek'), (30, 'Kadın'),
      (31, 'Erkek'), (32, 'Kadın'), (33, 'Erkek'), (34, 'Kadın'), (35, 'Erkek'),
      (36, 'Kadın'), (37, 'Erkek'), (38, 'Kadın'), (39, 'Erkek'), (40, 'Kadın')
  ) AS t(idx, gender)
)
UPDATE users u
SET gender = c.gender
FROM cinsiyetler c
WHERE u.id = ('90000000-0000-0000-0000-' || LPAD(c.idx::text, 12, '0'))::uuid;

WITH cinsiyetler AS (
  SELECT gs,
    CASE WHEN gs % 2 = 0 THEN 'Kadın' ELSE 'Erkek' END AS gender
  FROM generate_series(50, 249) gs
)
UPDATE users u
SET gender = c.gender
FROM cinsiyetler c
WHERE u.id = ('93000000-0000-0000-0000-' || LPAD(c.gs::text, 12, '0'))::uuid;
