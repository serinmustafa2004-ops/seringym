ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS trainer_id UUID REFERENCES trainers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS gym_share NUMERIC(10, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS trainer_share NUMERIC(10, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_category VARCHAR(40) NOT NULL DEFAULT 'membership',
  ADD COLUMN IF NOT EXISTS invoice_no VARCHAR(40);

CREATE TABLE IF NOT EXISTS member_goals (
  member_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  primary_goal VARCHAR(120) NOT NULL,
  training_level VARCHAR(40) NOT NULL,
  preferred_days_per_week INTEGER NOT NULL DEFAULT 3,
  focus_areas TEXT[] NOT NULL DEFAULT '{}',
  limitations TEXT,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workout_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(140) NOT NULL,
  goal_summary TEXT NOT NULL,
  notes TEXT,
  status VARCHAR(40) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workout_program_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES workout_programs(id) ON DELETE CASCADE,
  day_index INTEGER NOT NULL,
  day_label VARCHAR(60) NOT NULL,
  focus_area VARCHAR(120) NOT NULL,
  exercise_name VARCHAR(140) NOT NULL,
  sets VARCHAR(20) NOT NULL,
  reps VARCHAR(20) NOT NULL,
  rest_seconds INTEGER NOT NULL DEFAULT 60,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_payments_trainer_id ON payments(trainer_id);
CREATE INDEX IF NOT EXISTS idx_workout_programs_member_id ON workout_programs(member_id);
CREATE INDEX IF NOT EXISTS idx_workout_programs_trainer_id ON workout_programs(trainer_id);

INSERT INTO payments (id, user_id, trainer_id, amount, gym_share, trainer_share, currency, payment_category, payment_method, payment_status, invoice_no, description, paid_at)
VALUES
  ('12121212-1212-1212-1212-121212121212', '22222222-2222-2222-2222-222222222222', NULL, 1450, 1450, 0, 'TRY', 'membership', 'credit_card', 'paid', 'INV-2026-001', 'Aylık üyelik ödemesi', NOW() - INTERVAL '20 days'),
  ('13131313-1313-1313-1313-131313131313', '22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', 1200, 300, 900, 'TRY', 'personal_training', 'credit_card', 'paid', 'INV-2026-002', 'Mert Yıldız ile birebir özel ders paketi', NOW() - INTERVAL '9 days'),
  ('14141414-1414-1414-1414-141414141414', '22222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666666', 850, 150, 700, 'TRY', 'mobility_session', 'bank_transfer', 'paid', 'INV-2026-003', 'Selin Aras ile mobility seansı', NOW() - INTERVAL '4 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO member_goals (member_id, primary_goal, training_level, preferred_days_per_week, focus_areas, limitations)
VALUES
  ('22222222-2222-2222-2222-222222222222', 'Yağ oranını düşürüp sıkılaşmak', 'Orta Seviye', 4, ARRAY['Alt Vücut', 'Core', 'Kondisyon'], 'Eski diz hassasiyeti')
ON CONFLICT (member_id) DO NOTHING;

INSERT INTO workout_programs (id, trainer_id, member_id, title, goal_summary, notes, status)
VALUES
  ('15151515-1515-1515-1515-151515151515', '55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', '4 Haftalık Güç ve Yağ Yakımı Planı', 'Alt vücut kuvveti ile kondisyonu birlikte ilerletmek.', 'Diz hassasiyeti nedeniyle kontrollü tempo ile ilerle.', 'active'),
  ('16161616-1616-1616-1616-161616161616', '66666666-6666-6666-6666-666666666666', '22222222-2222-2222-2222-222222222222', 'Mobilite ve Core Denge Planı', 'Eklem hareket açıklığını artırırken merkez bölgeyi güçlendirmek.', 'Isınmayı asla atlama.', 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO workout_program_days (id, program_id, day_index, day_label, focus_area, exercise_name, sets, reps, rest_seconds, notes)
VALUES
  ('17171717-1717-1717-1717-171717171717', '15151515-1515-1515-1515-151515151515', 1, 'Pazartesi', 'Alt Vücut Gücü', 'Goblet Squat', '4', '10', 75, 'Ağrı olursa derinliği azalt'),
  ('18181818-1818-1818-1818-181818181818', '15151515-1515-1515-1515-151515151515', 1, 'Pazartesi', 'Alt Vücut Gücü', 'Romanian Deadlift', '4', '12', 75, 'Bel boşluğunu koru'),
  ('19191919-1919-1919-1919-191919191919', '15151515-1515-1515-1515-151515151515', 3, 'Çarşamba', 'Kondisyon', 'Bisiklet Interval', '8 tur', '40 sn / 20 sn', 30, 'Nabzı kontrollü yükselt'),
  ('20202020-2020-2020-2020-202020202020', '15151515-1515-1515-1515-151515151515', 5, 'Cuma', 'Üst Vücut ve Core', 'Incline Push-Up', '4', '12', 60, 'Omuzları aşağıda tut'),
  ('21212121-2121-2121-2121-212121212121', '16161616-1616-1616-1616-161616161616', 2, 'Salı', 'Mobilite', 'World Greatest Stretch', '3', '8', 30, 'Her iki tarafı eşit uygula'),
  ('22212121-2121-2121-2121-212121212121', '16161616-1616-1616-1616-161616161616', 4, 'Perşembe', 'Core', 'Dead Bug', '3', '12', 40, 'Bel zemine yakın kalsın')
ON CONFLICT (id) DO NOTHING;
