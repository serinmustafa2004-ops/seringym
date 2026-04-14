CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(140) NOT NULL,
  message TEXT NOT NULL,
  notification_type VARCHAR(40) NOT NULL DEFAULT 'sistem',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

INSERT INTO notifications (user_id, title, message, notification_type)
SELECT id, 'SerinGym Bildirim Merkezi', 'Bildirim alanı kullanıma hazır. Yeni ödeme, program ve ödül hareketleri burada görünecek.', 'sistem'
FROM users
ON CONFLICT DO NOTHING;
