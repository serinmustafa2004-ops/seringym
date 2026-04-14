WITH member_names AS (
  SELECT * FROM (
    VALUES
      (1, 'Ahmet Yılmaz'), (2, 'Ayşe Kaya'), (3, 'Mehmet Demir'), (4, 'Fatma Şahin'),
      (5, 'Ali Çelik'), (6, 'Zeynep Arslan'), (7, 'Mustafa Koç'), (8, 'Elif Aydın'),
      (9, 'Hasan Kurt'), (10, 'Merve Polat'), (11, 'Emre Yıldırım'), (12, 'Seda Öztürk'),
      (13, 'Burak Karaca'), (14, 'Ebru Avcı'), (15, 'Onur Kılıç'), (16, 'Cansu Eren'),
      (17, 'Hakan Aslan'), (18, 'Tuğçe Güneş'), (19, 'Kaan Bulut'), (20, 'Büşra Akın'),
      (21, 'Serkan Taş'), (22, 'Gizem Çetin'), (23, 'Tolga Özdemir'), (24, 'Derya Tekin'),
      (25, 'Uğur Korkmaz'), (26, 'İrem Karataş'), (27, 'Barış Şimşek'), (28, 'Pelin Can'),
      (29, 'Furkan Yıldız'), (30, 'Nazlı Ersoy'), (31, 'Murat Doğan'), (32, 'Yasemin Sezer'),
      (33, 'Kerem Acar'), (34, 'Aslı Nur'), (35, 'Volkan Ateş'), (36, 'Hande Çalışkan'),
      (37, 'Caner Özkan'), (38, 'Sinem Yalçın'), (39, 'Deniz Uçar'), (40, 'Esra Toprak'),
      (41, 'Okan Keskin'), (42, 'Nisa Çakır'), (43, 'Arda Tunç'), (44, 'Melis Yurt'),
      (45, 'Eren Kaplan'), (46, 'Selin Korkut'), (47, 'Bora Yüce'), (48, 'İlayda Duman'),
      (49, 'Batuhan Soylu')
  ) AS t(idx, full_name)
)
UPDATE users u
SET
  full_name = mn.full_name,
  email = 'uye' || mn.idx || '@seringym.local'
FROM member_names mn
WHERE u.id = ('90000000-0000-0000-0000-' || LPAD(mn.idx::text, 12, '0'))::uuid;

INSERT INTO attendance_logs (member_id, check_in_at, check_out_at, access_method)
SELECT
  ('90000000-0000-0000-0000-' || LPAD(gs::text, 12, '0'))::uuid,
  NOW() - ((gs % 12) || ' days')::interval - ((gs % 8) || ' hours')::interval,
  NOW() - ((gs % 12) || ' days')::interval - (((gs % 8) - 1) || ' hours')::interval,
  CASE WHEN gs % 2 = 0 THEN 'qr' ELSE 'card' END
FROM generate_series(1, 49) AS gs
ON CONFLICT DO NOTHING;
