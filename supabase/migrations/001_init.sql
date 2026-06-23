-- Users table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  phone TEXT UNIQUE,
  phone_verified BOOLEAN DEFAULT FALSE,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  discount_percent INTEGER DEFAULT 0,
  stripe_customer_id TEXT,
  gdpr_consent BOOLEAN DEFAULT FALSE,
  marketing_consent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name_en TEXT NOT NULL,
  name_de TEXT, name_fr TEXT, name_cs TEXT, name_pl TEXT,
  name_it TEXT, name_es TEXT, name_nl TEXT, name_sk TEXT, name_uk TEXT,
  category TEXT NOT NULL,
  price_czk INTEGER NOT NULL,
  price_from BOOLEAN DEFAULT FALSE,
  discount_percent INTEGER DEFAULT 0,
  discount_for_members_only BOOLEAN DEFAULT FALSE,
  photos TEXT[] DEFAULT '{}',
  video_url TEXT,
  description_en TEXT,
  description_cs TEXT,
  edge_options TEXT[] DEFAULT '{}',
  shade_options TEXT[] DEFAULT '{}',
  frame_options TEXT[] DEFAULT '{}',
  views_count INTEGER DEFAULT 0,
  in_stock BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  guest_email TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','in_production','shipped','delivered','cancelled')),
  items JSONB NOT NULL,
  total_czk INTEGER NOT NULL,
  total_eur INTEGER,
  currency TEXT DEFAULT 'CZK',
  stripe_payment_intent_id TEXT,
  payment_status TEXT DEFAULT 'unpaid',
  shipping_name TEXT,
  shipping_address TEXT,
  shipping_city TEXT,
  shipping_zip TEXT,
  shipping_country TEXT DEFAULT 'CZ',
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Currency rates table
CREATE TABLE currency_rates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  rate_to_czk DECIMAL(10,4) NOT NULL,
  rounding_rule TEXT DEFAULT 'up_to_10',
  is_auto BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default currencies
INSERT INTO currency_rates (code, name, rate_to_czk, is_auto) VALUES
  ('CZK', 'Česká koruna', 1.0000, FALSE),
  ('EUR', 'Euro', 25.5000, TRUE);

-- Phone verification codes
CREATE TABLE phone_verifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product views tracking
CREATE TABLE product_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  user_id UUID REFERENCES profiles(id),
  ip_hash TEXT,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin full access profiles" ON profiles USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Products visible to all" ON products FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admin manages products" ON products USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Users see own orders" ON orders FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admin sees all orders" ON orders USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
