CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  auth_id UUID UNIQUE,
  name VARCHAR(100),
  phone VARCHAR(20),
  province VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crops (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100),
  type VARCHAR(50),
  area DECIMAL(10,2),
  province VARCHAR(50),
  stage VARCHAR(50) DEFAULT 'seedling',
  status VARCHAR(20) DEFAULT 'healthy',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS diagnoses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  disease_name VARCHAR(200),
  confidence DECIMAL(5,2),
  is_healthy BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS irrigation_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount_liters DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS market_listings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  crop_type VARCHAR(100),
  quantity DECIMAL(10,2),
  price_per_unit DECIMAL(10,2),
  province VARCHAR(50),
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crop_prices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  crop_type VARCHAR(100),
  price DECIMAL(10,2),
  market VARCHAR(100),
  province VARCHAR(50),
  change_percent DECIMAL(5,2) DEFAULT 0,
  recorded_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS community_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200),
  body TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO crop_prices (crop_type, price, market, province, change_percent) VALUES
  ('حنطة', 850, 'سوق الحلة', 'بابل', 2.3),
  ('طماطم', 1200, 'سوق بغداد', 'بغداد', -1.1),
  ('تمر زهدي', 3500, 'سوق البصرة', 'البصرة', 0.8),
  ('بطاطا', 600, 'سوق الموصل', 'نينوى', 4.2),
  ('بصل', 650, 'سوق كربلاء', 'كربلاء', -0.5),
  ('خيار', 900, 'سوق النجف', 'النجف', 3.2),
  ('ذرة', 750, 'سوق الديوانية', 'القادسية', 1.8),
  ('باذنجان', 1100, 'سوق الكوت', 'واسط', -2.0)
ON CONFLICT DO NOTHING;

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE irrigation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_policy" ON users FOR ALL USING (auth.uid() = auth_id);
CREATE POLICY "crops_policy" ON crops FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));
CREATE POLICY "diagnoses_policy" ON diagnoses FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));
CREATE POLICY "irrigation_policy" ON irrigation_logs FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));
CREATE POLICY "market_read" ON market_listings FOR SELECT USING (TRUE);
CREATE POLICY "market_write" ON market_listings FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));
CREATE POLICY "prices_policy" ON crop_prices FOR SELECT USING (TRUE);
CREATE POLICY "posts_read" ON community_posts FOR SELECT USING (TRUE);
CREATE POLICY "posts_write" ON community_posts FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));
CREATE POLICY "notif_policy" ON notifications FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));