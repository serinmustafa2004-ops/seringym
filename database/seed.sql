INSERT INTO users (id, full_name, email, password_hash, role, phone, avatar_url)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Admin Kullanici', 'admin@gympro.local', '$2a$10$S9M8FGjJt94suBT76cKi1u0I6N6byN1Nsx3Rp3XIanFkFJxuxMxDP', 'admin', '+905551112233', 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5'),
  ('22222222-2222-2222-2222-222222222222', 'Ece Kaya', 'ece@gympro.local', '$2a$10$S9M8FGjJt94suBT76cKi1u0I6N6byN1Nsx3Rp3XIanFkFJxuxMxDP', 'member', '+905551234567', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2'),
  ('33333333-3333-3333-3333-333333333333', 'Mert Yildiz', 'mert@gympro.local', '$2a$10$S9M8FGjJt94suBT76cKi1u0I6N6byN1Nsx3Rp3XIanFkFJxuxMxDP', 'trainer', '+905559998877', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e'),
  ('44444444-4444-4444-4444-444444444444', 'Selin Aras', 'selin@gympro.local', '$2a$10$S9M8FGjJt94suBT76cKi1u0I6N6byN1Nsx3Rp3XIanFkFJxuxMxDP', 'trainer', '+905556667788', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330');

INSERT INTO memberships (user_id, membership_type, start_date, end_date, is_active, monthly_price, remaining_freezes)
VALUES
  ('22222222-2222-2222-2222-222222222222', 'monthly', CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE + INTERVAL '15 days', TRUE, 1450, 1);

INSERT INTO member_reward_wallets (member_id, points_balance, lifetime_points, tier_name)
VALUES
  ('22222222-2222-2222-2222-222222222222', 420, 980, 'Silver');

INSERT INTO trainers (id, user_id, title, specialties, bio, hourly_rate, years_of_experience, rating_average, rating_count, is_marketplace_visible)
VALUES
  ('55555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333', 'Strength & Conditioning Coach', ARRAY['Fonksiyonel Antrenman', 'Kilo Verme', 'Postur'], 'Guclenme ve vucut kompozisyonu gelisimi odakli calisiyorum.', 900, 6, 4.8, 18, TRUE),
  ('66666666-6666-6666-6666-666666666666', '44444444-4444-4444-4444-444444444444', 'Pilates ve Mobility Uzmani', ARRAY['Pilates', 'Mobility', 'Core'], 'Masa basi calisan uyelere ozel hareket kalitesi programlari hazirliyorum.', 850, 8, 4.9, 24, TRUE);

INSERT INTO trainer_certificates (trainer_id, name, issuer, issued_at)
VALUES
  ('55555555-5555-5555-5555-555555555555', 'NASM CPT', 'NASM', '2022-05-10'),
  ('66666666-6666-6666-6666-666666666666', 'Balanced Body Pilates', 'Balanced Body', '2021-03-18');

INSERT INTO trainer_reviews (trainer_id, member_id, rating, comment)
VALUES
  ('55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 5, 'Programlar cok net ve motive edici.');

INSERT INTO classes (id, trainer_id, name, category, description, capacity, starts_at, ends_at, room_name)
VALUES
  ('77777777-7777-7777-7777-777777777777', '55555555-5555-5555-5555-555555555555', 'HIIT Blast', 'Kardiyo', 'Yuksek tempolu grup dersi.', 16, NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day 50 minutes', 'Studio A'),
  ('88888888-8888-8888-8888-888888888888', '66666666-6666-6666-6666-666666666666', 'Morning Pilates', 'Pilates', 'Baslangic ve orta seviye pilates dersi.', 12, NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days 55 minutes', 'Studio B');

INSERT INTO class_bookings (class_id, member_id, status)
VALUES
  ('77777777-7777-7777-7777-777777777777', '22222222-2222-2222-2222-222222222222', 'booked');

INSERT INTO payments (id, user_id, trainer_id, amount, gym_share, trainer_share, currency, payment_category, payment_method, payment_status, invoice_no, description, paid_at)
VALUES
  ('12121212-1212-1212-1212-121212121212', '22222222-2222-2222-2222-222222222222', NULL, 1450, 1450, 0, 'TRY', 'membership', 'credit_card', 'paid', 'INV-2026-001', 'Aylık üyelik ödemesi', NOW() - INTERVAL '20 days'),
  ('13131313-1313-1313-1313-131313131313', '22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', 1200, 300, 900, 'TRY', 'personal_training', 'credit_card', 'paid', 'INV-2026-002', 'Mert Yıldız ile birebir özel ders paketi', NOW() - INTERVAL '9 days'),
  ('14141414-1414-1414-1414-141414141414', '22222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666666', 850, 150, 700, 'TRY', 'mobility_session', 'bank_transfer', 'paid', 'INV-2026-003', 'Selin Aras ile mobility seansı', NOW() - INTERVAL '4 days');

INSERT INTO rewards (id, name, description, points_cost, reward_type, is_active)
VALUES
  ('99999999-9999-9999-9999-999999999999', 'Protein Bar Hediyesi', 'Kafeden ucretsiz protein bar kazan.', 120, 'perk', TRUE),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Uyelikte %10 Indirim', 'Bir sonraki uyelik yenilemesinde indirim.', 300, 'discount', TRUE),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '1 Ozel Ders', 'Secili antrenorlerle 1 birebir ders.', 500, 'session', TRUE);

INSERT INTO reward_transactions (member_id, points, transaction_type, reason)
VALUES
  ('22222222-2222-2222-2222-222222222222', 200, 'earn', 'Aylik check-in hedefi'),
  ('22222222-2222-2222-2222-222222222222', 120, 'earn', 'Arkadas daveti'),
  ('22222222-2222-2222-2222-222222222222', 100, 'earn', '3 grup dersi tamamlama');

INSERT INTO badges (id, code, name, description, icon)
VALUES
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'first_checkin', 'Ilk Adim', 'Ilk salon girisini tamamladin.', 'shoe'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'class_streak_3', 'Ritmini Bul', 'Uc grup dersine ust uste katildin.', 'flame'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'marketplace_explorer', 'Koc Kasifi', 'Pazar yerinden bir antrenorle calismaya basladin.', 'star');

INSERT INTO member_badges (member_id, badge_id)
VALUES
  ('22222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
  ('22222222-2222-2222-2222-222222222222', 'dddddddd-dddd-dddd-dddd-dddddddddddd');

INSERT INTO attendance_logs (member_id, check_in_at, access_method)
VALUES
  ('22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '1 day', 'qr'),
  ('22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '3 days', 'card');

INSERT INTO member_goals (member_id, primary_goal, training_level, preferred_days_per_week, focus_areas, limitations)
VALUES
  ('22222222-2222-2222-2222-222222222222', 'Yağ oranını düşürüp sıkılaşmak', 'Orta Seviye', 4, ARRAY['Alt Vücut', 'Core', 'Kondisyon'], 'Eski diz hassasiyeti');

INSERT INTO workout_programs (id, trainer_id, member_id, title, goal_summary, notes, status)
VALUES
  ('15151515-1515-1515-1515-151515151515', '55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', '4 Haftalık Güç ve Yağ Yakımı Planı', 'Alt vücut kuvveti ile kondisyonu birlikte ilerletmek.', 'Diz hassasiyeti nedeniyle kontrollü tempo ile ilerle.', 'active'),
  ('16161616-1616-1616-1616-161616161616', '66666666-6666-6666-6666-666666666666', '22222222-2222-2222-2222-222222222222', 'Mobilite ve Core Denge Planı', 'Eklem hareket açıklığını artırırken merkez bölgeyi güçlendirmek.', 'Isınmayı asla atlama.', 'active');

INSERT INTO workout_program_days (id, program_id, day_index, day_label, focus_area, exercise_name, sets, reps, rest_seconds, notes)
VALUES
  ('17171717-1717-1717-1717-171717171717', '15151515-1515-1515-1515-151515151515', 1, 'Pazartesi', 'Alt Vücut Gücü', 'Goblet Squat', '4', '10', 75, 'Ağrı olursa derinliği azalt'),
  ('18181818-1818-1818-1818-181818181818', '15151515-1515-1515-1515-151515151515', 1, 'Pazartesi', 'Alt Vücut Gücü', 'Romanian Deadlift', '4', '12', 75, 'Bel boşluğunu koru'),
  ('19191919-1919-1919-1919-191919191919', '15151515-1515-1515-1515-151515151515', 3, 'Çarşamba', 'Kondisyon', 'Bisiklet Interval', '8 tur', '40 sn / 20 sn', 30, 'Nabzı kontrollü yükselt'),
  ('20202020-2020-2020-2020-202020202020', '15151515-1515-1515-1515-151515151515', 5, 'Cuma', 'Üst Vücut ve Core', 'Incline Push-Up', '4', '12', 60, 'Omuzları aşağıda tut'),
  ('21212121-2121-2121-2121-212121212121', '16161616-1616-1616-1616-161616161616', 2, 'Salı', 'Mobilite', 'World Greatest Stretch', '3', '8', 30, 'Her iki tarafı eşit uygula'),
  ('22212121-2121-2121-2121-212121212121', '16161616-1616-1616-1616-161616161616', 4, 'Perşembe', 'Core', 'Dead Bug', '3', '12', 40, 'Bel zemine yakın kalsın');
