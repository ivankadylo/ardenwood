-- Add wishlist table
CREATE TABLE wishlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  product_id TEXT NOT NULL, -- Storing slug as requested by app logic
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Update products table for configurator
ALTER TABLE products ADD COLUMN base_price_czk INTEGER;
ALTER TABLE products ADD COLUMN price_per_cm_czk INTEGER;

-- Enable RLS for wishlists
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

-- RLS Policies for wishlists
CREATE POLICY "Users can manage own wishlist" ON wishlists
  USING (auth.uid() = user_id);

CREATE POLICY "Admin sees all wishlists" ON wishlists
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
