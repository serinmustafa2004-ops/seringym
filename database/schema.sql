CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE user_role AS ENUM ('member', 'trainer', 'admin');
CREATE TYPE membership_type AS ENUM ('daily', 'monthly', 'yearly');
CREATE TYPE booking_status AS ENUM ('booked', 'cancelled', 'attended');
CREATE TYPE reward_transaction_type AS ENUM ('earn', 'redeem', 'adjustment');

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(120) NOT NULL,
  username VARCHAR(80) UNIQUE,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'member',
  gender VARCHAR(20) NOT NULL DEFAULT 'Belirtilmedi',
  phone VARCHAR(20),
  avatar_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  membership_type membership_type NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  monthly_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  remaining_freezes INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE trainers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(120) NOT NULL,
  specialties TEXT[] NOT NULL DEFAULT '{}',
  bio TEXT NOT NULL,
  hourly_rate NUMERIC(10, 2) NOT NULL,
  years_of_experience INTEGER NOT NULL DEFAULT 0,
  rating_average NUMERIC(3, 2) NOT NULL DEFAULT 0,
  rating_count INTEGER NOT NULL DEFAULT 0,
  is_marketplace_visible BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE trainer_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  issuer VARCHAR(150) NOT NULL,
  issued_at DATE,
  expires_at DATE
);

CREATE TABLE trainer_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (trainer_id, member_id)
);

CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  name VARCHAR(120) NOT NULL,
  category VARCHAR(80) NOT NULL,
  description TEXT NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  starts_at TIMESTAMP NOT NULL,
  ends_at TIMESTAMP NOT NULL,
  room_name VARCHAR(80) NOT NULL
);

CREATE TABLE class_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status booking_status NOT NULL DEFAULT 'booked',
  booked_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (class_id, member_id)
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trainer_id UUID REFERENCES trainers(id) ON DELETE SET NULL,
  amount NUMERIC(10, 2) NOT NULL,
  gym_share NUMERIC(10, 2) NOT NULL DEFAULT 0,
  trainer_share NUMERIC(10, 2) NOT NULL DEFAULT 0,
  currency VARCHAR(8) NOT NULL DEFAULT 'TRY',
  payment_category VARCHAR(40) NOT NULL DEFAULT 'membership',
  payment_method VARCHAR(40) NOT NULL,
  payment_status VARCHAR(40) NOT NULL,
  invoice_no VARCHAR(40),
  membership_months INTEGER,
  session_count INTEGER,
  card_holder_name VARCHAR(120),
  card_last4 VARCHAR(4),
  description TEXT,
  paid_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE member_goals (
  member_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  primary_goal VARCHAR(120) NOT NULL,
  training_level VARCHAR(40) NOT NULL,
  preferred_days_per_week INTEGER NOT NULL DEFAULT 3,
  focus_areas TEXT[] NOT NULL DEFAULT '{}',
  limitations TEXT,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE workout_programs (
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

CREATE TABLE workout_program_days (
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

CREATE TABLE rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  description TEXT NOT NULL,
  points_cost INTEGER NOT NULL CHECK (points_cost >= 0),
  reward_type VARCHAR(40) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE member_reward_wallets (
  member_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  points_balance INTEGER NOT NULL DEFAULT 0,
  lifetime_points INTEGER NOT NULL DEFAULT 0,
  tier_name VARCHAR(40) NOT NULL DEFAULT 'Starter'
);

CREATE TABLE reward_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reward_id UUID REFERENCES rewards(id) ON DELETE SET NULL,
  points INTEGER NOT NULL,
  transaction_type reward_transaction_type NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(60) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(40) NOT NULL
);

CREATE TABLE member_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (member_id, badge_id)
);

CREATE TABLE attendance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  check_in_at TIMESTAMP NOT NULL DEFAULT NOW(),
  check_out_at TIMESTAMP,
  access_method VARCHAR(40) NOT NULL DEFAULT 'qr'
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(140) NOT NULL,
  message TEXT NOT NULL,
  notification_type VARCHAR(40) NOT NULL DEFAULT 'sistem',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_class_bookings_class_id ON class_bookings(class_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_trainer_id ON payments(trainer_id);
CREATE INDEX idx_reward_transactions_member_id ON reward_transactions(member_id);
CREATE INDEX idx_trainer_reviews_trainer_id ON trainer_reviews(trainer_id);
CREATE INDEX idx_workout_programs_member_id ON workout_programs(member_id);
CREATE INDEX idx_workout_programs_trainer_id ON workout_programs(trainer_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
